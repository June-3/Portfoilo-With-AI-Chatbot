import { getProfile } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { buildKnowledgeBase, retrieveChunks } from "@/lib/knowledge-base";
import { pickLocalized, type Lang } from "@/lib/i18n";

/**
 * AI 助手核心：检索知识库 → 生成回答。/ AI assistant core: retrieve from the
 * knowledge base, then generate an answer.
 *
 * 1. 检索不到相关内容（置信度低于阈值）时，直接返回预设拒绝话术，不调用大模型。
 * 2. 未配置 DeepSeek API Key 时，降级为直接返回检索到的知识内容（便于本地演示）。
 * 3. 配置了 API Key 时，将知识上下文 + 系统提示（知识边界）发给 DeepSeek 生成回答。
 *
 * 1. Returns a canned refusal when nothing relevant is retrieved (no model call).
 * 2. Falls back to raw retrieved content when no DeepSeek API key is configured.
 * 3. Otherwise sends context + a system prompt (knowledge boundary) to DeepSeek.
 *
 * API Key / 模型从 lib/settings.ts 读取（后台可编辑）。
 */

const REJECTION_MESSAGE_ZH =
  "抱歉，这个问题我不太清楚，我的知识库中并没有记载相关内容，或不被允许回答无关问题。";
const REJECTION_MESSAGE_EN =
  "Sorry, I'm not sure about that. My knowledge base doesn't contain this information, or I'm not allowed to answer unrelated questions.";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AnswerResult {
  reply: string;
  /** 本轮消耗的 token 数（估算或 API 实际返回）。/ Tokens used this turn. */
  tokenUsage: number;
  /** 是否在知识库中检索到了相关内容。/ Whether relevant content was found. */
  usedKnowledge: boolean;
}

function rejectionMessage(lang: Lang): string {
  return lang === "en" ? REJECTION_MESSAGE_EN : REJECTION_MESSAGE_ZH;
}

/** 粗略的 token 估算（无 API 时使用，中文约 1 字 ≈ 1 token）。/ Rough token estimate. */
function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 2));
}

function buildSystemPrompt(ownerName: string, context: string, lang: Lang): string {
  if (lang === "en") {
    return [
      `You are "${ownerName}"'s personal AI assistant. Help visitors learn about ${ownerName}'s experience, projects, skills, and contact info.`,
      "",
      "Strictly follow these rules:",
      `1. Only answer questions about ${ownerName} (experience, projects, skills, contact, collaboration, etc.).`,
      "2. Base your answer strictly on the knowledge-base material below; do not invent anything it does not contain.",
      "3. If a question is unrelated to the owner, or the knowledge base has no relevant info, reply with ONLY this exact sentence, with no extra explanation:",
      `"${REJECTION_MESSAGE_EN}"`,
      '4. If the visitor expresses interest in collaboration, a private chat, or contacting the owner, kindly direct them to click the "Request a Private Chat" button in the chat window.',
      "5. Reply in the same language the visitor uses, and keep answers concise, friendly, and well organized.",
      "",
      "Knowledge base material:",
      context,
    ].join("\n");
  }

  return [
    `你是「${ownerName}」的个人 AI 助手，负责帮助访客了解 ${ownerName} 的经历、项目、技能和联系方式。`,
    "",
    "请严格遵守以下规则：",
    `1. 只回答与 ${ownerName} 相关的问题（如经历、项目、技能、联系方式、合作意向等）。`,
    "2. 回答必须严格基于下面提供的「知识库资料」，不要编造资料中不存在的信息。",
    `3. 如果访客的问题与 ${ownerName} 无关，或知识库中没有相关信息，请只回复下面这句固定话术，不要做任何扩展或解释：`,
    `「${REJECTION_MESSAGE_ZH}」`,
    "4. 如果访客表达了合作、私聊、联系、雇佣等意向，请友好地引导他点击聊天窗口里的「私聊申请」按钮提交申请。",
    "5. 使用访客所使用的语言，回答要简洁、友好、有条理。",
    "",
    "知识库资料：",
    context,
  ].join("\n");
}

export async function answerQuestion(
  query: string,
  history: ChatMessage[],
  lang: Lang = "en",
): Promise<AnswerResult> {
  const chunks = await buildKnowledgeBase(lang);
  const retrieved = retrieveChunks(query, chunks, 4);

  // 1) 知识库无相关内容 → 直接拒绝 / Nothing relevant → refuse
  if (retrieved.length === 0) {
    return {
      reply: rejectionMessage(lang),
      tokenUsage: estimateTokens(query),
      usedKnowledge: false,
    };
  }

  const context = retrieved
    .map((r) => `【${r.chunk.title}】\n${r.chunk.content}`)
    .join("\n\n");

  const profile = await getProfile();
  const ownerName = profile.ok
    ? pickLocalized(lang, profile.data.name, profile.data.name_en)
    : lang === "en"
      ? "the owner"
      : "站长";

  const settings = getSettings();

  // 2) 未配置 API Key → 降级：直接返回最相关的知识内容 / No key → return raw content
  if (!settings.deepseekApiKey) {
    const top = retrieved[0].chunk;
    return {
      reply: top.content,
      tokenUsage: estimateTokens(query + top.content),
      usedKnowledge: true,
    };
  }

  // 3) 调用 DeepSeek / Call DeepSeek
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(ownerName, context, lang) },
    ...history.slice(-6),
    { role: "user", content: query },
  ];

  try {
    const response = await fetch(`${settings.deepseekBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: settings.deepseekModel,
        messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DeepSeek API 错误 ${response.status}: ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    const reply: string | undefined = data?.choices?.[0]?.message?.content?.trim();
    const usage: number =
      typeof data?.usage?.total_tokens === "number"
        ? data.usage.total_tokens
        : estimateTokens(query + context + (reply ?? ""));

    if (!reply) throw new Error("DeepSeek 返回内容为空");

    return { reply, tokenUsage: usage, usedKnowledge: true };
  } catch (error) {
    // API 调用失败时降级为知识库内容 / Fall back to retrieved content on failure
    console.error("[ai] DeepSeek 调用失败，降级为知识库回答：", error);
    const top = retrieved[0].chunk;
    return {
      reply: top.content,
      tokenUsage: estimateTokens(query + top.content),
      usedKnowledge: true,
    };
  }
}

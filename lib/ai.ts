import { getProfile } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { buildKnowledgeBase, retrieveChunks } from "@/lib/knowledge-base";
import { pickLocalized, type Lang } from "@/lib/i18n";
import {
  buildCodeContext,
  isCodeRetrievalConfigured,
  retrieveCodeChunks,
} from "@/lib/code-retrieval";

/**
 * AI 助手核心：检索知识库 → 生成回答。/ AI assistant core: retrieve → answer.
 *
 * 检索顺序（为提升容忍度）：个人简介知识库优先 → 未命中时兜底已上传代码库的
 * 向量检索 → 两者都未命中才返回宽容提示（并给出建议问法）。
 * Retrieval order (for higher tolerance): profile KB first → fall back to the
 * uploaded code library's vector search on a miss → only reply with a tolerant
 * hint (plus suggested phrasings) when both miss.
 *
 * 未配置 DeepSeek API Key 时降级为返回检索原文；配置后调用 DeepSeek 生成。
 * Without a DeepSeek key it returns raw retrieved text; otherwise it calls DeepSeek.
 */

const FALLBACK_ZH =
  "抱歉，我在站长的个人知识库和你上传的代码库中都没有找到与这个问题直接相关的内容。你可以换个问法试试，例如：这个项目有哪些功能？某个功能在哪个文件？某个函数是怎么实现的？我会根据已上传的代码来回答。";
const FALLBACK_EN =
  "Sorry, I couldn't find anything directly related to this in the owner's profile knowledge base or your uploaded code. Try rephrasing, for example: What features does this project have? Where is a certain feature implemented? How does a certain function work? I can answer based on the uploaded code.";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AnswerResult {
  reply: string;
  /** 本轮消耗的 token 数（估算或 API 实际返回）。/ Tokens used this turn. */
  tokenUsage: number;
  /** 是否检索到了相关内容。/ Whether relevant content was found. */
  usedKnowledge: boolean;
}

function rejectionMessage(lang: Lang): string {
  return lang === "en" ? FALLBACK_EN : FALLBACK_ZH;
}

/** 粗略的 token 估算（无 API 时使用）。/ Rough token estimate. */
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
      `"${FALLBACK_EN}"`,
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
    `「${FALLBACK_ZH}」`,
    "4. 如果访客表达了合作、私聊、联系、雇佣等意向，请友好地引导他点击聊天窗口里的「私聊申请」按钮提交申请。",
    "5. 使用访客所使用的语言，回答要简洁、友好、有条理。",
    "",
    "知识库资料：",
    context,
  ].join("\n");
}

/** 统一的「生成回答」：无 Key 返回降级内容，有 Key 调 DeepSeek。/ Shared answer generator. */
async function generateAnswer(
  query: string,
  history: ChatMessage[],
  lang: Lang,
  systemPrompt: string,
  context: string,
  fallbackReply: string,
): Promise<AnswerResult> {
  const settings = getSettings();

  if (!settings.deepseekApiKey) {
    return {
      reply: fallbackReply,
      tokenUsage: estimateTokens(query + fallbackReply),
      usedKnowledge: true,
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: systemPrompt },
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
    console.error("[ai] DeepSeek 调用失败，降级为检索内容：", error);
    return {
      reply: fallbackReply,
      tokenUsage: estimateTokens(query + fallbackReply),
      usedKnowledge: true,
    };
  }
}

/** 知识库「强命中」分数阈值 / Strong KB-match score threshold. */
const KB_STRONG_SCORE = 2;
/** 代码向量检索相似度阈值（0–1）／Code vector-search similarity threshold (0–1). */
const CODE_SCORE_THRESHOLD = 0.25;

export async function answerQuestion(
  query: string,
  history: ChatMessage[],
  lang: Lang = "en",
): Promise<AnswerResult> {
  // 1) 个人简介知识库：仅强命中才采用 / Profile KB: use only on a strong match
  const chunks = await buildKnowledgeBase(lang);
  const kbHits = retrieveChunks(query, chunks, 4);
  const kbStrong = kbHits.length > 0 && kbHits[0].score >= KB_STRONG_SCORE;

  if (kbStrong) {
    const context = kbHits
      .map((r) => `【${r.chunk.title}】\n${r.chunk.content}`)
      .join("\n\n");

    const profile = await getProfile();
    const ownerName = profile.ok
      ? pickLocalized(lang, profile.data.name, profile.data.name_en)
      : lang === "en"
        ? "the owner"
        : "站长";

    const systemPrompt = buildSystemPrompt(ownerName, context, lang);
    return generateAnswer(
      query,
      history,
      lang,
      systemPrompt,
      context,
      kbHits[0].chunk.content,
    );
  }

  // 2) 兜底：已上传代码库的向量检索（需达到相似度阈值）/ Fallback: vector search
  //    over the uploaded code, requiring a similarity threshold.
  if (isCodeRetrievalConfigured()) {
    const codeHits = await retrieveCodeChunks(query, 8);
    const strongCode = codeHits.filter((h) => h.score >= CODE_SCORE_THRESHOLD);
    if (strongCode.length > 0) {
      const code = buildCodeContext(query, strongCode, lang);
      return generateAnswer(
        query,
        history,
        lang,
        code.systemPrompt,
        code.context,
        strongCode[0].text,
      );
    }
  }

  // 3) 两者都未强命中 → 宽容提示 / Neither strongly matched → tolerant hint
  return {
    reply: rejectionMessage(lang),
    tokenUsage: estimateTokens(query),
    usedKnowledge: false,
  };
}

import { getProfile } from "@/lib/content";
import { buildKnowledgeBase, retrieveChunks } from "@/lib/knowledge-base";

/**
 * AI 助手核心：检索知识库 → 生成回答。
 *
 * 1. 检索不到相关内容（置信度低于阈值）时，直接返回预设拒绝话术，不调用大模型。
 * 2. 未配置 DEEPSEEK_API_KEY 时，降级为直接返回检索到的知识内容（便于本地演示）。
 * 3. 配置了 API Key 时，将知识上下文 + 系统提示（知识边界）发给 DeepSeek 生成回答。
 */

const REJECTION_MESSAGE =
  "抱歉，这个问题我不太清楚，我的知识库中并没有记载相关内容，或不被允许回答无关问题。";

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AnswerResult {
  reply: string;
  /** 本轮消耗的 token 数（估算或 API 实际返回）。 */
  tokenUsage: number;
  /** 是否在知识库中检索到了相关内容。 */
  usedKnowledge: boolean;
}

/** 粗略的 token 估算（无 API 时使用，中文约 1 字 ≈ 1 token）。 */
function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 2));
}

function buildSystemPrompt(ownerName: string, context: string): string {
  return [
    `你是「${ownerName}」的个人 AI 助手，负责帮助访客了解 ${ownerName} 的经历、项目、技能和联系方式。`,
    "",
    "请严格遵守以下规则：",
    `1. 只回答与 ${ownerName} 相关的问题（如经历、项目、技能、联系方式、合作意向等）。`,
    "2. 回答必须严格基于下面提供的「知识库资料」，不要编造资料中不存在的信息。",
    `3. 如果访客的问题与 ${ownerName} 无关，或知识库中没有相关信息，请只回复下面这句固定话术，不要做任何扩展或解释：`,
    `「${REJECTION_MESSAGE}」`,
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
): Promise<AnswerResult> {
  const chunks = await buildKnowledgeBase();
  const retrieved = retrieveChunks(query, chunks, 4);

  // 1) 知识库无相关内容 → 直接拒绝
  if (retrieved.length === 0) {
    return {
      reply: REJECTION_MESSAGE,
      tokenUsage: estimateTokens(query),
      usedKnowledge: false,
    };
  }

  const context = retrieved
    .map((r) => `【${r.chunk.title}】\n${r.chunk.content}`)
    .join("\n\n");

  const profile = await getProfile();
  const ownerName = profile.ok ? profile.data.name : "站长";

  const apiKey = process.env.DEEPSEEK_API_KEY;

  // 2) 未配置 API Key → 降级：直接返回最相关的知识内容
  if (!apiKey) {
    const top = retrieved[0].chunk;
    return {
      reply: top.content,
      tokenUsage: estimateTokens(query + top.content),
      usedKnowledge: true,
    };
  }

  // 3) 调用 DeepSeek
  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemPrompt(ownerName, context) },
    ...history.slice(-6),
    { role: "user", content: query },
  ];

  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 800,
        stream: false,
      }),
      // 给 DeepSeek 一个合理的超时上限，避免请求悬挂
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
    // API 调用失败时降级为知识库内容，避免聊天中断
    console.error("[ai] DeepSeek 调用失败，降级为知识库回答：", error);
    const top = retrieved[0].chunk;
    return {
      reply: top.content,
      tokenUsage: estimateTokens(query + top.content),
      usedKnowledge: true,
    };
  }
}

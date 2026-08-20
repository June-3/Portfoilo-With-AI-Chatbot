import { embedQuery, isJinaConfigured } from "@/lib/jina";
import {
  getVectorStore,
  isVectorStoreConfigured,
  type CodeChunkHit,
} from "@/lib/pgvector";
import type { Lang } from "@/lib/i18n";

/**
 * 代码级检索（RAG）/ Code-level retrieval (RAG).
 *
 * 判断问题是否为「代码问题」，若是且已配置 Jina + Supabase，则走 pgvector 检索，
 * 命中后把代码块作为上下文（带文件来源）交给大模型。
 * Detects "code" questions and, when Jina + Supabase are configured, retrieves
 * matching code chunks from pgvector to use as context (with file provenance).
 */

const CODE_KEYWORDS = [
  "代码", "实现", "函数", "类", "技术栈", "怎么实现", "如何实现", "哪个文件",
  "在哪", "哪里", "函数名", "源码", "架构", "依赖",
  "code", "implementation", "function", "class", "tech stack", "how does",
  "how is", "implemented", "which file", "where is", "source code", "architecture",
  "dependency",
];

export function isCodeRetrievalConfigured(): boolean {
  return isJinaConfigured() && isVectorStoreConfigured();
}

export function isCodeQuestion(query: string): boolean {
  const q = query.toLowerCase();
  return CODE_KEYWORDS.some((k) => q.includes(k.toLowerCase()));
}

export async function retrieveCodeChunks(query: string, topK = 8): Promise<CodeChunkHit[]> {
  if (!isCodeRetrievalConfigured()) return [];
  try {
    const embedding = await embedQuery(query);
    const store = getVectorStore();
    return await store.query(embedding, undefined, topK);
  } catch (err) {
    console.error("[code-retrieval] 检索失败 / retrieval failed:", err);
    return [];
  }
}

export interface CodeContext {
  context: string;
  systemPrompt: string;
}

/** 把命中的代码块拼成上下文与系统提示。/ Build context + system prompt from code hits. */
export function buildCodeContext(
  query: string,
  hits: CodeChunkHit[],
  lang: Lang,
): CodeContext {
  const context = hits
    .map(
      (h) =>
        `【${h.path}${h.symbol ? ` (${h.symbol})` : ""}】\n${h.text}`,
    )
    .join("\n\n");

  if (lang === "en") {
    return {
      context,
      systemPrompt: [
        "You are the owner's personal AI assistant. A visitor is asking a question that may relate to the owner's uploaded code projects.",
        "",
        "Answer in a friendly, natural, and well-organized way — like chatting with someone who wants to get to know the owner — NOT like a code review.",
        "",
        "Rules:",
        "1. Use the code snippets below as factual background, but present your answer in plain language a casual visitor can understand.",
        "2. Focus on what the project does, its main purpose, features, and the technology involved.",
        "3. Unless the visitor explicitly asks for technical details, do NOT dump raw file names, code blocks, or internal implementation details.",
        "4. Do not reference file paths as if they were clickable links — this site has no code navigation.",
        "5. If the snippets are not enough to answer, say so honestly and briefly, and stay friendly.",
        "6. Reply in the same language the visitor uses; keep it concise.",
        "",
        "Reference material (background only):",
        context,
      ].join("\n"),
    };
  }

  return {
    context,
    systemPrompt: [
      "你是站长的个人 AI 助手。访客的问题可能与站长上传的代码项目有关。",
      "",
      "请用友好、自然、有条理的方式回答，就像和一位想了解站长的访客聊天——而不是在做代码评审。",
      "",
      "规则：",
      "1. 把下面的代码片段当作事实依据，但要用通俗易懂的语言呈现，让普通访客也能听懂。",
      "2. 重点说清楚这个项目是做什么的、主要用途、功能特点、用到的技术。",
      "3. 除非访客明确要求技术细节，否则不要罗列文件名、贴代码或堆砌内部实现细节。",
      "4. 不要把文件路径当作可点击的链接来引用——本站没有代码跳转功能。",
      "5. 如果片段不足以回答，请诚实简要地说明，并保持友好。",
      "6. 使用访客使用的语言，回答简洁。",
      "",
      "参考材料（仅作背景依据）：",
      context,
    ].join("\n"),
  };
}

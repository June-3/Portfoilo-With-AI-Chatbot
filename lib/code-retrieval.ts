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
        "You are the owner's personal AI assistant. The visitor is asking a question about the owner's code.",
        "",
        "Answer the question based strictly on the code snippets below (each labeled with its file path).",
        "Do not invent anything that is not in the snippets.",
        "If the snippets are insufficient to answer, say so honestly.",
        "Mention the relevant file path(s) when useful.",
        "Reply in the same language the visitor uses, concisely and clearly.",
        "",
        "Code snippets:",
        context,
      ].join("\n"),
    };
  }

  return {
    context,
    systemPrompt: [
      "你是站长的个人 AI 助手，访客正在询问关于站长代码的问题。",
      "",
      "请严格基于下面的代码片段（每个都标注了文件路径）回答，不要编造片段中没有的信息。",
      "如果片段不足以回答，请如实说明。",
      "有用时请指出相关的文件路径。",
      "使用访客的语言，简洁清晰地回答。",
      "",
      "代码片段：",
      context,
    ].join("\n"),
  };
}

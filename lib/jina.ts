/**
 * Jina Embeddings API 客户端 / client.
 *
 * 使用托管模型 jina-embeddings-v3（默认 1024 维）。文档侧用 `retrieval.passage`、
 * 查询侧用 `retrieval.query` 的 task 参数；带批处理、超时与简单重试。
 * Uses the hosted jina-embeddings-v3 model (1024 dims by default). It sends the
 * `task` parameter (retrieval.passage for documents, retrieval.query for queries),
 * with batching, a timeout, and simple retries.
 */

const BASE_URL = "https://api.jina.ai/v1/embeddings";
const DEFAULT_MODEL = "jina-embeddings-v3";
const DEFAULT_DIM = 1024;
const BATCH_SIZE = 32;
const TIMEOUT_MS = 30_000;
const RETRIES = 3;

export interface JinaConfig {
  apiKey: string;
  model: string;
  dim: number;
}

export function getJinaConfig(): JinaConfig {
  return {
    apiKey: process.env.JINA_API_KEY ?? "",
    model: process.env.JINA_EMBED_MODEL ?? DEFAULT_MODEL,
    dim: Number(process.env.JINA_EMBED_DIM ?? DEFAULT_DIM),
  };
}

export function isJinaConfigured(): boolean {
  return Boolean(getJinaConfig().apiKey);
}

type JinaTask = "retrieval.passage" | "retrieval.query";

async function requestEmbeddings(texts: string[], task: JinaTask): Promise<number[][]> {
  const cfg = getJinaConfig();
  if (!cfg.apiKey) {
    throw new Error("JINA_API_KEY 未配置 / not configured");
  }

  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify({
      model: cfg.model,
      task,
      input: texts,
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Jina API 错误 ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  return data.data.map((d: { embedding: number[] }) => d.embedding);
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < RETRIES; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === RETRIES - 1) throw err;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  // 理论上不可达 / unreachable
  throw new Error("unreachable");
}

/** 批量向量化（文档侧）/ Embed many texts (document side). */
export async function embed(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const out = await withRetry(() => requestEmbeddings(batch, "retrieval.passage"));
    results.push(...out);
  }
  return results;
}

/** 查询向量化（查询侧）/ Embed a query (query side). */
export async function embedQuery(text: string): Promise<number[]> {
  const out = await withRetry(() => requestEmbeddings([text], "retrieval.query"));
  return out[0];
}

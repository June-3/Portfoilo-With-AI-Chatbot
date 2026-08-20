import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * pgvector 向量存储（Supabase）/ pgvector store (Supabase).
 *
 * 实现参考项目的 VectorStore 协议（upsert / delete / query / count），并额外提供
 * listProjects。检索用 PostgreSQL RPC 函数 match_code_chunks（见 supabase/schema.sql）。
 * Implements the reference project's VectorStore protocol (upsert/delete/query/count)
 * plus listProjects. Search uses the match_code_chunks RPC (see supabase/schema.sql).
 */

export interface CodeChunkRow {
  id: string;
  project_id: string;
  path: string;
  file_type: "code" | "doc";
  language?: string | null;
  text: string;
  symbol?: string | null;
  chunk_index?: number | null;
  metadata?: Record<string, unknown>;
  embedding: number[];
}

export interface CodeChunkHit {
  id: string;
  project_id: string;
  path: string;
  file_type: string;
  language: string | null;
  text: string;
  symbol: string | null;
  chunk_index: number | null;
  metadata: Record<string, unknown>;
  score: number;
}

export interface ProjectStat {
  projectId: string;
  count: number;
}

export interface VectorStore {
  upsert(chunks: CodeChunkRow[]): Promise<void>;
  deleteByProject(projectId: string): Promise<void>;
  query(embedding: number[], projectId?: string, topK?: number): Promise<CodeChunkHit[]>;
  countByProject(projectId: string): Promise<number>;
  listProjects(): Promise<ProjectStat[]>;
}

function getClient(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function isVectorStoreConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

class SupabaseVectorStore implements VectorStore {
  private client: SupabaseClient;

  constructor() {
    const client = getClient();
    if (!client) {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未配置 / not configured");
    }
    this.client = client;
  }

  async upsert(chunks: CodeChunkRow[]): Promise<void> {
    const { error } = await this.client.from("code_chunks").upsert(chunks);
    if (error) throw new Error(error.message);
  }

  async deleteByProject(projectId: string): Promise<void> {
    const { error } = await this.client
      .from("code_chunks")
      .delete()
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
  }

  async query(embedding: number[], projectId?: string, topK = 8): Promise<CodeChunkHit[]> {
    const { data, error } = await this.client.rpc("match_code_chunks", {
      query_embedding: embedding,
      match_project_id: projectId ?? null,
      match_limit: topK,
    });
    if (error) throw new Error(error.message);
    return (data ?? []) as CodeChunkHit[];
  }

  async countByProject(projectId: string): Promise<number> {
    const { count, error } = await this.client
      .from("code_chunks")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    if (error) throw new Error(error.message);
    return count ?? 0;
  }

  async listProjects(): Promise<ProjectStat[]> {
    const { data, error } = await this.client.from("code_chunks").select("project_id");
    if (error) throw new Error(error.message);
    const counts = new Map<string, number>();
    for (const row of data ?? []) {
      counts.set(row.project_id, (counts.get(row.project_id) ?? 0) + 1);
    }
    return Array.from(counts.entries()).map(([projectId, count]) => ({ projectId, count }));
  }
}

export function getVectorStore(): VectorStore {
  return new SupabaseVectorStore();
}

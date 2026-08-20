import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 管理客户端（服务端专用）/ Supabase admin client (server-only).
 *
 * 用于持久化：站点配置、用户、私聊申请、用量统计。SERVICE_ROLE_KEY 只允许在
 * 服务端使用，绝不能暴露到前端。
 * Used for persistence: site settings, users, private requests, usage stats.
 * The SERVICE_ROLE_KEY is server-only — never expose it to the client.
 */

let adminClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!adminClient) {
    adminClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
      { auth: { persistSession: false } },
    );
  }
  return adminClient;
}

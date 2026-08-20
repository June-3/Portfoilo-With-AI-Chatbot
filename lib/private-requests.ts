import { decrypt, encrypt } from "@/lib/crypto";
import {
  buildConversationMarkdown,
  detectIntent,
  summarizeConversation,
  type ConversationMessage,
} from "@/lib/conversation";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

/**
 * 用户与私聊请求的存储 / Users and private-chat-request storage.
 *
 * Supabase 优先（users / private_requests 表），未配置时回退内存实现。
 * 邮箱与对话记录通过 lib/crypto.ts 加密存储（生产需设置 ENCRYPTION_KEY）。
 * Supabase-first (users / private_requests tables); falls back to in-memory when
 * Supabase is not configured. Emails and conversations are encrypted via
 * lib/crypto.ts (set ENCRYPTION_KEY in production).
 */

export interface UserRecord {
  id: string;
  email: string;
  encryptedEmail: string;
  createdAt: string;
}

export interface PrivateRequestInput {
  email: string;
  intent: string;
  conversation: ConversationMessage[];
  consent: boolean;
}

export interface PrivateRequestRecord {
  id: string;
  userId: string;
  email: string;
  intent: string;
  summary: string;
  encryptedMarkdown: string;
  createdAt: string;
}

export interface PrivateRequestView {
  id: string;
  email: string;
  intent: string;
  summary: string;
  markdown: string;
  createdAt: string;
}

const users = new Map<string, UserRecord>(); // key: 小写邮箱
const requests: PrivateRequestRecord[] = [];

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function findOrCreateUser(email: string): Promise<UserRecord> {
  const normalized = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      const { data } = await supabase
        .from("users")
        .select("id, email, encrypted_email, created_at")
        .eq("email", normalized)
        .maybeSingle();
      if (data) {
        return {
          id: data.id,
          email: data.email,
          encryptedEmail: data.encrypted_email ?? "",
          createdAt: data.created_at ?? new Date().toISOString(),
        };
      }

      const user: UserRecord = {
        id: nextId("user"),
        email: normalized,
        encryptedEmail: encrypt(normalized),
        createdAt: new Date().toISOString(),
      };
      await supabase.from("users").insert({
        id: user.id,
        email: user.email,
        encrypted_email: user.encryptedEmail,
      });
      return user;
    } catch (err) {
      console.error("[private-requests] Supabase 失败，回退内存 / failed, falling back:", err);
    }
  }

  const existing = users.get(normalized);
  if (existing) return existing;
  const user: UserRecord = {
    id: nextId("user"),
    email: normalized,
    encryptedEmail: encrypt(normalized),
    createdAt: new Date().toISOString(),
  };
  users.set(normalized, user);
  return user;
}

export async function savePrivateRequest(input: PrivateRequestInput): Promise<{
  record: PrivateRequestRecord;
  markdown: string;
}> {
  const user = await findOrCreateUser(input.email);
  const createdAt = new Date().toISOString();
  const summary = summarizeConversation(input.conversation);
  const intent = input.intent || detectIntent(input.conversation);
  const markdown = buildConversationMarkdown(
    { email: input.email, intent, summary, createdAt },
    input.conversation,
  );

  const record: PrivateRequestRecord = {
    id: nextId("req"),
    userId: user.id,
    email: user.email,
    intent,
    summary,
    encryptedMarkdown: encrypt(markdown),
    createdAt,
  };

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      await supabase.from("private_requests").insert({
        id: record.id,
        user_id: record.userId,
        email: record.email,
        intent: record.intent,
        summary: record.summary,
        encrypted_markdown: record.encryptedMarkdown,
        created_at: createdAt,
      });
    } catch (err) {
      console.error("[private-requests] Supabase 写入失败，回退内存 / write failed, falling back:", err);
      requests.push(record);
    }
  } else {
    requests.push(record);
  }

  return { record, markdown };
}

/** 列出所有私聊请求（供后台管理使用，Markdown 已解密）。/ List requests (decrypted markdown). */
export async function listPrivateRequests(): Promise<PrivateRequestView[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      const { data } = await supabase
        .from("private_requests")
        .select("id, email, intent, summary, encrypted_markdown, created_at")
        .order("created_at", { ascending: false });
      return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
        id: String(r.id),
        email: String(r.email),
        intent: String(r.intent ?? ""),
        summary: String(r.summary ?? ""),
        markdown: decrypt(String(r.encrypted_markdown ?? "")),
        createdAt: String(r.created_at ?? ""),
      }));
    } catch (err) {
      console.error("[private-requests] Supabase 读取失败，回退内存 / read failed, falling back:", err);
    }
  }

  return requests.map((r) => ({
    id: r.id,
    email: r.email,
    intent: r.intent,
    summary: r.summary,
    markdown: decrypt(r.encryptedMarkdown),
    createdAt: r.createdAt,
  }));
}

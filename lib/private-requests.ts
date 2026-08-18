import { decrypt, encrypt } from "@/lib/crypto";
import {
  buildConversationMarkdown,
  detectIntent,
  summarizeConversation,
  type ConversationMessage,
} from "@/lib/conversation";

/**
 * 用户与私聊请求的存储（内存实现）。
 * Users and private-chat-request storage (in-memory implementation).
 *
 * 说明：这是开发阶段的临时实现；生产环境应替换为 Supabase PostgreSQL。
 * 邮箱与对话记录通过 lib/crypto.ts 加密存储（生产需设置 ENCRYPTION_KEY）。
 * Note: temporary dev implementation; replace with Supabase PostgreSQL in
 * production. Emails and conversations are encrypted via lib/crypto.ts
 * (set ENCRYPTION_KEY in production).
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

const users = new Map<string, UserRecord>(); // key: 小写邮箱
const requests: PrivateRequestRecord[] = [];

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function findOrCreateUser(email: string): UserRecord {
  const normalized = email.trim().toLowerCase();
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

export function savePrivateRequest(input: PrivateRequestInput): {
  record: PrivateRequestRecord;
  markdown: string;
} {
  const user = findOrCreateUser(input.email);
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
  requests.push(record);

  return { record, markdown };
}

export interface PrivateRequestView {
  id: string;
  email: string;
  intent: string;
  summary: string;
  markdown: string;
  createdAt: string;
}

/** 列出所有私聊请求（供后台管理使用，Markdown 已解密）。 */
export function listPrivateRequests(): PrivateRequestView[] {
  return requests.map((r) => ({
    id: r.id,
    email: r.email,
    intent: r.intent,
    summary: r.summary,
    markdown: decrypt(r.encryptedMarkdown),
    createdAt: r.createdAt,
  }));
}

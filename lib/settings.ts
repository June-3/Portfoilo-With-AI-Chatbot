import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

/**
 * 站点运行时配置（站长后台可编辑）。
 * Runtime site configuration (editable in the admin panel).
 *
 * 初始值来自环境变量（.env.local）。配置持久化到 Supabase（site_settings 表），
 * 后台修改后写入内存并保存；冷启动时先从 Supabase 加载（未配置则用环境变量初值）。
 * Initial values come from environment variables. Settings persist to Supabase
 * (site_settings table); admin edits update memory and save; on cold start they
 * hydrate from Supabase (or fall back to env values when Supabase is unset).
 *
 * 敏感字段（SMTP 密码、AI API Key）不会返回给前端，前端只看到「已设置」状态。
 * Sensitive fields (SMTP password, AI API key) are never exposed to the frontend —
 * it only sees a "set / not set" status.
 */

export interface Settings {
  // SMTP
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  ownerEmail: string;
  // AI
  deepseekApiKey: string;
  deepseekBaseUrl: string;
  deepseekModel: string;
  // 每日额度
  anonymousDailyLimit: number;
  loggedInDailyLimit: number;
  // RAG 检索阈值
  /** 个人知识库「强命中」分数阈值 / Profile-KB strong-match score threshold. */
  kbStrongScore: number;
  /** 代码向量相似度阈值（0–1）/ Code vector-similarity threshold (0–1). */
  codeScoreThreshold: number;
  /** AI 单次回复最大 token 数（达到会截断）/ Max tokens per AI reply (truncates when reached). */
  maxReplyTokens: number;
  // 邮件模板
  verificationEmailSubject: string;
  verificationEmailTemplate: string;
  userConfirmationSubject: string;
  userConfirmationTemplate: string;
  ownerNotificationSubject: string;
  ownerNotificationTemplate: string;
}

function loadInitialSettings(): Settings {
  return {
    smtpHost: process.env.SMTP_HOST ?? "",
    smtpPort: Number(process.env.SMTP_PORT ?? 465),
    smtpUser: process.env.SMTP_USER ?? "",
    smtpPass: process.env.SMTP_PASS ?? "",
    smtpFrom: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "",
    ownerEmail: process.env.OWNER_EMAIL ?? "",

    deepseekApiKey: process.env.DEEPSEEK_API_KEY ?? "",
    deepseekBaseUrl: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
    deepseekModel: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",

    anonymousDailyLimit: Number(process.env.DAILY_TOKEN_LIMIT ?? 2000),
    loggedInDailyLimit: Number(process.env.LOGGED_IN_DAILY_LIMIT ?? 10000),

    kbStrongScore: Number(process.env.KB_STRONG_SCORE ?? 2),
    codeScoreThreshold: Number(process.env.CODE_SCORE_THRESHOLD ?? 0.25),
    maxReplyTokens: Number(process.env.MAX_REPLY_TOKENS ?? 1500),

    verificationEmailSubject: "Your Login Verification Code of Portfolio Page",
    verificationEmailTemplate:
      "Your verification code is: {code}, valid for 10 minutes. If this wasn't you, please ignore this email. Do not share this code with anyone.",
    userConfirmationSubject: "Your Private Message Request Has Been Received",
    userConfirmationTemplate:
      "Hello,\n\nI've received your private message request and will respond via email as soon as possible.\n\nThank you for your interest.",
    ownerNotificationSubject: "【Portfolio Page】New Private Message Request",
    ownerNotificationTemplate:
      "Received a new private message request:\n\n- Visitor Email: {email}\n- Intent Tag: {intent}\n- Time: {time}\n\nSee the full conversation in the attachment.",
  };
}

let settings: Settings = loadInitialSettings();
let hydrated = false;

export function getSettings(): Settings {
  return settings;
}

/** 冷启动时从 Supabase 加载已保存配置（幂等，只加载一次）。/ Hydrate persisted settings from Supabase (idempotent, once). */
export async function hydrateSettings(): Promise<void> {
  if (hydrated || !isSupabaseConfigured()) return;
  hydrated = true;
  try {
    const supabase = getSupabaseAdmin()!;
    const { data } = await supabase
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .maybeSingle();
    if (data?.data && typeof data.data === "object") {
      settings = { ...settings, ...(data.data as Partial<Settings>) };
    }
  } catch (err) {
    console.error("[settings] 从 Supabase 加载失败，使用默认值 / load failed, using defaults:", err);
  }
}

async function saveSettingsToDb(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = getSupabaseAdmin()!;
    await supabase
      .from("site_settings")
      .upsert({ id: 1, data: settings, updated_at: new Date().toISOString() });
  } catch (err) {
    console.error("[settings] 写入 Supabase 失败 / write failed:", err);
  }
}

/** 返回给前端的安全视图：敏感字段只暴露「是否已设置」。 */
export interface PublicSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  ownerEmail: string;
  hasSmtpPass: boolean;
  deepseekBaseUrl: string;
  deepseekModel: string;
  hasApiKey: boolean;
  anonymousDailyLimit: number;
  loggedInDailyLimit: number;
  kbStrongScore: number;
  codeScoreThreshold: number;
  maxReplyTokens: number;
  verificationEmailSubject: string;
  verificationEmailTemplate: string;
  userConfirmationSubject: string;
  userConfirmationTemplate: string;
  ownerNotificationSubject: string;
  ownerNotificationTemplate: string;
}

export function getPublicSettings(): PublicSettings {
  const s = settings;
  return {
    smtpHost: s.smtpHost,
    smtpPort: s.smtpPort,
    smtpUser: s.smtpUser,
    smtpFrom: s.smtpFrom,
    ownerEmail: s.ownerEmail,
    hasSmtpPass: Boolean(s.smtpPass),
    deepseekBaseUrl: s.deepseekBaseUrl,
    deepseekModel: s.deepseekModel,
    hasApiKey: Boolean(s.deepseekApiKey),
    anonymousDailyLimit: s.anonymousDailyLimit,
    loggedInDailyLimit: s.loggedInDailyLimit,
    kbStrongScore: s.kbStrongScore,
    codeScoreThreshold: s.codeScoreThreshold,
    maxReplyTokens: s.maxReplyTokens,
    verificationEmailSubject: s.verificationEmailSubject,
    verificationEmailTemplate: s.verificationEmailTemplate,
    userConfirmationSubject: s.userConfirmationSubject,
    userConfirmationTemplate: s.userConfirmationTemplate,
    ownerNotificationSubject: s.ownerNotificationSubject,
    ownerNotificationTemplate: s.ownerNotificationTemplate,
  };
}

export interface SettingsUpdate
  extends Partial<Omit<Settings, "smtpPass" | "deepseekApiKey">> {
  /** 仅当非空时更新（后台以「留空则不修改」处理）。 */
  smtpPass?: string;
  deepseekApiKey?: string;
}

export async function updateSettings(update: SettingsUpdate): Promise<void> {
  const { smtpPass, deepseekApiKey, ...rest } = update;

  // 过滤掉 undefined/null 字段，避免覆盖已有值
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined && value !== null) clean[key] = value;
  }

  settings = {
    ...settings,
    ...(clean as Partial<Omit<Settings, "smtpPass" | "deepseekApiKey">>),
    ...(smtpPass && smtpPass.trim() !== "" ? { smtpPass: smtpPass.trim() } : {}),
    ...(deepseekApiKey && deepseekApiKey.trim() !== ""
      ? { deepseekApiKey: deepseekApiKey.trim() }
      : {}),
  };

  await saveSettingsToDb();
}

/** 简单模板渲染：替换 {key} 占位符。 */
export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

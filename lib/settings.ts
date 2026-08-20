/**
 * 站点运行时配置（站长后台可编辑）。
 * Runtime site configuration (editable in the admin panel).
 *
 * 初始值来自环境变量（.env.local）。站长在后台修改后保存在内存中，立即生效；
 * 重启服务后回落到环境变量初值。
 * Initial values come from environment variables. Admin edits take effect
 * immediately in memory, then fall back to env values after a restart.
 *
 * 说明：生产环境应将这些配置持久化到数据库（Supabase），并对敏感字段
 * （SMTP 密码、AI API Key）加密存储。当前为内存实现，敏感字段不会返回给前端，
 * 前端只看到「已设置」状态。
 * Note: production should persist these in a database (Supabase) and encrypt the
 * sensitive fields (SMTP password, AI API key). For now they live in memory and
 * are never exposed to the frontend — it only sees a "set / not set" status.
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

    verificationEmailSubject: "你的登录验证码",
    verificationEmailTemplate:
      "你的验证码是：{code}，10 分钟内有效。如果不是你本人操作，请忽略此邮件。",
    userConfirmationSubject: "已收到你的私聊申请",
    userConfirmationTemplate:
      "你好，\n\n已收到你的私聊申请，我会尽快通过邮箱回复你。\n\n感谢你的关注。",
    ownerNotificationSubject: "【作品集】新的私聊申请",
    ownerNotificationTemplate:
      "收到一条新的私聊申请：\n\n- 访客邮箱：{email}\n- 意向标签：{intent}\n- 时间：{time}\n\n完整对话见附件。",
  };
}

let settings: Settings = loadInitialSettings();

export function getSettings(): Settings {
  return settings;
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

export function updateSettings(update: SettingsUpdate): void {
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
}

/** 简单模板渲染：替换 {key} 占位符。 */
export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

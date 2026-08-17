import { sendMail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * 邮箱验证码：生成、存储、校验，以及发送频率限制。
 *
 * 存储为内存实现（开发用）；生产环境应替换为 Redis（设置过期时间）。
 * 频率限制：同一邮箱 / 同一 IP 每小时最多 3 次。
 */

const CODE_TTL_MS = 10 * 60 * 1000; // 验证码 10 分钟有效
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 小时窗口
const RATE_LIMIT_MAX = 3; // 每小时最多 3 次

interface CodeRecord {
  code: string;
  expiresAt: number;
}

const codeStore = new Map<string, CodeRecord>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface SendCodeResult {
  ok: boolean;
  status: number;
  message: string;
  /** 仅在开发模式（未配置 SMTP）返回，便于本地演示。 */
  devCode?: string;
}

export async function sendVerificationCode(
  email: string,
  ip?: string,
): Promise<SendCodeResult> {
  const normalized = normalizeEmail(email);

  if (!EMAIL_RE.test(normalized)) {
    return { ok: false, status: 400, message: "邮箱格式不正确。" };
  }

  const emailAllowed = checkRateLimit(
    `email:${normalized}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  const ipAllowed = ip
    ? checkRateLimit(`ip:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
    : true;

  if (!emailAllowed || !ipAllowed) {
    return { ok: false, status: 429, message: "发送过于频繁，请稍后再试。" };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  codeStore.set(normalized, { code, expiresAt: Date.now() + CODE_TTL_MS });

  const mail = await sendMail({
    to: normalized,
    subject: "你的登录验证码",
    text: `你的验证码是：${code}，10 分钟内有效。如果不是你本人操作，请忽略此邮件。`,
  });

  return {
    ok: true,
    status: 200,
    message: "验证码已发送，请查收邮箱。",
    devCode: mail.mocked ? code : undefined,
  };
}

export function verifyCode(email: string, code: string): boolean {
  const normalized = normalizeEmail(email);
  const record = codeStore.get(normalized);
  if (!record) return false;

  if (record.expiresAt < Date.now()) {
    codeStore.delete(normalized);
    return false;
  }

  if (record.code !== code.trim()) return false;

  codeStore.delete(normalized); // 一次性使用
  return true;
}

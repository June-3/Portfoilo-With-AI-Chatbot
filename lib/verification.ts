import { sendMail } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSettings, renderTemplate } from "@/lib/settings";
import { getRedis, isRedisConfigured } from "@/lib/redis";

/**
 * 邮箱验证码：生成、存储、校验，以及发送频率限制。
 * Email verification codes: generate, store, verify, plus send rate limiting.
 *
 * 验证码存储 Redis 优先（SETEX 10 分钟过期），未配置 Redis 时回退内存。
 * 频率限制：同一邮箱 / 同一 IP 每小时最多 3 次。
 * Codes are stored in Redis first (SETEX, 10-min expiry), falling back to memory
 * when Redis is not configured. Rate limit: max 3 sends per hour per email / IP.
 */

const CODE_TTL_SECONDS = 10 * 60;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

interface CodeRecord {
  code: string;
  expiresAt: number;
}

const codeStore = new Map<string, CodeRecord>();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function codeKey(email: string): string {
  return `verify:${normalizeEmail(email)}`;
}

export interface SendCodeResult {
  ok: boolean;
  status: number;
  message: string;
  devCode?: string;
}

export async function sendVerificationCode(
  email: string,
  ip?: string,
): Promise<SendCodeResult> {
  const normalized = normalizeEmail(email);

  if (!EMAIL_RE.test(normalized)) {
    return { ok: false, status: 400, message: "Invalid email format." };
  }

  const emailAllowed = await checkRateLimit(
    `email:${normalized}`,
    RATE_LIMIT_MAX,
    RATE_LIMIT_WINDOW_MS,
  );
  const ipAllowed = ip
    ? await checkRateLimit(`ip:${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
    : true;

  if (!emailAllowed || !ipAllowed) {
    return { ok: false, status: 429, message: "Sending too frequently. Please try again later." };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  if (isRedisConfigured()) {
    try {
      await getRedis()!.set(codeKey(normalized), code, { ex: CODE_TTL_SECONDS });
    } catch (err) {
      console.error("[verification] Redis 写入失败，回退内存 / write failed, falling back:", err);
      codeStore.set(normalized, { code, expiresAt: Date.now() + CODE_TTL_SECONDS * 1000 });
    }
  } else {
    codeStore.set(normalized, { code, expiresAt: Date.now() + CODE_TTL_SECONDS * 1000 });
  }

  const s = getSettings();
  const mail = await sendMail({
    to: normalized,
    subject: s.verificationEmailSubject,
    text: renderTemplate(s.verificationEmailTemplate, { code }),
  });

  return {
    ok: true,
    status: 200,
    message: "Verification code sent. Please check your email.",
    devCode: mail.mocked ? code : undefined,
  };
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const trimmed = code.trim();

  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      const stored = await redis.get(codeKey(normalized));
      // Upstash 会把纯数字字符串解析成 number，比较前统一转字符串 / Upstash parses
      // numeric strings as numbers, so coerce to string before comparing.
      if (stored == null || String(stored) !== trimmed) return false;
      await redis.del(codeKey(normalized));
      return true;
    } catch (err) {
      console.error("[verification] Redis 校验失败，回退内存 / verify failed, falling back:", err);
    }
  }

  const record = codeStore.get(normalized);
  if (!record) return false;
  if (record.expiresAt < Date.now()) {
    codeStore.delete(normalized);
    return false;
  }
  if (record.code !== trimmed) return false;
  codeStore.delete(normalized);
  return true;
}

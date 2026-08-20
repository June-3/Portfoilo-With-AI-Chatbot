import crypto from "node:crypto";

/**
 * 站长后台登录鉴权：单管理员密码 + HMAC 签名的令牌。
 * Admin auth: a single admin password plus an HMAC-signed token.
 *
 * 说明：开发默认密码为 admin123（生产环境务必通过 ADMIN_PASSWORD 环境变量设置）。
 * 令牌有效期 24 小时，仅用于本站后台的简单保护。
 * Note: the dev default password is admin123 (set ADMIN_PASSWORD in production).
 * Tokens last 24 hours and only protect this site's admin panel.
 */

// 空串视为未设置（.env 里 ADMIN_PASSWORD= 时回退开发默认）/ Treat an empty string
// as unset so an empty ADMIN_PASSWORD falls back to the dev default.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || "admin123";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function sign(payload: string): string {
  return crypto.createHmac("sha256", ADMIN_PASSWORD).update(payload).digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  return Boolean(password) && password === ADMIN_PASSWORD;
}

export function issueAdminToken(): string {
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifyAdminToken(token: string): boolean {
  const [issuedAt, sig] = token.split(".");
  if (!issuedAt || !sig) return false;
  if (sig !== sign(issuedAt)) return false;

  const ts = Number(issuedAt);
  const age = Date.now() - ts;
  return Number.isFinite(ts) && age >= 0 && age < TOKEN_TTL_MS;
}

export function getAdminTokenFromRequest(request: Request): string | null {
  const auth = request.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

import crypto from "node:crypto";

/**
 * 对称加密工具（AES-256-GCM），用于加密存储邮箱、对话等敏感信息。
 *
 * 生产环境必须设置 ENCRYPTION_KEY（见 .env.example）。未设置时，为便于本地
 * 开发，会原样返回明文（不加密）。
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

function deriveKey(): Buffer {
  return crypto.createHash("sha256").update(ENCRYPTION_KEY as string).digest();
}

export function encrypt(plain: string): string {
  if (!ENCRYPTION_KEY) return plain;

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), encrypted.toString("base64")].join(
    ".",
  );
}

export function decrypt(payload: string): string {
  if (!ENCRYPTION_KEY) return payload;

  try {
    const [ivB64, tagB64, dataB64] = payload.split(".");
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      deriveKey(),
      Buffer.from(ivB64, "base64"),
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(dataB64, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    // 解密失败时返回原文（可能是历史明文数据）
    return payload;
  }
}

import { getRedis, isRedisConfigured } from "@/lib/redis";

/**
 * 黑名单：按 IP 或匿名 ID 封禁 / Blacklist: block by IP or anonymous ID.
 *
 * Redis 优先（SET），未配置 Redis 时回退到内存实现。
 * Redis-first (SET); falls back to in-memory when Redis is not configured.
 * 自动超限临时封禁规则（如 24 小时内 3 次超限封 7 天）可按需在此基础上实现。
 * Auto temporary bans (e.g. 3 over-limit hits in 24h → ban 7 days) can be built on top.
 */

const BLACKLIST_KEY = "blacklist";
const blacklist = new Set<string>();

export async function isBlocked(id: string): Promise<boolean> {
  const key = normalize(id);
  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      return Boolean(await redis.sismember(BLACKLIST_KEY, key));
    } catch (err) {
      console.error("[blacklist] Redis 失败，回退内存 / failed, falling back:", err);
    }
  }
  return blacklist.has(key);
}

export async function addToBlacklist(id: string): Promise<void> {
  const key = normalize(id);
  if (!key) return;
  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      await redis.sadd(BLACKLIST_KEY, key);
      return;
    } catch (err) {
      console.error("[blacklist] Redis 失败，回退内存 / failed, falling back:", err);
    }
  }
  blacklist.add(key);
}

export async function removeFromBlacklist(id: string): Promise<void> {
  const key = normalize(id);
  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      await redis.srem(BLACKLIST_KEY, key);
      return;
    } catch (err) {
      console.error("[blacklist] Redis 失败，回退内存 / failed, falling back:", err);
    }
  }
  blacklist.delete(key);
}

export async function listBlacklist(): Promise<string[]> {
  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      return (await redis.smembers(BLACKLIST_KEY)) ?? [];
    } catch (err) {
      console.error("[blacklist] Redis 失败，回退内存 / failed, falling back:", err);
    }
  }
  return Array.from(blacklist);
}

function normalize(id: string): string {
  return id.trim().toLowerCase();
}

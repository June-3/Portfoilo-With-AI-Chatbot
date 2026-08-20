import { getRedis, isRedisConfigured } from "@/lib/redis";

/**
 * 滑动窗口限流 / Sliding-window rate limiting.
 *
 * Redis 优先（有序集合按时间戳滑动窗口），未配置 Redis 时回退到内存实现。
 * Redis-first (sorted-set sliding window); falls back to in-memory when Redis
 * is not configured.
 */

const buckets = new Map<string, number[]>();

/**
 * 检查 key 是否在 windowMs 内超过了 limit 次；未超限则记录本次并返回 true。
 * Returns true (and records the call) if key has fewer than `limit` hits within
 * `windowMs`, otherwise false.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<boolean> {
  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      const rkey = `rl:${key}`;
      const now = Date.now();
      const min = now - windowMs;

      // 清理过期时间戳 / prune expired timestamps
      await redis.zremrangebyscore(rkey, 0, min);
      const count = await redis.zcard(rkey);
      if (count >= limit) return false;

      await redis.zadd(rkey, { score: now, member: `${now}:${Math.random()}` });
      await redis.expire(rkey, Math.ceil(windowMs / 1000));
      return true;
    } catch (err) {
      console.error("[rate-limit] Redis 失败，回退内存 / failed, falling back:", err);
    }
  }

  // 内存兜底 / in-memory fallback
  const now = Date.now();
  const timestamps = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    buckets.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  buckets.set(key, timestamps);
  return true;
}

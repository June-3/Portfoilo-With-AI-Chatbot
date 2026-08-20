import { Redis } from "@upstash/redis";

/**
 * Upstash Redis 客户端 / Upstash Redis client.
 *
 * 未配置 UPSTASH_REDIS_REST_URL / TOKEN 时返回 null，各模块回退到内存实现，
 * 保证「无密钥也能本地运行」。
 * Returns null when the Upstash env vars are missing, so each store falls back
 * to its in-memory implementation (local dev still works without keys).
 */

let client: Redis | null = null;

export function isRedisConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

export function getRedis(): Redis | null {
  if (!isRedisConfigured()) return null;
  if (!client) {
    client = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    });
  }
  return client;
}

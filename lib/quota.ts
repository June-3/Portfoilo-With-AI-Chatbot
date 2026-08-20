import { getSettings } from "@/lib/settings";
import { getRedis, isRedisConfigured } from "@/lib/redis";

/**
 * 每日 token 额度统计 / Daily token quota tracking.
 *
 * Redis 优先（按天自动过期），未配置 Redis 时回退到内存实现，保证本地可跑。
 * Redis-first (auto-expires daily); falls back to in-memory when Redis is not
 * configured so local development still works.
 *
 * 支持匿名与登录两种限额（后台可分别配置）。登录用户以邮箱为身份、匿名用户以
 * localStorage 匿名 ID 为身份。
 * Supports separate anonymous and signed-in limits (configurable in the admin).
 * Signed-in users are keyed by email; anonymous users by their localStorage ID.
 */

interface UsageRecord {
  date: string; // YYYY-MM-DD（UTC）
  tokens: number;
}

const usageMap = new Map<string, UsageRecord>();

const DAY_SECONDS = 24 * 60 * 60;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function dailyKey(id: string): string {
  return `quota:${today()}:${id}`;
}

function getDailyLimit(isLoggedIn: boolean): number {
  const s = getSettings();
  return isLoggedIn ? s.loggedInDailyLimit : s.anonymousDailyLimit;
}

function percent(usedTokens: number, dailyLimit: number): number {
  return Math.max(0, Math.round((1 - usedTokens / dailyLimit) * 100));
}

export interface QuotaStatus {
  usedTokens: number;
  dailyLimit: number;
  remainingPercent: number;
}

export async function getQuota(id: string, isLoggedIn: boolean): Promise<QuotaStatus> {
  const dailyLimit = getDailyLimit(isLoggedIn);
  let usedTokens = 0;

  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      usedTokens = Number((await redis.get<number>(dailyKey(id))) ?? 0);
    } catch (err) {
      console.error("[quota] Redis 读取失败，回退内存 / read failed, falling back:", err);
      const record = usageMap.get(id);
      usedTokens = record && record.date === today() ? record.tokens : 0;
    }
  } else {
    const record = usageMap.get(id);
    usedTokens = record && record.date === today() ? record.tokens : 0;
  }

  return { usedTokens, dailyLimit, remainingPercent: percent(usedTokens, dailyLimit) };
}

export async function hasQuota(id: string, isLoggedIn: boolean): Promise<boolean> {
  const { usedTokens, dailyLimit } = await getQuota(id, isLoggedIn);
  return usedTokens < dailyLimit;
}

export async function recordUsage(
  id: string,
  tokens: number,
  isLoggedIn: boolean,
): Promise<QuotaStatus> {
  const dailyLimit = getDailyLimit(isLoggedIn);
  const added = Math.max(0, Math.round(tokens));
  let usedTokens: number;

  if (isRedisConfigured()) {
    try {
      const redis = getRedis()!;
      const key = dailyKey(id);
      usedTokens = await redis.incrby(key, added);
      await redis.expire(key, DAY_SECONDS);
    } catch (err) {
      console.error("[quota] Redis 写入失败，回退内存 / write failed, falling back:", err);
      usedTokens = memoryRecord(id, added);
    }
  } else {
    usedTokens = memoryRecord(id, added);
  }

  return { usedTokens, dailyLimit, remainingPercent: percent(usedTokens, dailyLimit) };
}

function memoryRecord(id: string, added: number): number {
  const current = usageMap.get(id);
  const sameDay = Boolean(current && current.date === today());
  const usedTokens = (sameDay ? current?.tokens ?? 0 : 0) + added;
  usageMap.set(id, { date: today(), tokens: usedTokens });
  return usedTokens;
}

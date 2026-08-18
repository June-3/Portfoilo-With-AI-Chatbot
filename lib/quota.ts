import { getSettings } from "@/lib/settings";

/**
 * 每日 token 额度统计（内存实现）。
 * Daily token quota tracking (in-memory implementation).
 *
 * 支持匿名与登录两种限额（后台可分别配置）。登录用户以邮箱为身份、匿名用户以
 * localStorage 匿名 ID 为身份。
 * Supports separate anonymous and signed-in limits (configurable in the admin).
 * Signed-in users are keyed by email; anonymous users by their localStorage ID.
 *
 * 说明：内存实现为开发用；生产环境替换为 Upstash Redis。
 * Note: in-memory for development; replace with Upstash Redis in production.
 */

interface UsageRecord {
  date: string; // YYYY-MM-DD（UTC）
  tokens: number;
}

const usageMap = new Map<string, UsageRecord>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyLimit(isLoggedIn: boolean): number {
  const s = getSettings();
  return isLoggedIn ? s.loggedInDailyLimit : s.anonymousDailyLimit;
}

export interface QuotaStatus {
  usedTokens: number;
  dailyLimit: number;
  remainingPercent: number;
}

export function getQuota(id: string, isLoggedIn: boolean): QuotaStatus {
  const dailyLimit = getDailyLimit(isLoggedIn);
  const record = usageMap.get(id);
  const usedTokens = record && record.date === today() ? record.tokens : 0;
  const remainingPercent = Math.max(
    0,
    Math.round((1 - usedTokens / dailyLimit) * 100),
  );
  return { usedTokens, dailyLimit, remainingPercent };
}

export function hasQuota(id: string, isLoggedIn: boolean): boolean {
  const { usedTokens, dailyLimit } = getQuota(id, isLoggedIn);
  return usedTokens < dailyLimit;
}

export function recordUsage(id: string, tokens: number, isLoggedIn: boolean): QuotaStatus {
  const dailyLimit = getDailyLimit(isLoggedIn);
  const current = usageMap.get(id);
  const sameDay = Boolean(current && current.date === today());
  const usedTokens =
    (sameDay ? current?.tokens ?? 0 : 0) + Math.max(0, Math.round(tokens));
  usageMap.set(id, { date: today(), tokens: usedTokens });
  const remainingPercent = Math.max(
    0,
    Math.round((1 - usedTokens / dailyLimit) * 100),
  );
  return { usedTokens, dailyLimit, remainingPercent };
}

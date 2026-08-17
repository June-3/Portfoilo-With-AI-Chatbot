/**
 * 每日 token 额度统计（内存实现）。
 *
 * 说明：这是里程碑 3 的临时实现。部署到 Vercel（serverless）后，内存状态在
 * 实例间不共享且会随实例回收而丢失；里程碑 4 将替换为 Upstash Redis 实现，
 * 届时额度、限流、黑名单都以 Redis 为准。
 */

const DEFAULT_DAILY_LIMIT = 2000;

interface UsageRecord {
  /** 记录所属日期，格式 YYYY-MM-DD（UTC）。 */
  date: string;
  tokens: number;
}

const usageMap = new Map<string, UsageRecord>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDailyLimit(): number {
  const raw = process.env.DAILY_TOKEN_LIMIT;
  const n = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DAILY_LIMIT;
}

export interface QuotaStatus {
  usedTokens: number;
  dailyLimit: number;
  /** 剩余额度百分比（0–100）。 */
  remainingPercent: number;
}

export function getQuota(id: string): QuotaStatus {
  const dailyLimit = getDailyLimit();
  const record = usageMap.get(id);
  const usedTokens = record && record.date === today() ? record.tokens : 0;
  const remainingPercent = Math.max(
    0,
    Math.round((1 - usedTokens / dailyLimit) * 100),
  );
  return { usedTokens, dailyLimit, remainingPercent };
}

export function hasQuota(id: string): boolean {
  const { usedTokens, dailyLimit } = getQuota(id);
  return usedTokens < dailyLimit;
}

export function recordUsage(id: string, tokens: number): QuotaStatus {
  const dailyLimit = getDailyLimit();
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

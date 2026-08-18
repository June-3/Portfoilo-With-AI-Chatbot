/**
 * 每日 AI 使用量统计（总 token、请求次数）。
 * Daily AI usage stats (total tokens, request count).
 *
 * 内存实现（开发用）；生产环境应替换为数据库持久化。
 * In-memory (dev only); replace with DB persistence in production.
 */

export interface DayStat {
  date: string; // YYYY-MM-DD
  requests: number;
  tokens: number;
}

const stats = new Map<string, DayStat>();

function dateStr(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export function recordRequest(tokens: number): void {
  const date = dateStr();
  const current = stats.get(date) ?? { date, requests: 0, tokens: 0 };
  current.requests += 1;
  current.tokens += Math.max(0, Math.round(tokens));
  stats.set(date, current);
}

/** 返回最近 days 天的统计（含无请求的空天）。 */
export function getDailyStats(days = 14): DayStat[] {
  const result: DayStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dateStr(-i);
    result.push(stats.get(date) ?? { date, requests: 0, tokens: 0 });
  }
  return result;
}

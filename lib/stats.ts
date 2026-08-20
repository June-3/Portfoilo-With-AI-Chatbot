import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

/**
 * 每日 AI 使用量统计（总 token、请求次数）。
 * Daily AI usage stats (total tokens, request count).
 *
 * Supabase 优先（usage_stats 表，经 increment_usage RPC 原子累加），未配置时回退内存。
 * Supabase-first (usage_stats table, atomic increment via the increment_usage RPC);
 * falls back to in-memory when Supabase is not configured.
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

export async function recordRequest(tokens: number): Promise<void> {
  const date = dateStr();
  const added = Math.max(0, Math.round(tokens));

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      await supabase.rpc("increment_usage", { p_date: date, p_tokens: added });
      return;
    } catch (err) {
      console.error("[stats] Supabase 写入失败，回退内存 / write failed, falling back:", err);
    }
  }

  const current = stats.get(date) ?? { date, requests: 0, tokens: 0 };
  current.requests += 1;
  current.tokens += added;
  stats.set(date, current);
}

/** 返回最近 days 天的统计（含无请求的空天）。/ Last `days` days, including empty days. */
export async function getDailyStats(days = 14): Promise<DayStat[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdmin()!;
      const start = dateStr(-(days - 1));
      const { data } = await supabase
        .from("usage_stats")
        .select("date, requests, tokens")
        .gte("date", start)
        .order("date");

      const byDate = new Map(
        ((data ?? []) as { date: string; requests: number; tokens: number }[]).map((r) => [
          r.date,
          { date: r.date, requests: r.requests, tokens: r.tokens },
        ]),
      );

      const result: DayStat[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = dateStr(-i);
        result.push(byDate.get(date) ?? { date, requests: 0, tokens: 0 });
      }
      return result;
    } catch (err) {
      console.error("[stats] Supabase 读取失败，回退内存 / read failed, falling back:", err);
    }
  }

  const result: DayStat[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dateStr(-i);
    result.push(stats.get(date) ?? { date, requests: 0, tokens: 0 });
  }
  return result;
}

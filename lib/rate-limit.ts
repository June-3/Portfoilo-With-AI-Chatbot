/**
 * 滑动窗口限流（内存实现）。
 *
 * 说明：这是开发阶段的临时实现；里程碑后续将替换为 Upstash Redis 的滑动窗口，
 * 以支持多实例共享、持久化与更精确的限流。
 */

const buckets = new Map<string, number[]>();

/**
 * 检查 key 是否在 windowMs 内超过了 limit 次；未超限则记录本次并返回 true。
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
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

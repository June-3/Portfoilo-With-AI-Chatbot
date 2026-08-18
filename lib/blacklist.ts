/**
 * 黑名单：按 IP 或匿名 ID 封禁。
 * Blacklist: block by IP or anonymous ID.
 *
 * 内存实现（开发用）；生产环境应替换为 Redis/数据库持久化。
 * In-memory (dev only); replace with Redis/DB persistence in production.
 * 自动超限临时封禁规则（如 24 小时内 3 次超限封 7 天）在后续接入 Redis 时实现。
 * Auto temporary bans (e.g. 3 over-limit hits in 24h → ban 7 days) land with Redis later.
 */

const blacklist = new Set<string>();

export function isBlocked(id: string): boolean {
  return blacklist.has(normalize(id));
}

export function addToBlacklist(id: string): void {
  const key = normalize(id);
  if (key) blacklist.add(key);
}

export function removeFromBlacklist(id: string): void {
  blacklist.delete(normalize(id));
}

export function listBlacklist(): string[] {
  return Array.from(blacklist);
}

function normalize(id: string): string {
  return id.trim().toLowerCase();
}

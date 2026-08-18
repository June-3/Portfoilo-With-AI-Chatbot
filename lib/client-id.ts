/**
 * 匿名访客 ID：用 localStorage 持久化，用于每日额度统计与（后续）限流/黑名单。
 * 仅在客户端使用；在服务端调用会返回空字符串。
 * Anonymous visitor ID persisted in localStorage, used for daily quota and
 * (later) rate limiting / blacklist. Client-only; returns "" on the server.
 */

const KEY = "portfolio_anonymous_id";

export function getAnonymousId(): string {
  if (typeof window === "undefined") return "";

  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = generateId();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    // localStorage 不可用时（如隐私模式）回退到一次性 ID
    return generateId();
  }
}

function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `anon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

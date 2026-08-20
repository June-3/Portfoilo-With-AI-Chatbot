"use client";

import { create } from "zustand";
import type { Lang } from "@/lib/i18n";

const LANG_STORAGE_KEY = "portfolio_language";

function persistLanguage(lang: Lang): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    /* ignore */
  }
}

/** 读取已保存的语言（供客户端水合使用）。/ Read the persisted language. */
export function loadPersistedLanguage(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

// ---- 登录态持久化（localStorage，同一设备刷新后保持登录）/ persisted login ----

const USER_STORAGE_KEY = "portfolio_user";

function persistUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}

/** 读取已保存的登录态（供客户端水合使用）。/ Read the persisted login state. */
export function loadPersistedUser(): AuthUser {
  if (typeof window === "undefined") return { ...initialUser };
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (raw) return { ...initialUser, ...(JSON.parse(raw) as Partial<AuthUser>) };
  } catch {
    /* ignore */
  }
  return { ...initialUser };
}

/**
 * Shared client-side state for the whole site.
 *
 * This store backs the main menu integration described in Requirement.md
 * (Module 3): the navigation bar, the AI chat window, the email login modal,
 * the private-request modal, the login/submitted-request status and the daily
 * token quota all read from and write to this single source of truth.
 *
 * In later milestones the `user` slice will be hydrated from a persistent
 * session (backend), and `quota` from Redis; for now they live in memory.
 */

export interface AuthUser {
  email: string | null;
  isLoggedIn: boolean;
  hasSubmittedRequest: boolean;
}

export interface QuotaInfo {
  /** Tokens used so far in the current day. */
  usedTokens: number;
  /** Daily token limit (default 2000 for anonymous users). */
  dailyLimit: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** 本次回答消耗的 token 数（仅助手消息）／Tokens used for this reply (assistant only). */
  tokensUsed?: number;
}

export interface AppState {
  // ---- UI toggles -------------------------------------------------------
  isChatOpen: boolean;
  isLoginOpen: boolean;
  isPrivateRequestOpen: boolean;
  isMobileMenuOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  openPrivateRequest: () => void;
  closePrivateRequest: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // ---- 私聊申请流程编排 --------------------------------------------------
  /** 未登录先弹出登录，登录后自动进入私聊申请。 */
  startPrivateRequest: () => void;
  /** 登录成功后调用：写入用户状态，并按需打开私聊申请弹窗。 */
  completeLogin: (user: AuthUser) => void;
  /** 私聊申请提交成功后标记「已提交请求」。 */
  markRequestSubmitted: () => void;

  // ---- Auth / user ------------------------------------------------------
  user: AuthUser;
  setUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
  /** 挂载后从 localStorage 恢复登录态 / Hydrate login state from localStorage on mount. */
  hydrateUser: () => void;

  // ---- Daily token quota ------------------------------------------------
  quota: QuotaInfo;
  setQuota: (patch: Partial<QuotaInfo>) => void;

  // ---- 聊天对话（供 AI 聊天与私聊申请共享） ------------------------------
  conversation: ChatMessage[];
  addConversationMessage: (message: ChatMessage) => void;
  clearConversation: () => void;

  // ---- 语言 / language ---------------------------------------------------
  language: Lang;
  setLanguage: (lang: Lang) => void;
  toggleLanguage: () => void;

  // ---- 内部标记：登录后是否接着进入私聊申请 ------------------------------
  pendingPrivateRequest: boolean;
}

const initialUser: AuthUser = {
  email: null,
  isLoggedIn: false,
  hasSubmittedRequest: false,
};

const initialQuota: QuotaInfo = {
  usedTokens: 0,
  dailyLimit: 2000,
};

export const useAppStore = create<AppState>()((set) => ({
  isChatOpen: false,
  isLoginOpen: false,
  isPrivateRequestOpen: false,
  isMobileMenuOpen: false,

  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),
  openPrivateRequest: () => set({ isPrivateRequestOpen: true }),
  closePrivateRequest: () => set({ isPrivateRequestOpen: false }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  startPrivateRequest: () =>
    set((s) =>
      s.user.isLoggedIn
        ? { isPrivateRequestOpen: true }
        : { isLoginOpen: true, pendingPrivateRequest: true },
    ),

  completeLogin: (user) =>
    set((s) => {
      const merged = {
        ...user,
        hasSubmittedRequest: s.user.hasSubmittedRequest || user.hasSubmittedRequest,
      };
      persistUser(merged);
      return {
        user: merged,
        isLoginOpen: false,
        isPrivateRequestOpen: s.pendingPrivateRequest,
        pendingPrivateRequest: false,
      };
    }),

  markRequestSubmitted: () =>
    set((s) => {
      const user = { ...s.user, hasSubmittedRequest: true };
      persistUser(user);
      return { user };
    }),

  user: initialUser,
  setUser: (patch) =>
    set((s) => {
      const user = { ...s.user, ...patch };
      persistUser(user);
      return { user };
    }),
  logout: () => {
    persistUser({ ...initialUser });
    set({ user: { ...initialUser } });
  },
  hydrateUser: () => set({ user: loadPersistedUser() }),

  quota: initialQuota,
  setQuota: (patch) => set((s) => ({ quota: { ...s.quota, ...patch } })),

  conversation: [],
  addConversationMessage: (message) =>
    set((s) => ({ conversation: [...s.conversation, message] })),
  clearConversation: () => set({ conversation: [] }),

  language: "en",
  setLanguage: (lang) => {
    set({ language: lang });
    persistLanguage(lang);
  },
  toggleLanguage: () =>
    set((s) => {
      const next: Lang = s.language === "zh" ? "en" : "zh";
      persistLanguage(next);
      return { language: next };
    }),

  pendingPrivateRequest: false,
}));

/**
 * Helper selector: remaining daily quota as a percentage (0–100) for the UI.
 * 用于展示「今日剩余额度：XX%」。
 */
export function selectRemainingPercent(state: AppState): number {
  const { usedTokens, dailyLimit } = state.quota;
  if (dailyLimit <= 0) return 100;
  return Math.max(0, Math.round((1 - usedTokens / dailyLimit) * 100));
}

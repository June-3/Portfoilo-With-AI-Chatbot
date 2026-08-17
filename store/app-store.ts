"use client";

import { create } from "zustand";

/**
 * Shared client-side state for the whole site.
 *
 * This store backs the main menu integration described in Requirement.md
 * (Module 3): the navigation bar, the AI chat window, the email login modal,
 * the login/submitted-request status and the daily token quota all read from
 * and write to this single source of truth so they stay in sync.
 *
 * In later milestones the `user` and `quota` slices will be hydrated from the
 * backend (Supabase + Redis) instead of living only in memory.
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

export interface AppState {
  // ---- UI toggles -------------------------------------------------------
  isChatOpen: boolean;
  isLoginOpen: boolean;
  isMobileMenuOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  openLogin: () => void;
  closeLogin: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // ---- Auth / user ------------------------------------------------------
  user: AuthUser;
  setUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;

  // ---- Daily token quota ------------------------------------------------
  quota: QuotaInfo;
  setQuota: (patch: Partial<QuotaInfo>) => void;
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
  isMobileMenuOpen: false,

  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((s) => ({ isChatOpen: !s.isChatOpen })),
  openLogin: () => set({ isLoginOpen: true }),
  closeLogin: () => set({ isLoginOpen: false }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  user: initialUser,
  setUser: (patch) => set((s) => ({ user: { ...s.user, ...patch } })),
  logout: () => set({ user: initialUser }),

  quota: initialQuota,
  setQuota: (patch) => set((s) => ({ quota: { ...s.quota, ...patch } })),
}));

/**
 * Helper selector: quota used as a percentage (0–100) for the UI.
 */
export function selectQuotaPercent(state: AppState): number {
  const { usedTokens, dailyLimit } = state.quota;
  if (dailyLimit <= 0) return 0;
  return Math.min(100, Math.round((usedTokens / dailyLimit) * 100));
}

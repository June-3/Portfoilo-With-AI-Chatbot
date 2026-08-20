"use client";

import { useEffect } from "react";
import {
  useAppStore,
  loadPersistedLanguage,
  loadPersistedUser,
} from "@/store/app-store";

/**
 * 客户端水合 / Client hydration.
 *
 * 挂载后从 localStorage 恢复语言与登录态，避免与服务端渲染（默认状态）产生水合不一致。
 * Restores the persisted language and login state after mount so the initial
 * server-rendered (default) output stays consistent.
 */
export default function ClientHydration() {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    useAppStore.getState().setLanguage(loadPersistedLanguage());
    useAppStore.getState().hydrateUser();
  }, []);

  // 让 <html lang> 跟随当前语言 / Keep the <html lang> attribute in sync.
  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  return null;
}

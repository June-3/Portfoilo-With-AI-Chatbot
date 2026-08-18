"use client";

import { useEffect } from "react";
import { useAppStore, loadPersistedLanguage } from "@/store/app-store";

/**
 * 语言水合 / Language hydration.
 *
 * 在客户端挂载后读取 localStorage 中保存的语言并写入 store，避免与服务端
 * 渲染（默认中文）产生水合不一致。/ Reads the persisted language after mount
 * so the initial server-rendered (Chinese) output stays consistent.
 */
export default function LanguageHydration() {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    useAppStore.getState().setLanguage(loadPersistedLanguage());
  }, []);

  // 让 <html lang> 跟随当前语言 / Keep the <html lang> attribute in sync.
  useEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "zh-CN";
  }, [language]);

  return null;
}

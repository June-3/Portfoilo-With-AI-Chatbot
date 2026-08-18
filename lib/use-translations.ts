"use client";

import { useAppStore } from "@/store/app-store";
import { translate, type Lang } from "@/lib/i18n";

/**
 * 客户端翻译 Hook / Client-side translation hook.
 *
 * 用法 / Usage:
 *   const { t, lang } = useTranslations();
 *   t("nav.home")               // 当前语言的翻译
 *   t("chat.quota", { percent: 80 })
 */
export function useTranslations(): {
  t: (key: string, vars?: Record<string, string | number>) => string;
  lang: Lang;
} {
  const lang = useAppStore((s) => s.language);
  return {
    t: (key, vars) => translate(lang, key, vars),
    lang,
  };
}

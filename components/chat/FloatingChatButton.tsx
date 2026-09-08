"use client";

import { Bot } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useTranslations } from "@/lib/use-translations";

export default function FloatingChatButton() {
  const { t } = useTranslations();
  const isChatOpen = useAppStore((s) => s.isChatOpen);
  const openChat = useAppStore((s) => s.openChat);

  if (isChatOpen) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      aria-label={t("floating.open")}
      className="btn-grad fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-[0_10px_30px_-6px_rgba(55,148,255,0.65)] transition-transform hover:scale-105"
    >
      <Bot className="h-6 w-6" />
    </button>
  );
}

"use client";

import { Bot } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export default function FloatingChatButton() {
  const isChatOpen = useAppStore((s) => s.isChatOpen);
  const openChat = useAppStore((s) => s.openChat);

  if (isChatOpen) return null;

  return (
    <button
      type="button"
      onClick={openChat}
      className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      aria-label="打开 AI 助手"
    >
      <Bot className="h-6 w-6" />
    </button>
  );
}

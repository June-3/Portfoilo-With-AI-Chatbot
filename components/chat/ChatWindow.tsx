"use client";

import { Bot, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export default function ChatWindow() {
  const isChatOpen = useAppStore((s) => s.isChatOpen);
  const closeChat = useAppStore((s) => s.closeChat);

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[480px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
      <div className="flex items-center justify-between border-b border-border bg-accent/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">AI 助手</p>
            <p className="text-xs text-muted">在线 · 即将上线</p>
          </div>
        </div>
        <button
          type="button"
          onClick={closeChat}
          className="rounded-md p-1.5 text-muted transition-colors hover:bg-accent hover:text-foreground"
          aria-label="关闭聊天"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-muted">
        AI 聊天助手将在「模块二」接入，届时可在此与助手对话并提交私聊申请。
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Send, X } from "lucide-react";
import {
  useAppStore,
  selectRemainingPercent,
  type ChatMessage,
} from "@/store/app-store";
import { getAnonymousId } from "@/lib/client-id";
import { cn } from "@/lib/utils";

const QUICK_QUESTIONS = ["介绍一下他的项目", "他擅长什么技术", "如何联系他"];

function nextId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatWindow() {
  const isChatOpen = useAppStore((s) => s.isChatOpen);
  const closeChat = useAppStore((s) => s.closeChat);
  const startPrivateRequest = useAppStore((s) => s.startPrivateRequest);
  const setQuota = useAppStore((s) => s.setQuota);
  const remainingPercent = useAppStore(selectRemainingPercent);
  const conversation = useAppStore((s) => s.conversation);
  const addConversationMessage = useAppStore((s) => s.addConversationMessage);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开窗口时聚焦输入框
  useEffect(() => {
    if (isChatOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isChatOpen]);

  // 消息变化时滚动到底部
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation, isTyping]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || isTyping) return;

    const history = conversation.map(({ role, content }) => ({ role, content }));
    addConversationMessage({ id: nextId(), role: "user", content });
    setInput("");
    setError(null);
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          history,
          anonymousId: getAnonymousId(),
        }),
      });
      const data = await res.json();

      if (data?.quota) {
        setQuota({
          usedTokens: data.quota.usedTokens,
          dailyLimit: data.quota.dailyLimit,
        });
      }

      if (!res.ok) {
        setError(data?.message ?? "请求失败，请稍后再试。");
      } else {
        addConversationMessage({
          id: nextId(),
          role: "assistant",
          content: data.reply,
        });
      }
    } catch {
      setError("网络错误，请稍后再试。");
    } finally {
      setIsTyping(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  if (!isChatOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex h-[540px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-border bg-accent/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">AI 助手</p>
            <p className="text-xs text-muted">今日剩余额度：{remainingPercent}%</p>
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

      {/* 消息区 */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {conversation.length === 0 && (
          <div className="space-y-3">
            <p className="text-center text-sm text-muted">
              你好！我是站长的 AI 助手，可以问我关于他的经历、项目与技能。
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:bg-accent hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {conversation.map((m: ChatMessage) => (
          <div
            key={m.id}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-foreground",
              )}
            >
              {m.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl bg-accent px-4 py-3">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-muted" />
            </div>
          </div>
        )}

        {error && <p className="text-center text-xs text-red-500">{error}</p>}
      </div>

      {/* 私聊申请入口 */}
      <div className="border-t border-border px-4 py-2">
        <button
          type="button"
          onClick={startPrivateRequest}
          className="w-full rounded-lg border border-border py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          私聊申请
        </button>
      </div>

      {/* 输入区 */}
      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-border px-3 py-2"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题…"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
          aria-label="发送"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

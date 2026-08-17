"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Send, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { summarizeConversation } from "@/lib/conversation";

export default function PrivateRequestModal() {
  const isPrivateRequestOpen = useAppStore((s) => s.isPrivateRequestOpen);
  const closePrivateRequest = useAppStore((s) => s.closePrivateRequest);
  const user = useAppStore((s) => s.user);
  const conversation = useAppStore((s) => s.conversation);
  const markRequestSubmitted = useAppStore((s) => s.markRequestSubmitted);

  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const preview = summarizeConversation(
    conversation.map(({ role, content }) => ({ role, content })),
  );

  function handleClose() {
    setSent(false);
    setError(null);
    setLoading(false);
    closePrivateRequest();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!user.email) {
      setError("请先登录。");
      return;
    }
    if (!consent) {
      setError("请先勾选同意隐私政策。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/private-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          consent,
          conversation: conversation.map(({ role, content }) => ({ role, content })),
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        setError(data?.message ?? "提交失败，请稍后再试。");
      } else {
        markRequestSubmitted();
        setSent(true);
      }
    } catch {
      setError("网络错误，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  if (!isPrivateRequestOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">私聊申请</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-muted transition-colors hover:bg-accent hover:text-foreground"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 text-center">
            <CircleCheck className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-3 text-base font-semibold">已发送，请查收邮件</h3>
            <p className="mt-2 text-sm text-muted">
              已向 <span className="font-medium text-foreground">{user.email}</span>{" "}
              发送确认邮件，我会尽快回复你。
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 w-full rounded-lg border border-border py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              关闭
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="rounded-lg bg-accent/60 p-3">
              <p className="text-xs text-muted">发送到邮箱</p>
              <p className="mt-1 text-sm font-medium">{user.email ?? "（未登录）"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">对话摘要预览</p>
              <p className="mt-1 rounded-lg border border-border p-3 text-sm text-muted">
                {preview}
              </p>
            </div>
            <label className="flex items-start gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>我同意提交邮箱即视为同意隐私政策，并将对话摘要发送给站长。</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "发送中…" : "确认发送"}
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

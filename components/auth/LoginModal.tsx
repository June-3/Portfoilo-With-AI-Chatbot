"use client";

import { useState, type FormEvent } from "react";
import { Mail, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export default function LoginModal() {
  const isLoginOpen = useAppStore((s) => s.isLoginOpen);
  const closeLogin = useAppStore((s) => s.closeLogin);
  const completeLogin = useAppStore((s) => s.completeLogin);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep("email");
    setCode("");
    setDevCode(null);
    setError(null);
    setLoading(false);
  }

  function handleClose() {
    reset();
    closeLogin();
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("请输入邮箱。");
      return;
    }
    if (!consent) {
      setError("请先勾选同意隐私政策。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        setError(data?.message ?? "验证码发送失败。");
      } else {
        setDevCode(data?.devCode ?? null);
        setStep("code");
      }
    } catch {
      setError("网络错误，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!code.trim()) {
      setError("请输入验证码。");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok || data?.ok === false) {
        setError(data?.message ?? "验证失败。");
      } else {
        completeLogin({
          email: data.email,
          isLoggedIn: true,
          hasSubmittedRequest: false,
        });
        reset();
      }
    } catch {
      setError("网络错误，请稍后再试。");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoginOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">邮箱登录</h2>
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

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="mt-5 space-y-4">
            <div>
              <label className="text-sm font-medium">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <label className="flex items-start gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5"
              />
              <span>我同意提交邮箱即视为同意隐私政策，用于本次私聊申请。</span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? "发送中…" : "发送验证码"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-5 space-y-4">
            <p className="text-sm text-muted">
              验证码已发送至 <span className="font-medium text-foreground">{email}</span>
            </p>
            {devCode && (
              <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                开发模式验证码：{devCode}
              </p>
            )}
            <div>
              <label className="text-sm font-medium">验证码</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 位数字"
                inputMode="numeric"
                maxLength={6}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
              >
                上一步
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {loading ? "验证中…" : "验证并登录"}
              </button>
            </div>
          </form>
        )}

        {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

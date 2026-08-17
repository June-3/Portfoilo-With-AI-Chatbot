"use client";

import { Mail, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export default function LoginModal() {
  const isLoginOpen = useAppStore((s) => s.isLoginOpen);
  const closeLogin = useAppStore((s) => s.closeLogin);

  if (!isLoginOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={closeLogin}
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
            onClick={closeLogin}
            className="rounded-md p-1 text-muted transition-colors hover:bg-accent hover:text-foreground"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">
          邮箱验证码登录将在「模块二」接入，用于提高每日额度并提交私聊申请。
        </p>
      </div>
    </div>
  );
}

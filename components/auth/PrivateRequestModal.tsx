"use client";

import { useState, type FormEvent } from "react";
import { CircleCheck, Send, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { summarizeConversation } from "@/lib/conversation";
import { useTranslations } from "@/lib/use-translations";

export default function PrivateRequestModal() {
  const { t } = useTranslations();
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
      setError(t("request.needLogin"));
      return;
    }
    if (!consent) {
      setError(t("login.needConsent"));
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
        setError(data?.message ?? t("request.submitFailed"));
      } else {
        markRequestSubmitted();
        setSent(true);
      }
    } catch {
      setError(t("chat.networkError"));
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
            <h2 className="text-lg font-semibold">{t("request.title")}</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-muted transition-colors hover:bg-accent hover:text-foreground"
            aria-label={t("request.close")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {sent ? (
          <div className="mt-6 text-center">
            <CircleCheck className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-3 text-base font-semibold">{t("request.sent")}</h3>
            <p className="mt-2 text-sm text-muted">
              {t("request.sentTo")}{" "}
              <span className="font-medium text-foreground">{user.email}</span>{" "}
              {t("request.sentToEnd")}
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-5 w-full rounded-lg border border-border py-2.5 text-sm font-medium transition-colors hover:bg-accent"
            >
              {t("request.close")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="rounded-lg bg-accent/60 p-3">
              <p className="text-xs text-muted">{t("request.sendTo")}</p>
              <p className="mt-1 text-sm font-medium">
                {user.email ?? t("request.notLoggedIn")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">{t("request.summaryPreview")}</p>
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
              <span>
                {t("request.consent")}{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {t("login.privacy")}
                </a>
                {t("request.consentEnd")}
              </span>
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
            >
              {loading ? t("request.sending") : t("request.confirm")}
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
      </div>
    </div>
  );
}

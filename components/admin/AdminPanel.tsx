"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  BarChart3,
  Inbox,
  Lock,
  LogOut,
  Plus,
  Save,
  Settings,
  ShieldBan,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/use-translations";

const TOKEN_KEY = "portfolio_admin_token";

type Tab = "settings" | "requests" | "stats" | "blacklist";

export default function AdminPanel() {
  const { t } = useTranslations();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setToken(window.localStorage.getItem(TOKEN_KEY));
    } catch {
      setToken(null);
    }
    setReady(true);
  }, []);

  if (!ready) {
    return <p className="py-16 text-center text-muted">{t("admin.loading")}</p>;
  }

  if (!token) {
    return (
      <LoginForm
        onLogin={(value) => {
          try {
            window.localStorage.setItem(TOKEN_KEY, value);
          } catch {
            /* ignore */
          }
          setToken(value);
        }}
      />
    );
  }

  return (
    <AdminDashboard
      token={token}
      onLogout={() => {
        try {
          window.localStorage.removeItem(TOKEN_KEY);
        } catch {
          /* ignore */
        }
        setToken(null);
      }}
    />
  );
}

// ---------------------------------------------------------------------------

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const { t } = useTranslations();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.message ?? t("chat.networkError"));
      } else {
        onLogin(data.token);
      }
    } catch {
      setError(t("chat.networkError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-16">
      <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">{t("admin.login.title")}</h1>
        </div>
        <p className="mt-2 text-sm text-muted">{t("admin.login.subtitle")}</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("admin.login.password")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? t("admin.login.loading") : t("admin.login.button")}
          </button>
          {error && <p className="text-center text-xs text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function AdminDashboard({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const { t } = useTranslations();
  const [tab, setTab] = useState<Tab>("settings");

  const tabs: { id: Tab; key: string; Icon: typeof Settings }[] = [
    { id: "settings", key: "admin.tab.settings", Icon: Settings },
    { id: "requests", key: "admin.tab.requests", Icon: Inbox },
    { id: "stats", key: "admin.tab.stats", Icon: BarChart3 },
    { id: "blacklist", key: "admin.tab.blacklist", Icon: ShieldBan },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{t("admin.title")}</h1>
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          {t("admin.logout")}
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map(({ id, key, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === id
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-accent hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "settings" && <SettingsTab token={token} />}
        {tab === "requests" && <RequestsTab token={token} />}
        {tab === "stats" && <StatsTab token={token} />}
        {tab === "blacklist" && <BlacklistTab token={token} />}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface PublicSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpFrom: string;
  ownerEmail: string;
  hasSmtpPass: boolean;
  deepseekBaseUrl: string;
  deepseekModel: string;
  hasApiKey: boolean;
  anonymousDailyLimit: number;
  loggedInDailyLimit: number;
  verificationEmailSubject: string;
  verificationEmailTemplate: string;
  userConfirmationSubject: string;
  userConfirmationTemplate: string;
  ownerNotificationSubject: string;
  ownerNotificationTemplate: string;
}

function SettingsTab({ token }: { token: string }) {
  const { t, lang } = useTranslations();
  const [form, setForm] = useState<Record<string, string> | null>(null);
  const [smtpPass, setSmtpPass] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [hasSmtpPass, setHasSmtpPass] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: PublicSettings = await res.json();
      setForm({
        smtpHost: data.smtpHost ?? "",
        smtpPort: String(data.smtpPort ?? 465),
        smtpUser: data.smtpUser ?? "",
        smtpFrom: data.smtpFrom ?? "",
        ownerEmail: data.ownerEmail ?? "",
        deepseekBaseUrl: data.deepseekBaseUrl ?? "",
        deepseekModel: data.deepseekModel ?? "",
        anonymousDailyLimit: String(data.anonymousDailyLimit ?? 2000),
        loggedInDailyLimit: String(data.loggedInDailyLimit ?? 10000),
        verificationEmailSubject: data.verificationEmailSubject ?? "",
        verificationEmailTemplate: data.verificationEmailTemplate ?? "",
        userConfirmationSubject: data.userConfirmationSubject ?? "",
        userConfirmationTemplate: data.userConfirmationTemplate ?? "",
        ownerNotificationSubject: data.ownerNotificationSubject ?? "",
        ownerNotificationTemplate: data.ownerNotificationTemplate ?? "",
      });
      setHasSmtpPass(data.hasSmtpPass);
      setHasApiKey(data.hasApiKey);
    } catch {
      setMessage(t("chat.networkError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function setField(key: string, value: string) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          smtpHost: form.smtpHost,
          smtpPort: Number(form.smtpPort) || 465,
          smtpUser: form.smtpUser,
          smtpFrom: form.smtpFrom,
          ownerEmail: form.ownerEmail,
          deepseekBaseUrl: form.deepseekBaseUrl,
          deepseekModel: form.deepseekModel,
          anonymousDailyLimit: Number(form.anonymousDailyLimit) || 0,
          loggedInDailyLimit: Number(form.loggedInDailyLimit) || 0,
          verificationEmailSubject: form.verificationEmailSubject,
          verificationEmailTemplate: form.verificationEmailTemplate,
          userConfirmationSubject: form.userConfirmationSubject,
          userConfirmationTemplate: form.userConfirmationTemplate,
          ownerNotificationSubject: form.ownerNotificationSubject,
          ownerNotificationTemplate: form.ownerNotificationTemplate,
          smtpPass: smtpPass || undefined,
          deepseekApiKey: apiKey || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data?.message ?? t("chat.networkError"));
      } else {
        setMessage(t("admin.saved"));
        setSmtpPass("");
        setApiKey("");
        setHasSmtpPass(data.settings?.hasSmtpPass ?? hasSmtpPass);
        setHasApiKey(data.settings?.hasApiKey ?? hasApiKey);
      }
    } catch {
      setMessage(t("chat.networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return <p className="py-12 text-center text-sm text-muted">{t("admin.loading")}</p>;
  }

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary";

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* SMTP */}
      <section>
        <h2 className="text-base font-semibold">{t("admin.smtpSection")}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            {t("admin.smtpHost")}
            <input className={inputCls} value={form.smtpHost} onChange={(e) => setField("smtpHost", e.target.value)} placeholder="smtp.example.com" />
          </label>
          <label className="text-sm">
            {t("admin.smtpPort")}
            <input className={inputCls} value={form.smtpPort} onChange={(e) => setField("smtpPort", e.target.value)} placeholder="465" inputMode="numeric" />
          </label>
          <label className="text-sm">
            {t("admin.smtpUser")}
            <input className={inputCls} value={form.smtpUser} onChange={(e) => setField("smtpUser", e.target.value)} placeholder="you@example.com" />
          </label>
          <label className="text-sm">
            {t("admin.smtpFrom")}
            <input className={inputCls} value={form.smtpFrom} onChange={(e) => setField("smtpFrom", e.target.value)} placeholder={lang === "en" ? "Same as username" : "同用户名"} />
          </label>
          <label className="text-sm">
            {t("admin.smtpPass")}（{hasSmtpPass ? t("admin.isSet") : t("admin.notSet")}）
            <input type="password" className={inputCls} value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} placeholder={t("admin.leaveBlank")} />
          </label>
          <label className="text-sm">
            {t("admin.ownerEmail")}
            <input className={inputCls} value={form.ownerEmail} onChange={(e) => setField("ownerEmail", e.target.value)} placeholder="owner@example.com" />
          </label>
        </div>
      </section>

      {/* AI */}
      <section>
        <h2 className="text-base font-semibold">{t("admin.aiSection")}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="text-sm">
            {t("admin.apiKey")}（{hasApiKey ? t("admin.isSet") : t("admin.notSet")}）
            <input type="password" className={inputCls} value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder={t("admin.leaveBlank")} />
          </label>
          <label className="text-sm">
            {t("admin.model")}
            <input className={inputCls} value={form.deepseekModel} onChange={(e) => setField("deepseekModel", e.target.value)} placeholder="deepseek-chat" />
          </label>
          <label className="text-sm sm:col-span-2">
            {t("admin.baseUrl")}
            <input className={inputCls} value={form.deepseekBaseUrl} onChange={(e) => setField("deepseekBaseUrl", e.target.value)} placeholder="https://api.deepseek.com" />
          </label>
          <label className="text-sm">
            {t("admin.anonLimit")}
            <input className={inputCls} value={form.anonymousDailyLimit} onChange={(e) => setField("anonymousDailyLimit", e.target.value)} inputMode="numeric" />
          </label>
          <label className="text-sm">
            {t("admin.loggedInLimit")}
            <input className={inputCls} value={form.loggedInDailyLimit} onChange={(e) => setField("loggedInDailyLimit", e.target.value)} inputMode="numeric" />
          </label>
        </div>
      </section>

      {/* 邮件模板 / Email templates */}
      <section>
        <h2 className="text-base font-semibold">{t("admin.templateSection")}</h2>
        <p className="mt-1 text-xs text-muted">{t("admin.templateHint")}</p>
        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            {t("admin.verifSubject")}
            <input className={inputCls} value={form.verificationEmailSubject} onChange={(e) => setField("verificationEmailSubject", e.target.value)} />
          </label>
          <label className="block text-sm">
            {t("admin.verifBody")}
            <textarea className={cn(inputCls, "min-h-[80px]")} value={form.verificationEmailTemplate} onChange={(e) => setField("verificationEmailTemplate", e.target.value)} />
          </label>
          <label className="block text-sm">
            {t("admin.userSubject")}
            <input className={inputCls} value={form.userConfirmationSubject} onChange={(e) => setField("userConfirmationSubject", e.target.value)} />
          </label>
          <label className="block text-sm">
            {t("admin.userBody")}
            <textarea className={cn(inputCls, "min-h-[80px]")} value={form.userConfirmationTemplate} onChange={(e) => setField("userConfirmationTemplate", e.target.value)} />
          </label>
          <label className="block text-sm">
            {t("admin.ownerSubject")}
            <input className={inputCls} value={form.ownerNotificationSubject} onChange={(e) => setField("ownerNotificationSubject", e.target.value)} />
          </label>
          <label className="block text-sm">
            {t("admin.ownerBody")}
            <textarea className={cn(inputCls, "min-h-[100px]")} value={form.ownerNotificationTemplate} onChange={(e) => setField("ownerNotificationTemplate", e.target.value)} />
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? t("admin.saving") : t("admin.save")}
        </button>
        {message && <span className="text-sm text-muted">{message}</span>}
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------

interface PrivateRequestView {
  id: string;
  email: string;
  intent: string;
  summary: string;
  markdown: string;
  createdAt: string;
}

function RequestsTab({ token }: { token: string }) {
  const { t, lang } = useTranslations();
  const [requests, setRequests] = useState<PrivateRequestView[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/requests", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRequests(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!requests) {
    return <p className="py-12 text-center text-sm text-muted">{t("admin.loading")}</p>;
  }

  if (requests.length === 0) {
    return <p className="py-12 text-center text-sm text-muted">{t("admin.noRequests")}</p>;
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <div key={r.id} className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium">{r.email}</p>
              <p className="mt-0.5 text-xs text-muted">
                {r.intent} · {new Date(r.createdAt).toLocaleString(lang === "en" ? "en-US" : "zh-CN")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-accent"
            >
              {expanded === r.id ? t("admin.collapse") : t("admin.viewConversation")}
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">
            {t("admin.summary")}：{r.summary}
          </p>
          {expanded === r.id && (
            <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap rounded-lg bg-accent/50 p-3 text-xs leading-relaxed text-foreground">
              {r.markdown}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------

interface DayStat {
  date: string;
  requests: number;
  tokens: number;
}

function StatsTab({ token }: { token: string }) {
  const { t, lang } = useTranslations();
  const [stats, setStats] = useState<DayStat[] | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(Array.isArray(data) ? data : []);
    })();
  }, [token]);

  if (!stats) {
    return <p className="py-12 text-center text-sm text-muted">{t("admin.loading")}</p>;
  }

  const maxTokens = Math.max(1, ...stats.map((s) => s.tokens));
  const totalRequests = stats.reduce((sum, s) => sum + s.requests, 0);
  const totalTokens = stats.reduce((sum, s) => sum + s.tokens, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted">{t("admin.requests14")}</p>
          <p className="mt-1 text-2xl font-semibold">{totalRequests}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs text-muted">{t("admin.tokens14")}</p>
          <p className="mt-1 text-2xl font-semibold">{totalTokens}</p>
        </div>
      </div>

      <div className="space-y-2">
        {stats.map((s) => (
          <div key={s.date} className="flex items-center gap-3 text-sm">
            <span className="w-24 shrink-0 text-muted">{s.date.slice(5)}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-accent/60">
              <div
                className="h-full bg-primary"
                style={{ width: `${(s.tokens / maxTokens) * 100}%` }}
              />
            </div>
            <span className="w-28 shrink-0 text-right text-muted">
              {s.requests} {lang === "en" ? "req" : "次"} / {s.tokens} token
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function BlacklistTab({ token }: { token: string }) {
  const { t } = useTranslations();
  const [list, setList] = useState<string[] | null>(null);
  const [input, setInput] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/admin/blacklist", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setList(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    const id = input.trim();
    if (!id) return;
    setMessage(null);
    const res = await fetch("/api/admin/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data?.blacklist) setList(data.blacklist);
    setInput("");
  }

  async function handleRemove(id: string) {
    setMessage(null);
    const res = await fetch("/api/admin/blacklist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (data?.blacklist) setList(data.blacklist);
  }

  if (!list) {
    return <p className="py-12 text-center text-sm text-muted">{t("admin.loading")}</p>;
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("admin.blacklistPlaceholder")}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          {t("admin.add")}
        </button>
      </form>

      {list.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{t("admin.blacklistEmpty")}</p>
      ) : (
        <div className="space-y-2">
          {list.map((id) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
            >
              <span className="font-mono text-sm">{id}</span>
              <button
                type="button"
                onClick={() => handleRemove(id)}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t("admin.remove")}
              </button>
            </div>
          ))}
        </div>
      )}

      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}

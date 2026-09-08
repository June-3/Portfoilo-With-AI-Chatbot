"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  CircleCheck,
  Code2,
  Folder,
  Home,
  Languages,
  LogIn,
  Menu,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useTranslations } from "@/lib/use-translations";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  key: string;
  Icon: LucideIcon;
}

const navLinks: NavLink[] = [
  { href: "/", key: "nav.home", Icon: Home },
  { href: "/about", key: "nav.about", Icon: User },
  { href: "/projects", key: "nav.projects", Icon: Folder },
  { href: "/skills", key: "nav.skills", Icon: Code2 },
];

export default function Navbar() {
  const pathname = usePathname();
  const { t, lang } = useTranslations();
  const isMobileMenuOpen = useAppStore((s) => s.isMobileMenuOpen);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);
  const closeMobileMenu = useAppStore((s) => s.closeMobileMenu);
  const openChat = useAppStore((s) => s.openChat);
  const openLogin = useAppStore((s) => s.openLogin);
  const user = useAppStore((s) => s.user);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);

  const languageLabel = lang === "zh" ? "EN" : "中文";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* 品牌 / brand */}
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="group flex items-center gap-2.5 font-bold"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm text-white shadow-[0_0_16px_rgba(55,148,255,0.5)] transition-transform group-hover:scale-105"
            style={{ background: "linear-gradient(135deg, #0e639c, #4fc1ff)" }}
          >
            <Code2 style={{ width: 18, height: 18 }} />
          </span>
          <span className="text-[#f5f1fc]">{t("nav.brand")}</span>
        </Link>

        {/* 桌面端导航 / Desktop nav */}
        <div className="hidden items-center gap-0.5 md:flex">
          {navLinks.map(({ href, key, Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "nav-link-dev inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold text-muted transition-colors hover:text-white",
                  active && "is-active text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {t(key)}
              </Link>
            );
          })}

          <div className="ml-3 flex items-center gap-2">
            <button
              type="button"
              onClick={openChat}
              className="btn-grad rounded-full px-4 py-2 text-sm font-bold"
            >
              <Bot className="h-4 w-4" />
              {t("nav.aiAssistant")}
            </button>

            {user.hasSubmittedRequest ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-200">
                <CircleCheck className="h-4 w-4" />
                {t("nav.submitted")}
              </span>
            ) : user.isLoggedIn ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-muted">
                <User className="h-4 w-4" />
                {t("nav.loggedIn")}
              </span>
            ) : (
              <button
                type="button"
                onClick={openLogin}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-[#4fc1ff] hover:bg-accent hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.emailLogin")}
              </button>
            )}

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-2 text-sm font-semibold text-muted transition-colors hover:border-[#4fc1ff] hover:bg-accent hover:text-white"
              aria-label="Switch language"
            >
              <Languages className="h-4 w-4" />
              {languageLabel}
            </button>
          </div>
        </div>

        {/* 移动端汉堡按钮 / Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 移动端下拉菜单 / Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
            {navLinks.map(({ href, key, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-accent hover:text-white",
                    active && "bg-accent text-white",
                  )}
                >
                  <Icon className="h-4 w-4 text-[#4fc1ff]" />
                  {t(key)}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openChat();
              }}
              className="btn-grad mt-2 w-full rounded-full px-3 py-2.5 text-sm font-bold"
            >
              <Bot className="h-4 w-4" />
              {t("nav.aiAssistant")}
            </button>

            {user.hasSubmittedRequest ? (
              <span className="flex w-full items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-2.5 text-sm font-medium text-emerald-200">
                <CircleCheck className="h-4 w-4" />
                {t("nav.submitted")}
              </span>
            ) : user.isLoggedIn ? (
              <span className="flex w-full items-center gap-2 rounded-full border border-border px-3 py-2.5 text-sm font-medium text-muted">
                <User className="h-4 w-4" />
                {t("nav.loggedIn")}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  openLogin();
                }}
                className="flex w-full items-center gap-2 rounded-full border border-border px-3 py-2.5 text-sm font-semibold"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.emailLogin")}
              </button>
            )}

            <button
              type="button"
              onClick={toggleLanguage}
              className="flex w-full items-center gap-2 rounded-full border border-border px-3 py-2.5 text-sm font-semibold text-muted"
            >
              <Languages className="h-4 w-4" />
              {languageLabel}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

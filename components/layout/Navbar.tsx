"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, CircleCheck, Languages, LogIn, Menu, User, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { useTranslations } from "@/lib/use-translations";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/projects", key: "nav.projects" },
  { href: "/skills", key: "nav.skills" },
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          onClick={closeMobileMenu}
          className="flex items-center gap-2 font-semibold"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </span>
          <span>{t("nav.brand")}</span>
        </Link>

        {/* 桌面端导航 / Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent hover:text-foreground",
                  active && "bg-accent text-foreground",
                )}
              >
                {t(link.key)}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={openChat}
            className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Bot className="h-4 w-4" />
            {t("nav.aiAssistant")}
          </button>

          {user.hasSubmittedRequest ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              <CircleCheck className="h-4 w-4" />
              {t("nav.submitted")}
            </span>
          ) : user.isLoggedIn ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted">
              <User className="h-4 w-4" />
              {t("nav.loggedIn")}
            </span>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <LogIn className="h-4 w-4" />
              {t("nav.emailLogin")}
            </button>
          )}

          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Switch language"
          >
            <Languages className="h-4 w-4" />
            {languageLabel}
          </button>
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
        <div className="border-t border-border md:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3 sm:px-6">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-accent hover:text-foreground",
                    active && "bg-accent text-foreground",
                  )}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openChat();
              }}
              className="flex w-full items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              <Bot className="h-4 w-4" />
              {t("nav.aiAssistant")}
            </button>
            {user.hasSubmittedRequest ? (
              <span className="flex w-full items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                <CircleCheck className="h-4 w-4" />
                {t("nav.submitted")}
              </span>
            ) : user.isLoggedIn ? (
              <span className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted">
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
                className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium"
              >
                <LogIn className="h-4 w-4" />
                {t("nav.emailLogin")}
              </button>
            )}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted"
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

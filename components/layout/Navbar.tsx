"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LogIn, Menu, X } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "首页" },
  { href: "/about", label: "关于我" },
  { href: "/projects", label: "项目作品" },
  { href: "/skills", label: "技能/经历" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isMobileMenuOpen = useAppStore((s) => s.isMobileMenuOpen);
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu);
  const closeMobileMenu = useAppStore((s) => s.closeMobileMenu);
  const openChat = useAppStore((s) => s.openChat);
  const openLogin = useAppStore((s) => s.openLogin);

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
          <span>个人作品集</span>
        </Link>

        {/* 桌面端导航 */}
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
                {link.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={openChat}
            className="ml-2 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            <Bot className="h-4 w-4" />
            AI 助手
          </button>

          <button
            type="button"
            onClick={openLogin}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            <LogIn className="h-4 w-4" />
            邮箱登录
          </button>
        </div>

        {/* 移动端汉堡按钮 */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "关闭菜单" : "打开菜单"}
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 移动端下拉菜单 */}
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
                  {link.label}
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
              AI 助手
            </button>
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                openLogin();
              }}
              className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium"
            >
              <LogIn className="h-4 w-4" />
              邮箱登录
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

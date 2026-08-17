import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWindow from "@/components/chat/ChatWindow";
import LoginModal from "@/components/auth/LoginModal";

export const metadata: Metadata = {
  title: "个人作品集",
  description: "个人作品集与 AI 助手 —— 展示经历、项目与技能，并提供智能问答与私聊申请。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWindow />
        <LoginModal />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWindow from "@/components/chat/ChatWindow";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import LoginModal from "@/components/auth/LoginModal";
import PrivateRequestModal from "@/components/auth/PrivateRequestModal";
import LanguageHydration from "@/components/LanguageHydration";

export const metadata: Metadata = {
  title: {
    default: "个人作品集",
    template: "%s | 个人作品集",
  },
  description: "个人作品集与 AI 助手 —— 展示经历、项目与技能，并提供智能问答与私聊申请。",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <LanguageHydration />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingChatButton />
        <ChatWindow />
        <LoginModal />
        <PrivateRequestModal />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWindow from "@/components/chat/ChatWindow";
import FloatingChatButton from "@/components/chat/FloatingChatButton";
import LoginModal from "@/components/auth/LoginModal";
import PrivateRequestModal from "@/components/auth/PrivateRequestModal";
import ClientHydration from "@/components/ClientHydration";

export const metadata: Metadata = {
  title: {
    default: "Personal Portfolio",
    template: "%s | Personal Portfolio",
  },
  description: "Personal portfolio with AI assistant — showcasing experience, projects, and skills, along with intelligent Q&A and private chat requests.",
};

export const viewport: Viewport = {
  themeColor: "#1e1e1e",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        {/* 星空/星云背景层 / fixed starfield backdrop */}
        <div aria-hidden className="bg-stage pointer-events-none fixed inset-0 -z-10" />
        <ClientHydration />
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

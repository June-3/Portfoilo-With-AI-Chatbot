import type { Metadata } from "next";
import PrivacyContent from "@/components/PrivacyContent";

export const metadata: Metadata = {
  title: "隐私政策",
  description: "本站的隐私政策：说明我们如何收集、使用和保护你的个人信息。",
};

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">隐私政策 / Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">最近更新：2025 年 / Last updated: 2025</p>
      <PrivacyContent />
    </section>
  );
}

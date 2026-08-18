import type { Metadata } from "next";
import AdminPanel from "@/components/admin/AdminPanel";

export const metadata: Metadata = {
  title: "后台管理",
};

export default function AdminPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <AdminPanel />
    </section>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "@/lib/use-translations";

export default function Footer() {
  const { t } = useTranslations();

  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted sm:px-6">
        <p>
          © {new Date().getFullYear()} {t("nav.brand")} · {t("footer.builtWith")}
        </p>
        <Link
          href="/privacy"
          className="transition-colors hover:text-foreground hover:underline"
        >
          {t("footer.privacy")}
        </Link>
      </div>
    </footer>
  );
}

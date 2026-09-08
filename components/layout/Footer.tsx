"use client";

import Link from "next/link";
import { Code2, Heart } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";

export default function Footer() {
  const { t } = useTranslations();

  return (
    <footer className="relative mt-4 border-t border-border/60 py-7">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center text-sm text-muted sm:px-6">
        <p>
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-foreground">{t("nav.brand")}</span>
        </p>
        <p className="inline-flex flex-wrap items-center justify-center gap-1.5">
          {t("footer.builtWith")}
          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
            <Code2 className="h-3.5 w-3.5 text-[#4fc1ff]" />
            Next.js
          </span>
          <Heart className="h-3.5 w-3.5 fill-[#4fc1ff] text-[#4fc1ff]" />
        </p>
        <Link
          href="/privacy"
          className="text-xs transition-colors hover:text-[#4fc1ff] hover:underline"
        >
          {t("footer.privacy")}
        </Link>
      </div>
    </footer>
  );
}

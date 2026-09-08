"use client";

import { ArrowRight, Mail, MapPin } from "lucide-react";
import SocialLinks from "./SocialLinks";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { Profile, Social } from "@/lib/types";

export default function ContactSection({
  profile,
  social,
}: {
  profile: Profile;
  social: Social;
}) {
  const { t, lang } = useTranslations();
  const location = pickLocalized(lang, profile.location ?? "", profile.location_en);
  const email = profile.email || social.email;

  return (
    <section id="contact" className="relative pb-24 pt-8">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* 分隔装饰 / ornamental divider */}
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-20 bg-gradient-to-r from-transparent to-[#3794ff]/70 sm:w-32" />
          <Mail className="h-5 w-5 text-[#4fc1ff]" />
          <span className="h-px w-20 bg-gradient-to-l from-transparent to-[#3794ff]/70 sm:w-32" />
        </div>

        <span className="kicker mt-8 block">{t("contact.title")}</span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {t("contact.slogan")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">{t("contact.subtitle")}</p>

        <div className="mx-auto mt-10 max-w-md rounded-3xl border border-border/70 bg-white/[0.03] p-7 shadow-[0_18px_50px_-24px_rgba(14,99,156,0.5)]">
          {email && (
            <a
              href={`mailto:${email}`}
              className="btn-grad mx-auto w-full rounded-full px-7 py-3 text-sm font-bold"
            >
              <Mail className="h-4 w-4" />
              {email}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}

          <div className="mt-5 flex flex-col items-center justify-center gap-2 text-sm">
            {location && (
              <p className="flex items-center gap-2 text-muted">
                <MapPin className="h-4 w-4 text-[#4fc1ff]" />
                {location}
              </p>
            )}
          </div>

          <SocialLinks social={social} className="mt-6 justify-center" />
        </div>
      </div>
    </section>
  );
}

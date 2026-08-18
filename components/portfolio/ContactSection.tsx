"use client";

import { Mail, MapPin } from "lucide-react";
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

  return (
    <section id="contact" className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-2xl font-bold sm:text-3xl">{t("contact.title")}</h2>
        <p className="mt-3 text-muted">{t("contact.subtitle")}</p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Mail className="h-4 w-4" />
              {profile.email}
            </a>
          )}
          {location && (
            <p className="flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4" />
              {location}
            </p>
          )}
        </div>
        <SocialLinks social={social} className="mt-8 justify-center" />
      </div>
    </section>
  );
}

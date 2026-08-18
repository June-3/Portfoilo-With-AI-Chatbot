"use client";

import Avatar from "./Avatar";
import SocialLinks from "./SocialLinks";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { Profile, Social } from "@/lib/types";

export default function Hero({ profile, social }: { profile: Profile; social: Social }) {
  const { t, lang } = useTranslations();

  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-20 text-center sm:px-6 md:flex-row md:items-center md:gap-14 md:py-28 md:text-left">
      <div className="flex-1">
        <p className="text-sm font-semibold text-primary">
          {pickLocalized(lang, profile.title, profile.title_en)}
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          {pickLocalized(lang, profile.name, profile.name_en)}
        </h1>
        <p className="mt-4 text-lg text-muted">
          {pickLocalized(lang, profile.headline, profile.headline_en)}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
          <a
            href="#contact"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            {t("hero.contact")}
          </a>
          <a
            href="/projects"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
          >
            {t("hero.viewProjects")}
          </a>
        </div>
        <SocialLinks social={social} className="mt-8 justify-center md:justify-start" />
      </div>
      <div className="shrink-0">
        <Avatar
          name={pickLocalized(lang, profile.name, profile.name_en)}
          src={profile.avatar}
          size={160}
        />
      </div>
    </section>
  );
}

"use client";

import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import Timeline from "./Timeline";
import type { Profile, ExperienceItem } from "@/lib/types";

export default function AboutContent({
  profile,
  experience,
}: {
  profile: Profile;
  experience: ExperienceItem[];
}) {
  const { t, lang } = useTranslations();
  const education = experience.filter((e) => e.type === "education");

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("about.title")}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">
        {pickLocalized(lang, profile.bio, profile.bio_en)}
      </p>

      {education.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold">{t("about.education")}</h2>
          <div className="mt-6">
            <Timeline items={education} />
          </div>
        </div>
      )}
    </section>
  );
}

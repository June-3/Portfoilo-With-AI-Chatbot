"use client";

import { useTranslations } from "@/lib/use-translations";
import SkillsSection from "./SkillsSection";
import Timeline from "./Timeline";
import type { SkillCategory, ExperienceItem } from "@/lib/types";

export default function SkillsContent({
  skills,
  experience,
}: {
  skills: SkillCategory[];
  experience: ExperienceItem[];
}) {
  const { t } = useTranslations();

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 md:pt-16">
        {/* 页头 / header */}
        <div className="max-w-3xl">
          <span className="kicker">{t("skills.kicker")}</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("skills.title")}
          </h1>
          <p className="mt-3 text-lg text-muted">{t("skills.subtitle")}</p>
          <div className="divider-glow mt-4" />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground">{t("skills.skills")}</h2>
          <div className="mt-6">
            <SkillsSection skills={skills} />
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-xl font-bold text-foreground">{t("skills.timeline")}</h2>
          <div className="mt-6 max-w-4xl">
            <Timeline items={experience} />
          </div>
        </div>
      </div>
    </section>
  );
}

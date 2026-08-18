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
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("skills.title")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{t("skills.subtitle")}</p>

      <div className="mt-12">
        <h2 className="text-xl font-semibold">{t("skills.skills")}</h2>
        <div className="mt-6">
          <SkillsSection skills={skills} />
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-xl font-semibold">{t("skills.timeline")}</h2>
        <div className="mt-6">
          <Timeline items={experience} />
        </div>
      </div>
    </section>
  );
}

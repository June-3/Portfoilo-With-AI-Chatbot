"use client";

import { useTranslations } from "@/lib/use-translations";
import ProjectGrid from "./ProjectGrid";
import type { Project } from "@/lib/types";

export default function ProjectsContent({ projects }: { projects: Project[] }) {
  const { t } = useTranslations();

  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:px-6 md:pt-16">
        {/* 页头 / header */}
        <div className="max-w-3xl">
          <span className="kicker">{t("projects.kicker")}</span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("projects.title")}
          </h1>
          <p className="mt-3 text-lg text-muted">{t("projects.subtitle")}</p>
          <div className="divider-glow mt-4" />
        </div>

        <div className="mt-10">
          <ProjectGrid projects={projects} />
        </div>
      </div>
    </section>
  );
}

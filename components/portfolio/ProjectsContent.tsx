"use client";

import { useTranslations } from "@/lib/use-translations";
import ProjectGrid from "./ProjectGrid";
import type { Project } from "@/lib/types";

export default function ProjectsContent({ projects }: { projects: Project[] }) {
  const { t } = useTranslations();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("projects.title")}</h1>
        <p className="mt-4 text-lg text-muted">{t("projects.subtitle")}</p>
      </div>
      <div className="mt-10">
        <ProjectGrid projects={projects} />
      </div>
    </section>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { Project } from "@/lib/types";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const { t, lang } = useTranslations();
  const [active, setActive] = useState("all");

  // 切换语言时重置筛选 / Reset the filter when the language changes.
  useEffect(() => {
    setActive("all");
  }, [lang]);

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(
        new Set(
          projects
            .map((p) => pickLocalized(lang, p.category ?? "", p.category_en))
            .filter(Boolean),
        ),
      ),
    ],
    [projects, lang],
  );

  const filtered =
    active === "all"
      ? projects
      : projects.filter(
          (p) => pickLocalized(lang, p.category ?? "", p.category_en) === active,
        );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActive(category)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active === category
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted hover:bg-accent hover:text-foreground",
            )}
          >
            {category === "all" ? t("projects.all") : category}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">{t("projects.empty")}</p>
      )}
    </div>
  );
}

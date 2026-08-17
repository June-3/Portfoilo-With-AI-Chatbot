"use client";

import { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import { cn } from "@/lib/utils";
import type { Project } from "@/lib/content";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  const categories = useMemo(
    () => [
      "全部",
      ...Array.from(
        new Set(projects.map((p) => p.category).filter((c): c is string => Boolean(c))),
      ),
    ],
    [projects],
  );
  const [active, setActive] = useState("全部");
  const filtered =
    active === "全部" ? projects : projects.filter((p) => p.category === active);

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
            {category}
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-sm text-muted">该分类下暂无项目。</p>
      )}
    </div>
  );
}

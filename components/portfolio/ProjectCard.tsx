"use client";

import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  const { t, lang } = useTranslations();
  const title = pickLocalized(lang, project.title, project.title_en);
  const description = pickLocalized(lang, project.description, project.description_en);
  const category = pickLocalized(lang, project.category ?? "", project.category_en);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-shadow hover:shadow-md">
      {project.image ? (
        <img src={project.image} alt={title} className="h-44 w-full object-cover" />
      ) : (
        <div
          className="flex h-44 w-full items-center justify-center text-4xl font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed)" }}
        >
          {title.charAt(0)}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          {project.featured && (
            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary">
              {t("projects.featured")}
            </span>
          )}
        </div>
        {category && <p className="mt-1 text-xs text-muted">{category}</p>}
        <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span key={tech} className="rounded-md bg-accent px-2 py-0.5 text-xs text-primary">
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex gap-4 pt-5">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("projects.live")}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-muted hover:underline"
            >
              {t("projects.source")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

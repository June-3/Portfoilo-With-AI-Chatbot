"use client";

import { ExternalLink, Github, Star } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { Project } from "@/lib/types";

export default function ProjectCard({ project }: { project: Project }) {
  const { t, lang } = useTranslations();
  const title = pickLocalized(lang, project.title, project.title_en);
  const description = pickLocalized(lang, project.description, project.description_en);
  const category = pickLocalized(lang, project.category ?? "", project.category_en);

  return (
    <article className="panel project-card-dev flex h-full flex-col overflow-hidden">
      {/* 封面 / cover */}
      <div className="relative h-44 shrink-0 overflow-hidden">
        {project.image ? (
          <img src={project.image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: "linear-gradient(135deg, #102c44 0%, #1177bb 60%, #0e639c)" }}
          >
            <span
              aria-hidden
              className="select-none text-7xl font-black text-white/15"
            >
              {title.trim().charAt(0).toUpperCase()}
            </span>
            <span
              aria-hidden
              className="absolute -bottom-8 -right-6 h-28 w-28 rounded-full border border-[#4fc1ff]/25"
            />
            <span
              aria-hidden
              className="absolute -bottom-4 -right-2 h-16 w-16 rounded-full border border-[#4fc1ff]/20"
            />
          </div>
        )}
        {project.featured && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-bold text-[#d9f3ff] backdrop-blur-sm">
            <Star className="h-3 w-3 fill-[#facc15] text-[#facc15]" />
            {t("projects.featured")}
          </span>
        )}
      </div>

      {/* 内容 / body */}
      <div className="flex flex-1 flex-col p-5">
        {category && <p className="text-xs font-semibold uppercase tracking-wider text-[#4fc1ff]">{category}</p>}
        <h3 className="mt-1 text-lg font-bold leading-snug text-foreground">{title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted">{description}</p>

        {project.techStack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span key={tech} className="tech-chip !py-1 text-xs">
                {tech}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-grad rounded-full px-4 py-1.5 text-xs font-bold"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {t("projects.live")}
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-[#4fc1ff] hover:bg-accent hover:text-white"
            >
              <Github className="h-3.5 w-3.5" />
              {t("projects.source")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

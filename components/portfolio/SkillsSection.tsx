"use client";

import {
  Code2,
  Cpu,
  Database,
  Monitor,
  Server,
  Sparkles,
  Terminal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { SkillCategory } from "@/lib/types";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  languages: Code2,
  frontend: Monitor,
  backend: Server,
  database: Database,
  ai: Sparkles,
  industrial: Cpu,
  tools: Wrench,
};

export default function SkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { lang } = useTranslations();

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {skills.map((category) => {
        const Icon = CATEGORY_ICONS[category.category] ?? Terminal;
        return (
          <div key={category.category} className="panel p-5">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                style={{ background: "linear-gradient(135deg, #0e639c, #4fc1ff)" }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="text-base font-bold text-foreground">
                {pickLocalized(lang, category.label, category.label_en)}
              </h3>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {category.items.map((item) => (
                <span key={item} className="tech-chip text-xs sm:text-[0.8rem]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

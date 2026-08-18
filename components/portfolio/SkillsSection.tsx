"use client";

import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { SkillCategory } from "@/lib/types";

export default function SkillsSection({ skills }: { skills: SkillCategory[] }) {
  const { lang } = useTranslations();

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {skills.map((category) => (
        <div key={category.category} className="rounded-xl border border-border p-5">
          <h3 className="text-base font-semibold">
            {pickLocalized(lang, category.label, category.label_en)}
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {category.items.map((item) => (
              <span key={item} className="rounded-md bg-accent px-3 py-1 text-sm text-primary">
                {item}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

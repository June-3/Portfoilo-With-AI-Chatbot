"use client";

import { Briefcase, GraduationCap } from "lucide-react";
import { useTranslations } from "@/lib/use-translations";
import { pickLocalized } from "@/lib/i18n";
import type { ExperienceItem } from "@/lib/types";

export default function Timeline({ items }: { items: ExperienceItem[] }) {
  const { lang } = useTranslations();

  return (
    <ol>
      {items.map((item, index) => {
        const isEducation = item.type === "education";
        const key = item.id ?? `${item.type}-${item.startDate}-${item.role ?? item.school ?? index}`;
        const title = isEducation
          ? pickLocalized(lang, item.school ?? "", item.school_en)
          : pickLocalized(lang, item.role ?? "", item.role_en);
        const subtitle = isEducation
          ? pickLocalized(lang, item.degree ?? "", item.degree_en)
          : pickLocalized(lang, item.company ?? "", item.company_en);
        const description = pickLocalized(lang, item.description ?? "", item.description_en);
        const endDate = lang === "en" && item.endDate === "至今" ? "Present" : item.endDate;

        return (
          <li key={key} className="relative flex gap-x-4 pb-10 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary">
                {isEducation ? (
                  <GraduationCap className="h-4 w-4" />
                ) : (
                  <Briefcase className="h-4 w-4" />
                )}
              </div>
              {index < items.length - 1 && <div className="w-px flex-1 bg-border" />}
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
              <p className="mt-0.5 text-xs text-muted">
                {item.startDate} — {endDate}
              </p>
              {description && (
                <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

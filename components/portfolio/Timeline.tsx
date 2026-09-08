"use client";

import { Briefcase, CalendarRange, GraduationCap } from "lucide-react";
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
        const ongoing = /^(----|至今)$/.test(item.endDate);
        const endDate = ongoing ? (lang === "en" ? "Present" : "至今") : item.endDate;

        return (
          <li key={key} className="relative flex gap-x-5 pb-10 last:pb-0">
            {/* 图标与连线 / bullet rail */}
            <div className="relative flex flex-col items-center">
              <div
                className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-[0_0_18px_rgba(55,148,255,0.55)]"
                style={{ background: "linear-gradient(135deg, #0e639c, #4fc1ff)" }}
              >
                {isEducation ? (
                  <GraduationCap className="h-4 w-4" />
                ) : (
                  <Briefcase className="h-4 w-4" />
                )}
              </div>
              {index < items.length - 1 && (
                <div className="w-[2px] flex-1 bg-gradient-to-b from-[#3794ff]/70 to-[#3794ff]/10" />
              )}
            </div>

            {/* 内容 / content */}
            <div className="min-w-0 pb-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h3 className="text-base font-bold text-foreground sm:text-lg">{title}</h3>
                {subtitle && (
                  <span className="rounded-full border border-[#4fc1ff]/40 bg-accent px-2.5 py-0.5 text-xs font-semibold text-[#d9f3ff]">
                    {subtitle}
                  </span>
                )}
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full px-0 text-xs font-medium text-muted">
                <CalendarRange className="h-3.5 w-3.5 text-[#4fc1ff]" />
                {item.startDate} — {endDate}
              </p>
              {description && (
                <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-muted sm:text-[0.95rem]">
                  {description}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

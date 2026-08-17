import { Briefcase, GraduationCap } from "lucide-react";
import type { ExperienceItem } from "@/lib/content";

export default function Timeline({ items }: { items: ExperienceItem[] }) {
  return (
    <ol>
      {items.map((item, index) => {
        const isEducation = item.type === "education";
        const key = item.id ?? `${item.type}-${item.startDate}-${item.role ?? item.school ?? index}`;
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
              <h3 className="font-semibold">{isEducation ? item.school : item.role}</h3>
              <p className="mt-0.5 text-sm text-muted">{isEducation ? item.degree : item.company}</p>
              <p className="mt-0.5 text-xs text-muted">
                {item.startDate} — {item.endDate}
              </p>
              {item.description && (
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

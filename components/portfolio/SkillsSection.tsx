import type { SkillCategory } from "@/lib/content";

export default function SkillsSection({ skills }: { skills: SkillCategory[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {skills.map((category) => (
        <div key={category.category} className="rounded-xl border border-border p-5">
          <h3 className="text-base font-semibold">{category.label}</h3>
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

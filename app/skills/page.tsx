import type { Metadata } from "next";
import ContentError from "@/components/portfolio/ContentError";
import SkillsSection from "@/components/portfolio/SkillsSection";
import Timeline from "@/components/portfolio/Timeline";
import { getExperience, getSkills } from "@/lib/content";

export const metadata: Metadata = {
  title: "技能 / 经历",
};

export default async function SkillsPage() {
  const [skills, experience] = await Promise.all([getSkills(), getExperience()]);

  if (!skills.ok) return <ContentError fileName={skills.fileName} message={skills.error} />;
  if (!experience.ok) return <ContentError fileName={experience.fileName} message={experience.error} />;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">技能 / 经历</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">我常用的技术栈与工具，以及工作与教育经历。</p>

      <div className="mt-12">
        <h2 className="text-xl font-semibold">技能</h2>
        <div className="mt-6">
          <SkillsSection skills={skills.data} />
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-xl font-semibold">经历时间线</h2>
        <div className="mt-6">
          <Timeline items={experience.data} />
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import ContentError from "@/components/portfolio/ContentError";
import SkillsContent from "@/components/portfolio/SkillsContent";
import { getExperience, getSkills } from "@/lib/content";

export const metadata: Metadata = {
  title: "技能 / 经历",
};

export default async function SkillsPage() {
  const [skills, experience] = await Promise.all([getSkills(), getExperience()]);

  if (!skills.ok) return <ContentError fileName={skills.fileName} message={skills.error} />;
  if (!experience.ok) return <ContentError fileName={experience.fileName} message={experience.error} />;

  return <SkillsContent skills={skills.data} experience={experience.data} />;
}

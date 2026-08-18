import type { Metadata } from "next";
import ContentError from "@/components/portfolio/ContentError";
import AboutContent from "@/components/portfolio/AboutContent";
import { getExperience, getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "关于我",
};

export default async function AboutPage() {
  const [profile, experience] = await Promise.all([getProfile(), getExperience()]);

  if (!profile.ok) return <ContentError fileName={profile.fileName} message={profile.error} />;
  if (!experience.ok) return <ContentError fileName={experience.fileName} message={experience.error} />;

  return <AboutContent profile={profile.data} experience={experience.data} />;
}

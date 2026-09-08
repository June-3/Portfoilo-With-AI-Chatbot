import type { Metadata } from "next";
import ContentError from "@/components/portfolio/ContentError";
import AboutContent from "@/components/portfolio/AboutContent";
import { getExperience, getProfile, getSocial } from "@/lib/content";

export const metadata: Metadata = {
  title: "About me",
};

export default async function AboutPage() {
  const [profile, experience, social] = await Promise.all([
    getProfile(),
    getExperience(),
    getSocial(),
  ]);

  if (!profile.ok) return <ContentError fileName={profile.fileName} message={profile.error} />;
  if (!experience.ok) return <ContentError fileName={experience.fileName} message={experience.error} />;
  if (!social.ok) return <ContentError fileName={social.fileName} message={social.error} />;

  return (
    <AboutContent profile={profile.data} experience={experience.data} social={social.data} />
  );
}

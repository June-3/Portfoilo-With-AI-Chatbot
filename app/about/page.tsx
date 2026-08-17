import type { Metadata } from "next";
import ContentError from "@/components/portfolio/ContentError";
import Timeline from "@/components/portfolio/Timeline";
import { getExperience, getProfile } from "@/lib/content";

export const metadata: Metadata = {
  title: "关于我",
};

export default async function AboutPage() {
  const [profile, experience] = await Promise.all([getProfile(), getExperience()]);

  if (!profile.ok) return <ContentError fileName={profile.fileName} message={profile.error} />;
  if (!experience.ok) return <ContentError fileName={experience.fileName} message={experience.error} />;

  const education = experience.data.filter((item) => item.type === "education");

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">关于我</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">{profile.data.bio}</p>

      {education.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold">教育经历</h2>
          <div className="mt-6">
            <Timeline items={education} />
          </div>
        </div>
      )}
    </section>
  );
}

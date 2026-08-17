import Hero from "@/components/portfolio/Hero";
import ContactSection from "@/components/portfolio/ContactSection";
import ContentError from "@/components/portfolio/ContentError";
import { getProfile, getSocial } from "@/lib/content";

export default async function HomePage() {
  const [profile, social] = await Promise.all([getProfile(), getSocial()]);

  if (!profile.ok) return <ContentError fileName={profile.fileName} message={profile.error} />;
  if (!social.ok) return <ContentError fileName={social.fileName} message={social.error} />;

  return (
    <>
      <Hero profile={profile.data} social={social.data} />
      <ContactSection profile={profile.data} social={social.data} />
    </>
  );
}

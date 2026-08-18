import type { Metadata } from "next";
import ContentError from "@/components/portfolio/ContentError";
import ProjectsContent from "@/components/portfolio/ProjectsContent";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "项目作品",
};

export default async function ProjectsPage() {
  const result = await getProjects();

  if (!result.ok) return <ContentError fileName={result.fileName} message={result.error} />;

  return <ProjectsContent projects={result.data} />;
}

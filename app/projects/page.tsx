import type { Metadata } from "next";
import ContentError from "@/components/portfolio/ContentError";
import ProjectGrid from "@/components/portfolio/ProjectGrid";
import { getProjects } from "@/lib/content";

export const metadata: Metadata = {
  title: "项目作品",
};

export default async function ProjectsPage() {
  const result = await getProjects();

  if (!result.ok) return <ContentError fileName={result.fileName} message={result.error} />;

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">项目作品</h1>
        <p className="mt-4 text-lg text-muted">以下是我参与或主导的部分项目，可按分类筛选。</p>
      </div>
      <div className="mt-10">
        <ProjectGrid projects={result.data} />
      </div>
    </section>
  );
}

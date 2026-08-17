export default function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-lg text-muted">
          {description ?? "该区块将在「模块一」接入 /content 数据。"}
        </p>
        <div className="mt-10 rounded-lg border border-dashed border-border bg-accent/40 px-6 py-12 text-sm text-muted">
          占位内容 · 里程碑 1
        </div>
      </div>
    </section>
  );
}

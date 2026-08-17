export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="rounded-full border border-border bg-accent/60 px-3 py-1 text-xs font-medium text-primary">
        里程碑 1 · 前端框架与主菜单布局
      </span>
      <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        你好，这里是个人作品集首页
      </h1>
      <p className="mt-4 max-w-xl text-lg text-muted">
        Hero 区块（姓名、职位、一句话介绍、头像）将在「模块一」接入，内容来自{" "}
        <code className="rounded bg-accent px-1.5 py-0.5 text-sm text-primary">
          /content/profile.json
        </code>
        。
      </p>
    </section>
  );
}

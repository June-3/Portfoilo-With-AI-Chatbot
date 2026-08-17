export default function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted sm:px-6">
        © {new Date().getFullYear()} 个人作品集 · 由 Next.js 构建
      </div>
    </footer>
  );
}

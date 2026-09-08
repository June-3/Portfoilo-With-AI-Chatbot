export default function ContentError({
  fileName,
  message,
}: {
  fileName: string;
  message: string;
}) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center shadow-[0_0_30px_-12px_rgba(248,113,113,0.4)]">
        <h2 className="text-lg font-semibold text-red-200">
          内容加载失败 / Failed to load content
        </h2>
        <p className="mt-2 text-sm text-red-200/80">
          无法读取{" "}
          <code className="rounded border border-red-400/30 bg-black/30 px-1.5 py-0.5 text-red-200">
            /content/{fileName}
          </code>
          ，请检查文件是否存在、JSON 格式是否正确。
          <br />
          Could not read{" "}
          <code className="rounded border border-red-400/30 bg-black/30 px-1.5 py-0.5 text-red-200">
            /content/{fileName}
          </code>
          . Check whether the file exists and its JSON is valid.
        </p>
        <pre className="mt-4 overflow-auto rounded-lg border border-red-400/20 bg-black/40 p-3 text-left text-xs text-red-200/90">
          {message}
        </pre>
      </div>
    </section>
  );
}

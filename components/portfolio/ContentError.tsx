export default function ContentError({
  fileName,
  message,
}: {
  fileName: string;
  message: string;
}) {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-red-700">内容加载失败</h2>
        <p className="mt-2 text-sm text-red-600">
          无法读取{" "}
          <code className="rounded bg-red-100 px-1.5 py-0.5">/content/{fileName}</code>
          ，请检查文件是否存在、JSON 格式是否正确。
        </p>
        <pre className="mt-4 overflow-auto rounded-lg bg-white p-3 text-left text-xs text-red-500">
          {message}
        </pre>
      </div>
    </section>
  );
}

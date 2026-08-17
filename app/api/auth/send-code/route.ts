import { sendVerificationCode } from "@/lib/verification";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return Response.json(
      { ok: false, message: "请求体不是有效的 JSON。" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email : "";

  // 尽力获取访客 IP（Vercel 等代理下通过请求头），用于频率限制
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined;

  const result = await sendVerificationCode(email, ip);
  return Response.json(result, { status: result.status });
}

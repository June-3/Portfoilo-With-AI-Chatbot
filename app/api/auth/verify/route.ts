import { verifyCode } from "@/lib/verification";

export async function POST(request: Request) {
  let body: { email?: string; code?: string };
  try {
    body = (await request.json()) as { email?: string; code?: string };
  } catch {
    return Response.json(
      { ok: false, message: "请求体不是有效的 JSON。" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return Response.json({ ok: false, message: "邮箱或验证码不能为空。" }, { status: 400 });
  }

  const ok = verifyCode(email, code);
  if (!ok) {
    return Response.json(
      { ok: false, message: "验证码错误或已过期。" },
      { status: 400 },
    );
  }

  return Response.json({ ok: true, email: email.toLowerCase() });
}

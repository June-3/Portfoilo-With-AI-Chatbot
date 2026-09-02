import { verifyCode } from "@/lib/verification";

export async function POST(request: Request) {
  let body: { email?: string; code?: string };
  try {
    body = (await request.json()) as { email?: string; code?: string };
  } catch {
    return Response.json(
      { ok: false, message: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const code = typeof body.code === "string" ? body.code.trim() : "";

  if (!email || !code) {
    return Response.json({ ok: false, message: "Email or verification code cannot be empty." }, { status: 400 });
  }

  const ok = await verifyCode(email, code);
  if (!ok) {
    return Response.json(
      { ok: false, message: "Invalid or expired verification code." },
      { status: 400 },
    );
  }

  return Response.json({ ok: true, email: email.toLowerCase() });
}

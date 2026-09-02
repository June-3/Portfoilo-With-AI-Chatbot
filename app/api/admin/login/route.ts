import { issueAdminToken, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return Response.json({ ok: false, message: "Request body is not valid JSON." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyAdminPassword(password)) {
    return Response.json({ ok: false, message: "Invalid password." }, { status: 401 });
  }

  return Response.json({ ok: true, token: issueAdminToken() });
}

import { getAdminTokenFromRequest, verifyAdminToken } from "@/lib/admin-auth";
import { addToBlacklist, listBlacklist, removeFromBlacklist } from "@/lib/blacklist";

function isAuthorized(request: Request): boolean {
  const token = getAdminTokenFromRequest(request);
  return Boolean(token && verifyAdminToken(token));
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json(await listBlacklist());
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return Response.json({ ok: false, message: "Request body is not valid JSON." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return Response.json({ ok: false, message: "Banned object cannot be empty." }, { status: 400 });
  }

  await addToBlacklist(id);
  return Response.json({ ok: true, blacklist: await listBlacklist() });
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { id?: string };
  try {
    body = (await request.json()) as { id?: string };
  } catch {
    return Response.json({ ok: false, message: "Request body is not valid JSON." }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id.trim() : "";
  if (!id) {
    return Response.json({ ok: false, message: "Unbanned object cannot be empty." }, { status: 400 });
  }

  await removeFromBlacklist(id);
  return Response.json({ ok: true, blacklist: await listBlacklist() });
}

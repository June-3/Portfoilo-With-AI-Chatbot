import { getAdminTokenFromRequest, verifyAdminToken } from "@/lib/admin-auth";
import { listPrivateRequests } from "@/lib/private-requests";

export async function GET(request: Request) {
  const token = getAdminTokenFromRequest(request);
  if (!token || !verifyAdminToken(token)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  return Response.json(await listPrivateRequests());
}

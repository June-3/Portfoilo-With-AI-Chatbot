import { getAdminTokenFromRequest, verifyAdminToken } from "@/lib/admin-auth";
import { getDailyStats } from "@/lib/stats";

export async function GET(request: Request) {
  const token = getAdminTokenFromRequest(request);
  if (!token || !verifyAdminToken(token)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  return Response.json(getDailyStats(14));
}

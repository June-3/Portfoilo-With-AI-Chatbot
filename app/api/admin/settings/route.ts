import { getAdminTokenFromRequest, verifyAdminToken } from "@/lib/admin-auth";
import {
  getPublicSettings,
  hydrateSettings,
  updateSettings,
  type SettingsUpdate,
} from "@/lib/settings";

function isAuthorized(request: Request): boolean {
  const token = getAdminTokenFromRequest(request);
  return Boolean(token && verifyAdminToken(token));
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  await hydrateSettings();
  return Response.json(getPublicSettings());
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: SettingsUpdate;
  try {
    body = (await request.json()) as SettingsUpdate;
  } catch {
    return Response.json({ ok: false, message: "请求体不是有效的 JSON。" }, { status: 400 });
  }

  await hydrateSettings();

  const update: SettingsUpdate = {
    ...body,
    smtpPort: body.smtpPort != null ? Number(body.smtpPort) : undefined,
    anonymousDailyLimit:
      body.anonymousDailyLimit != null ? Number(body.anonymousDailyLimit) : undefined,
    loggedInDailyLimit:
      body.loggedInDailyLimit != null ? Number(body.loggedInDailyLimit) : undefined,
    kbStrongScore: body.kbStrongScore != null ? Number(body.kbStrongScore) : undefined,
    codeScoreThreshold:
      body.codeScoreThreshold != null ? Number(body.codeScoreThreshold) : undefined,
  };

  await updateSettings(update);
  return Response.json({ ok: true, settings: getPublicSettings() });
}

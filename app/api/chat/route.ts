import { answerQuestion, type ChatMessage } from "@/lib/ai";
import { getQuota, hasQuota, recordUsage } from "@/lib/quota";
import { isBlocked } from "@/lib/blacklist";
import { recordRequest } from "@/lib/stats";
import type { Lang } from "@/lib/i18n";

interface ChatRequestBody {
  message?: string;
  anonymousId?: string;
  email?: string;
  lang?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json(
      { error: "invalid_json", message: "Invalid JSON format." },
      { status: 400 },
    );
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const anonymousId =
    typeof body.anonymousId === "string" && body.anonymousId.trim() !== ""
      ? body.anonymousId.trim()
      : "anonymous";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const lang: Lang = body.lang === "zh" ? "zh" : "en";

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    undefined;

  if (!message) {
    return Response.json(
      { error: "empty_message", message: "Message cannot be empty." },
      { status: 400 },
    );
  }

  // 黑名单检查（IP 或匿名 ID）/ Blacklist check (by IP or anonymous ID)
  if ((ip && isBlocked(ip)) || isBlocked(anonymousId)) {
    return Response.json(
      { error: "blocked", message: "You have been blocked from using the AI assistant." },
      { status: 403 },
    );
  }

  // 登录用户使用邮箱作为额度身份，限额更高 / Signed-in users are keyed by email with a higher limit
  const isLoggedIn = email !== "";
  const quotaId = isLoggedIn ? `user:${email}` : `anon:${anonymousId}`;

  if (!hasQuota(quotaId, isLoggedIn)) {
    return Response.json(
      {
        error: "quota_exceeded",
        message: "You have exceeded your daily quota. Please try again tomorrow, or sign in to increase your daily limit.",
        quota: getQuota(quotaId, isLoggedIn),
      },
      { status: 429 },
    );
  }

  const history: ChatMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m) =>
            m &&
            typeof m.content === "string" &&
            (m.role === "user" || m.role === "assistant"),
        )
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  const result = await answerQuestion(message, history, lang);
  const quota = recordUsage(quotaId, result.tokenUsage, isLoggedIn);
  recordRequest(result.tokenUsage);

  return Response.json({ reply: result.reply, quota, tokensUsed: result.tokenUsage });
}

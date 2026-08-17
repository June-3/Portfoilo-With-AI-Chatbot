import { answerQuestion, type ChatMessage } from "@/lib/ai";
import { getQuota, hasQuota, recordUsage } from "@/lib/quota";

interface ChatRequestBody {
  message?: string;
  anonymousId?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export async function POST(request: Request) {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json(
      { error: "invalid_json", message: "请求体不是有效的 JSON。" },
      { status: 400 },
    );
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const anonymousId =
    typeof body.anonymousId === "string" && body.anonymousId.trim() !== ""
      ? body.anonymousId.trim()
      : "anonymous";

  if (!message) {
    return Response.json(
      { error: "empty_message", message: "消息不能为空。" },
      { status: 400 },
    );
  }

  // 每日额度检查
  if (!hasQuota(anonymousId)) {
    return Response.json(
      {
        error: "quota_exceeded",
        message: "今日额度已用完，请明天再来，或登录后提高每日额度。",
        quota: getQuota(anonymousId),
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

  const result = await answerQuestion(message, history);
  const quota = recordUsage(anonymousId, result.tokenUsage);

  return Response.json({ reply: result.reply, quota });
}

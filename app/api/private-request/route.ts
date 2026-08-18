import { sendMail } from "@/lib/mail";
import { detectIntent, type ConversationMessage } from "@/lib/conversation";
import { savePrivateRequest } from "@/lib/private-requests";
import { getSettings, renderTemplate } from "@/lib/settings";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface RequestBody {
  email?: string;
  consent?: boolean;
  conversation?: ConversationMessage[];
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return Response.json(
      { ok: false, message: "请求体不是有效的 JSON。" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const consent = body.consent === true;

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, message: "邮箱格式不正确。" }, { status: 400 });
  }

  if (!consent) {
    return Response.json(
      { ok: false, message: "请先勾选同意隐私政策。" },
      { status: 400 },
    );
  }

  const conversation: ConversationMessage[] = Array.isArray(body.conversation)
    ? body.conversation
        .filter(
          (m) =>
            m &&
            typeof m.content === "string" &&
            (m.role === "user" || m.role === "assistant"),
        )
        .map((m) => ({ role: m.role, content: m.content }))
    : [];

  const intent = detectIntent(conversation);
  const { markdown } = savePrivateRequest({
    email,
    intent,
    conversation,
    consent,
  });

  const s = getSettings();
  const time = new Date().toLocaleString("zh-CN");

  // 1) 给访客发确认邮件（正式、简短）
  await sendMail({
    to: email,
    subject: s.userConfirmationSubject,
    text: renderTemplate(s.userConfirmationTemplate, { email }),
  });

  // 2) 给站长发通知邮件（含对话 Markdown 附件）
  if (s.ownerEmail) {
    await sendMail({
      to: s.ownerEmail,
      subject: s.ownerNotificationSubject,
      text: renderTemplate(s.ownerNotificationTemplate, { email, intent, time }),
      attachments: [
        {
          filename: `request_${Date.now()}.md`,
          content: markdown,
          contentType: "text/markdown",
        },
      ],
    });
  } else {
    console.log("[private-request] 未配置 OWNER_EMAIL，跳过站长通知邮件");
  }

  return Response.json({ ok: true, message: "已发送，请查收邮件。" });
}

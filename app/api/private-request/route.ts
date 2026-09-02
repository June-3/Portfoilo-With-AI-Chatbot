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
      { ok: false, message: "Request body is not valid JSON." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const consent = body.consent === true;

  if (!EMAIL_RE.test(email)) {
    return Response.json({ ok: false, message: "Invalid email format." }, { status: 400 });
  }

  if (!consent) {
    return Response.json(
      { ok: false, message: "Please check the consent checkbox." },
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
  const { markdown } = await savePrivateRequest({
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
    console.log("[private-request] OWNER_EMAIL not configured, skipping owner notification email");
  }

  return Response.json({ ok: true, message: "Sent. Please check your email." });
}

import { sendMail } from "@/lib/mail";
import {
  detectIntent,
  type ConversationMessage,
} from "@/lib/conversation";
import { savePrivateRequest } from "@/lib/private-requests";

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

  // 1) 给访客发确认邮件（正式、简短）
  await sendMail({
    to: email,
    subject: "已收到你的私聊申请",
    text: `你好，\n\n已收到你的私聊申请，我会尽快通过邮箱回复你。\n\n感谢你的关注。`,
  });

  // 2) 给站长发通知邮件（含对话 Markdown 附件）
  const ownerEmail = process.env.OWNER_EMAIL;
  if (ownerEmail) {
    await sendMail({
      to: ownerEmail,
      subject: "【作品集】新的私聊申请",
      text: [
        "收到一条新的私聊申请：",
        "",
        `- 访客邮箱：${email}`,
        `- 意向标签：${intent}`,
        `- 时间：${new Date().toLocaleString("zh-CN")}`,
        "",
        "完整对话见附件。",
      ].join("\n"),
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

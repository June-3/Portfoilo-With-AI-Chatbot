/**
 * 对话相关的纯函数（无 Node 依赖），客户端与服务端均可使用。
 * Pure conversation helpers (no Node deps), safe for both client and server.
 */

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

/** 生成对话摘要：拼接访客消息，截断到一定长度。 / Join visitor messages and truncate. */
export function summarizeConversation(conversation: ConversationMessage[]): string {
  const userMessages = conversation
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);

  if (userMessages.length === 0) return "（无对话内容）";
  const joined = userMessages.join("；");
  return joined.length > 160 ? joined.slice(0, 160) + "…" : joined;
}

/** 简单意向识别（关键词匹配）。 */
export function detectIntent(conversation: ConversationMessage[]): string {
  const text = conversation.map((m) => m.content).join(" ");
  if (/合作|招聘|雇佣|offer|入职|兼职|项目合作/i.test(text)) return "合作意向";
  if (/咨询|请教|问题|问问/i.test(text)) return "咨询";
  return "私聊申请";
}

/** 生成站长通知邮件附带的 Markdown 对话记录。 */
export function buildConversationMarkdown(
  meta: {
    email: string;
    intent: string;
    summary: string;
    createdAt: string;
  },
  conversation: ConversationMessage[],
): string {
  const lines = [
    "# 私聊申请",
    "",
    `- 时间：${meta.createdAt}`,
    `- 邮箱：${meta.email}`,
    `- 意向标签：${meta.intent}`,
    "",
    "## 对话摘要",
    "",
    meta.summary,
    "",
    "## 完整对话",
    "",
  ];

  for (const m of conversation) {
    lines.push(`**${m.role === "user" ? "访客" : "AI 助手"}：** ${m.content}`);
    lines.push("");
  }

  return lines.join("\n");
}

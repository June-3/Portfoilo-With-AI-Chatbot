import nodemailer from "nodemailer";
import { getSettings } from "@/lib/settings";

/**
 * 邮件发送层：使用站长自配的 SMTP（nodemailer）。
 * Email layer: sends via the owner's own SMTP (nodemailer).
 *
 * 配置来自 lib/settings.ts（后台可编辑）。未配置 SMTP 时进入「开发模式」：
 * 邮件只打印到控制台，不真正发送。
 * Config comes from lib/settings.ts (admin-editable). Without SMTP it runs in
 * "dev mode": emails are logged to the console instead of actually being sent.
 */

export interface MailAttachment {
  filename: string;
  content: string;
  contentType?: string;
}

export interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: MailAttachment[];
}

export interface MailResult {
  sent: boolean;
  mocked: boolean;
  messageId?: string;
}

export function isSmtpConfigured(): boolean {
  const s = getSettings();
  return Boolean(s.smtpHost && s.smtpUser && s.smtpPass);
}

export async function sendMail(options: MailOptions): Promise<MailResult> {
  const { to, subject, text, html, attachments } = options;

  if (!isSmtpConfigured()) {
    console.log(`[mail][mock] to=${to} subject="${subject}"`);
    console.log(`[mail][mock] body=${text.slice(0, 300)}`);
    if (attachments?.length) {
      for (const a of attachments) {
        console.log(`[mail][mock] attachment=${a.filename} (${a.content.length} chars)`);
      }
    }
    return { sent: false, mocked: true };
  }

  const s = getSettings();
  const transporter = nodemailer.createTransport({
    host: s.smtpHost,
    port: s.smtpPort,
    secure: s.smtpPort === 465,
    auth: {
      user: s.smtpUser,
      pass: s.smtpPass,
    },
  });

  const info = await transporter.sendMail({
    from: s.smtpFrom || s.smtpUser,
    to,
    subject,
    text,
    html,
    attachments,
  });

  return { sent: true, mocked: false, messageId: info.messageId };
}

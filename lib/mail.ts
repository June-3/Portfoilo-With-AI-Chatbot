import nodemailer from "nodemailer";

/**
 * 邮件发送层：使用站长自配的 SMTP（nodemailer）。
 *
 * 未配置 SMTP 时进入「开发模式」：邮件只打印到控制台，不真正发送，
 * 方便本地联调（调用方可在开发模式下回传验证码等调试信息）。
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
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
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

  const port = Number(process.env.SMTP_PORT ?? 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
    attachments,
  });

  return { sent: true, mocked: false, messageId: info.messageId };
}

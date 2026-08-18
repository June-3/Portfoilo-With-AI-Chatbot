"use client";

import { useTranslations } from "@/lib/use-translations";

export default function PrivacyContent() {
  const { lang } = useTranslations();
  const isEn = lang === "en";

  return (
    <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground">
      {isEn ? (
        <>
          <p>
            We take your privacy seriously. This policy explains how this site collects,
            uses, and protects your personal information. By using this site you agree to
            this policy.
          </p>
          <section>
            <h2 className="text-lg font-semibold">1. Information we collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              <li><span className="font-medium text-foreground">Email address</span> — collected only when you sign in or submit a private-chat request.</li>
              <li><span className="font-medium text-foreground">Conversation content</span> — your chat with the AI assistant, used to generate answers and a request summary.</li>
              <li><span className="font-medium text-foreground">Anonymous identifier</span> — a random ID (stored in your browser) used for daily quota tracking and abuse prevention.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">2. How we use it</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              <li>To answer your questions about the owner;</li>
              <li>To process your private-chat request and send you a confirmation email;</li>
              <li>To prevent spam and abuse (rate limiting, blacklist).</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">3. Storage and security</h2>
            <p className="mt-3 text-muted">
              Email addresses and conversation records are stored encrypted and used only for
              the purposes above. Without your consent we do not use your information for other
              purposes or share it with third parties.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">4. Your rights</h2>
            <p className="mt-3 text-muted">
              You may request to view, correct, or delete the personal information we hold about
              you by contacting the owner via the email in the Contact section of the homepage.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">5. Contact</h2>
            <p className="mt-3 text-muted">
              For questions about this policy, contact us via the email shown in the Contact
              section of the homepage.
            </p>
          </section>
        </>
      ) : (
        <>
          <p>
            我们非常重视你的隐私。本政策说明本站如何收集、使用和保护你的个人信息。使用本站即表示你同意本政策。
          </p>
          <section>
            <h2 className="text-lg font-semibold">一、我们收集的信息</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              <li><span className="font-medium text-foreground">邮箱地址</span>：仅在你主动登录或提交私聊申请时收集。</li>
              <li><span className="font-medium text-foreground">对话内容</span>：你在 AI 助手中的对话，用于生成回答与私聊申请摘要。</li>
              <li><span className="font-medium text-foreground">匿名标识</span>：为未登录访客生成的匿名 ID（保存在浏览器本地），用于每日额度统计与防止滥用。</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">二、我们如何使用这些信息</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-muted">
              <li>回答你关于站长的提问；</li>
              <li>处理你的私聊申请，并向你发送确认邮件、向站长发送通知邮件；</li>
              <li>防止垃圾信息与滥用（限流、黑名单）。</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-semibold">三、数据存储与安全</h2>
            <p className="mt-3 text-muted">
              邮箱与对话记录采用加密方式存储，并仅用于上述用途。未经你的同意，我们不会将你的个人信息用于其他用途，也不会出售或提供给第三方。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">四、你的权利</h2>
            <p className="mt-3 text-muted">
              你可以要求查看、更正或删除我们保存的你的个人信息。如需行使这些权利，请通过首页「联系方式」中的邮箱联系站长。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold">五、联系我们</h2>
            <p className="mt-3 text-muted">
              如对本政策有任何疑问，请通过首页「联系方式」区块提供的邮箱联系我们。
            </p>
          </section>
        </>
      )}
    </div>
  );
}

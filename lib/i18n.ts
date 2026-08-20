/**
 * 国际化（i18n）：翻译字典与语言工具函数 / Internationalization: translation
 * dictionary and language helpers.
 *
 * 纯函数模块，客户端与服务端均可安全导入。/ Pure module, safe to import from
 * both client and server components.
 */

export type Lang = "zh" | "en";

export interface TranslationDict {
  [key: string]: string;
}

const zh: TranslationDict = {
  // 导航 / navigation
  "nav.brand": "个人作品集",
  "nav.home": "首页",
  "nav.about": "关于我",
  "nav.projects": "项目作品",
  "nav.skills": "技能/经历",
  "nav.aiAssistant": "AI 助手",
  "nav.emailLogin": "邮箱登录",
  "nav.loggedIn": "已登录",
  "nav.submitted": "已提交请求",
  "nav.openMenu": "打开菜单",
  "nav.closeMenu": "关闭菜单",

  // 首页 Hero / hero
  "hero.contact": "联系我",
  "hero.viewProjects": "查看项目",

  // 联系方式 / contact
  "contact.title": "联系方式",
  "contact.subtitle": "欢迎通过以下方式联系我，我会尽快回复。",

  // 关于我 / about
  "about.title": "关于我",
  "about.education": "教育经历",

  // 项目 / projects
  "projects.title": "项目作品",
  "projects.subtitle": "以下是我参与或主导的部分项目，可按分类筛选。",
  "projects.all": "全部",
  "projects.featured": "精选",
  "projects.live": "在线演示",
  "projects.source": "源代码",
  "projects.empty": "该分类下暂无项目。",

  // 技能 / skills
  "skills.title": "技能 / 经历",
  "skills.subtitle": "我常用的技术栈与工具，以及工作与教育经历。",
  "skills.skills": "技能",
  "skills.timeline": "经历时间线",

  // 页脚 / footer
  "footer.builtWith": "由 Next.js 构建",
  "footer.privacy": "隐私政策",

  // 聊天 / chat
  "chat.title": "AI 助手",
  "chat.quota": "今日剩余额度：{percent}%",
  "chat.unlimited": "无限额度（站长）",
  "chat.greeting": "你好！我是站长的 AI 助手，可以问我关于他的经历、项目与技能。",
  "chat.quick1": "介绍一下他的项目",
  "chat.quick2": "他擅长什么技术",
  "chat.quick3": "如何联系他",
  "chat.privateRequest": "私聊申请",
  "chat.inputPlaceholder": "输入你的问题…",
  "chat.networkError": "网络错误，请稍后再试。",
  "chat.quotaExceeded": "今日额度已用完，请明天再来，或登录后提高每日额度。",
  "chat.blocked": "你已被限制使用 AI 助手。",
  "chat.close": "关闭聊天",
  "chat.send": "发送",

  // 登录 / login
  "login.title": "邮箱登录",
  "login.email": "邮箱",
  "login.sendCode": "发送验证码",
  "login.code": "验证码",
  "login.verify": "验证并登录",
  "login.back": "上一步",
  "login.enterEmail": "请输入邮箱。",
  "login.enterCode": "请输入验证码。",
  "login.needConsent": "请先勾选同意隐私政策。",
  "login.codeSentTo": "验证码已发送至",
  "login.devCode": "开发模式验证码：{code}",
  "login.sending": "发送中…",
  "login.verifying": "验证中…",
  "login.consent": "我同意提交邮箱即视为同意",
  "login.consentFor": "，用于本次私聊申请。",
  "login.privacy": "隐私政策",
  "login.close": "关闭",

  // 私聊申请 / private request
  "request.title": "私聊申请",
  "request.sendTo": "发送到邮箱",
  "request.notLoggedIn": "（未登录）",
  "request.summaryPreview": "对话摘要预览",
  "request.confirm": "确认发送",
  "request.sending": "发送中…",
  "request.sent": "已发送，请查收邮件",
  "request.sentTo": "已向",
  "request.sentToEnd": "发送确认邮件，我会尽快回复你。",
  "request.consent": "我同意提交邮箱即视为同意",
  "request.consentEnd": "，并将对话摘要发送给站长。",
  "request.close": "关闭",
  "request.needLogin": "请先登录。",
  "request.submitFailed": "提交失败，请稍后再试。",

  // 悬浮按钮 / floating button
  "floating.open": "打开 AI 助手",

  // 后台 / admin
  "admin.title": "后台管理",
  "admin.logout": "退出登录",
  "admin.tab.settings": "设置",
  "admin.tab.requests": "私聊记录",
  "admin.tab.stats": "用量统计",
  "admin.tab.blacklist": "黑名单",
  "admin.login.title": "站长登录",
  "admin.login.subtitle": "输入管理员密码进入后台。",
  "admin.login.password": "管理员密码",
  "admin.login.button": "登录",
  "admin.login.loading": "登录中…",
  "admin.loading": "加载中…",
  "admin.save": "保存设置",
  "admin.saving": "保存中…",
  "admin.saved": "已保存。",
  "admin.smtpSection": "邮件发送（SMTP）",
  "admin.smtpHost": "服务器地址",
  "admin.smtpPort": "端口",
  "admin.smtpUser": "用户名",
  "admin.smtpFrom": "发件人地址",
  "admin.smtpPass": "密码",
  "admin.ownerEmail": "站长接收邮箱",
  "admin.aiSection": "AI 模型（DeepSeek）",
  "admin.apiKey": "API Key",
  "admin.model": "模型",
  "admin.baseUrl": "API 地址",
  "admin.anonLimit": "匿名用户每日限额（token）",
  "admin.loggedInLimit": "登录用户每日限额（token）",
  "admin.templateSection": "邮件模板",
  "admin.templateHint": "可用占位符：验证码邮件 {code}；站长通知 {email} {intent} {time}。",
  "admin.verifSubject": "验证码邮件主题",
  "admin.verifBody": "验证码邮件正文",
  "admin.userSubject": "访客确认邮件主题",
  "admin.userBody": "访客确认邮件正文",
  "admin.ownerSubject": "站长通知邮件主题",
  "admin.ownerBody": "站长通知邮件正文",
  "admin.isSet": "已设置",
  "admin.notSet": "未设置",
  "admin.leaveBlank": "留空则不修改",
  "admin.noRequests": "暂无私聊记录。",
  "admin.viewConversation": "查看对话",
  "admin.collapse": "收起",
  "admin.summary": "摘要",
  "admin.requests14": "近 14 天请求次数",
  "admin.tokens14": "近 14 天总 token",
  "admin.blacklistEmpty": "黑名单为空。",
  "admin.blacklistPlaceholder": "输入 IP 或匿名 ID 封禁",
  "admin.add": "添加",
  "admin.remove": "移除",

  "admin.tab.codekb": "代码知识库",
  "admin.codekb.subtitle": "上传 GitHub 仓库或 zip，将代码分块入库，用于 AI 代码问答。",
  "admin.codekb.notConfigured": "未配置 Jina / Supabase，无法入库。请先在环境变量配置 JINA_API_KEY、SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY。",
  "admin.codekb.githubUrl": "GitHub 仓库地址",
  "admin.codekb.ingest": "入库",
  "admin.codekb.ingesting": "入库中…",
  "admin.codekb.orZip": "或上传 zip（≤3MB）",
  "admin.codekb.upload": "上传入库",
  "admin.codekb.projects": "已索引项目",
  "admin.codekb.chunks": "{count} 个分块",
  "admin.codekb.delete": "删除",
  "admin.codekb.empty": "暂无已索引项目。",
  "admin.codekb.result": "{projectId} 已入库，共 {count} 个分块。",

  "admin.kbStrongScore": "知识库强命中阈值",
  "admin.kbStrongScoreHint": "个人简介知识库命中分数 ≥ 此值才直接回答（数值越大越严格，越小越宽松）",
  "admin.codeScoreThreshold": "代码相似度阈值",
  "admin.codeScoreThresholdHint": "上传代码的向量相似度 ≥ 此值（0–1）才作为回答依据（越低越宽容，可能误答）",
  "admin.maxReplyTokens": "AI 最大回复长度（token）",
  "admin.maxReplyTokensHint": "单次回答最多生成的 token 数。越大越不容易被截断，但可能更耗 token（上限按模型而定）",
  "chat.tokensUsed": "本次消耗 {count} tokens",
};

const en: TranslationDict = {
  "nav.brand": "Portfolio",
  "nav.home": "Home",
  "nav.about": "About",
  "nav.projects": "Projects",
  "nav.skills": "Skills",
  "nav.aiAssistant": "AI Assistant",
  "nav.emailLogin": "Email Login",
  "nav.loggedIn": "Signed in",
  "nav.submitted": "Request submitted",
  "nav.openMenu": "Open menu",
  "nav.closeMenu": "Close menu",

  "hero.contact": "Contact Me",
  "hero.viewProjects": "View Projects",

  "contact.title": "Contact",
  "contact.subtitle": "Feel free to reach out through the channels below — I'll reply as soon as I can.",

  "about.title": "About Me",
  "about.education": "Education",

  "projects.title": "Projects",
  "projects.subtitle": "A selection of projects I've built or contributed to, filterable by category.",
  "projects.all": "All",
  "projects.featured": "Featured",
  "projects.live": "Live Demo",
  "projects.source": "Source",
  "projects.empty": "No projects in this category yet.",

  "skills.title": "Skills / Experience",
  "skills.subtitle": "My tech stack and tools, plus my work and education history.",
  "skills.skills": "Skills",
  "skills.timeline": "Timeline",

  "footer.builtWith": "Built with Next.js",
  "footer.privacy": "Privacy Policy",

  "chat.title": "AI Assistant",
  "chat.quota": "Daily quota left: {percent}%",
  "chat.unlimited": "Unlimited (owner)",
  "chat.greeting": "Hi! I'm the owner's AI assistant. Ask me about his experience, projects, and skills.",
  "chat.quick1": "Tell me about his projects",
  "chat.quick2": "What is he good at?",
  "chat.quick3": "How can I contact him?",
  "chat.privateRequest": "Request a Private Chat",
  "chat.inputPlaceholder": "Type your question…",
  "chat.networkError": "Network error, please try again.",
  "chat.quotaExceeded": "Daily quota used up. Come back tomorrow, or sign in to raise the limit.",
  "chat.blocked": "You have been restricted from using the AI assistant.",
  "chat.close": "Close chat",
  "chat.send": "Send",

  "login.title": "Email Login",
  "login.email": "Email",
  "login.sendCode": "Send Code",
  "login.code": "Verification Code",
  "login.verify": "Verify & Sign In",
  "login.back": "Back",
  "login.enterEmail": "Please enter your email.",
  "login.enterCode": "Please enter the verification code.",
  "login.needConsent": "Please agree to the privacy policy first.",
  "login.codeSentTo": "Code sent to",
  "login.devCode": "Dev-mode code: {code}",
  "login.sending": "Sending…",
  "login.verifying": "Verifying…",
  "login.consent": "I agree that submitting my email means I accept the",
  "login.consentFor": " for this private-chat request.",
  "login.privacy": "Privacy Policy",
  "login.close": "Close",

  "request.title": "Private Chat Request",
  "request.sendTo": "Send to email",
  "request.notLoggedIn": "(not signed in)",
  "request.summaryPreview": "Conversation summary preview",
  "request.confirm": "Confirm & Send",
  "request.sending": "Sending…",
  "request.sent": "Sent — please check your inbox",
  "request.sentTo": "A confirmation email has been sent to",
  "request.sentToEnd": "I'll get back to you as soon as possible.",
  "request.consent": "I agree that submitting my email means I accept the",
  "request.consentEnd": " and that the conversation summary will be sent to the owner.",
  "request.close": "Close",
  "request.needLogin": "Please sign in first.",
  "request.submitFailed": "Submission failed, please try again.",

  "floating.open": "Open AI assistant",

  "admin.title": "Admin",
  "admin.logout": "Log out",
  "admin.tab.settings": "Settings",
  "admin.tab.requests": "Requests",
  "admin.tab.stats": "Usage",
  "admin.tab.blacklist": "Blacklist",
  "admin.login.title": "Owner Sign In",
  "admin.login.subtitle": "Enter the admin password to continue.",
  "admin.login.password": "Admin password",
  "admin.login.button": "Sign In",
  "admin.login.loading": "Signing in…",
  "admin.loading": "Loading…",
  "admin.save": "Save Settings",
  "admin.saving": "Saving…",
  "admin.saved": "Saved.",
  "admin.smtpSection": "Email (SMTP)",
  "admin.smtpHost": "Server host",
  "admin.smtpPort": "Port",
  "admin.smtpUser": "Username",
  "admin.smtpFrom": "From address",
  "admin.smtpPass": "Password",
  "admin.ownerEmail": "Owner recipient email",
  "admin.aiSection": "AI Model (DeepSeek)",
  "admin.apiKey": "API Key",
  "admin.model": "Model",
  "admin.baseUrl": "API Base URL",
  "admin.anonLimit": "Anonymous daily limit (tokens)",
  "admin.loggedInLimit": "Signed-in daily limit (tokens)",
  "admin.templateSection": "Email Templates",
  "admin.templateHint": "Placeholders: verification email {code}; owner notification {email} {intent} {time}.",
  "admin.verifSubject": "Verification email subject",
  "admin.verifBody": "Verification email body",
  "admin.userSubject": "Visitor confirmation subject",
  "admin.userBody": "Visitor confirmation body",
  "admin.ownerSubject": "Owner notification subject",
  "admin.ownerBody": "Owner notification body",
  "admin.isSet": "Set",
  "admin.notSet": "Not set",
  "admin.leaveBlank": "Leave blank to keep unchanged",
  "admin.noRequests": "No private requests yet.",
  "admin.viewConversation": "View conversation",
  "admin.collapse": "Collapse",
  "admin.summary": "Summary",
  "admin.requests14": "Requests (14 days)",
  "admin.tokens14": "Total tokens (14 days)",
  "admin.blacklistEmpty": "Blacklist is empty.",
  "admin.blacklistPlaceholder": "Enter an IP or anonymous ID to block",
  "admin.add": "Add",
  "admin.remove": "Remove",

  "admin.tab.codekb": "Code KB",
  "admin.codekb.subtitle": "Upload a GitHub repo or zip to index its code for AI code Q&A.",
  "admin.codekb.notConfigured": "Jina / Supabase not configured — ingestion is unavailable. Configure JINA_API_KEY, SUPABASE_URL, and SUPABASE_SERVICE_ROLE_KEY first.",
  "admin.codekb.githubUrl": "GitHub repo URL",
  "admin.codekb.ingest": "Ingest",
  "admin.codekb.ingesting": "Ingesting…",
  "admin.codekb.orZip": "or upload a zip (≤3MB)",
  "admin.codekb.upload": "Upload & Ingest",
  "admin.codekb.projects": "Indexed projects",
  "admin.codekb.chunks": "{count} chunks",
  "admin.codekb.delete": "Delete",
  "admin.codekb.empty": "No indexed projects yet.",
  "admin.codekb.result": "{projectId} indexed with {count} chunks.",

  "admin.kbStrongScore": "KB strong-match score",
  "admin.kbStrongScoreHint": "Answer from the profile KB only when its hit score is ≥ this value (higher = stricter, lower = more lenient)",
  "admin.codeScoreThreshold": "Code similarity threshold",
  "admin.codeScoreThresholdHint": "Uploaded-code chunks are used only when vector similarity ≥ this value (0–1; lower = more tolerant, may answer off-topic)",
  "admin.maxReplyTokens": "AI max reply length (tokens)",
  "admin.maxReplyTokensHint": "Max tokens per reply. Higher = less truncation but potentially more tokens consumed (bounded by the model's limit)",
  "chat.tokensUsed": "This turn used {count} tokens",
};

export const translations: Record<Lang, TranslationDict> = { zh, en };

/**
 * 翻译函数 / Translate a key into the given language.
 * 支持 `{var}` 占位符插值 / Supports `{var}` placeholder interpolation.
 */
export function translate(
  lang: Lang,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = translations[lang] ?? translations.zh;
  let value = dict[key] ?? translations.zh[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
}

/**
 * 根据语言选择本地化字段 / Pick a localized field by language.
 * 缺英文时回退到中文 / Falls back to the Chinese field when English is missing.
 */
export function pickLocalized(lang: Lang, zhValue: string, enValue?: string): string {
  return lang === "en" && enValue ? enValue : zhValue;
}

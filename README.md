# 个人作品集 + AI 助手 · Personal Portfolio + AI Assistant

一个个人品牌网站：展示经历、项目与技能，并提供 AI 聊天助手（引导访客了解你、收集邮箱并发起私聊申请）。支持 **中英双语切换**。
A personal-brand website that showcases experience, projects and skills, plus an AI chat assistant (introduces you, collects emails, and handles private-chat requests). Supports **Chinese / English switching**.

---

## 功能特性 · Features

- **作品集展示 · Portfolio**：Hero、关于我、项目作品（分类筛选）、技能、经历时间线、联系方式，内容与代码分离（编辑 `/content` 下的 JSON 即可更新）。
  Hero, About, Projects (filterable), Skills, Experience timeline, Contact — content is decoupled from code (edit the JSON files under `/content`).
- **AI 聊天助手 · AI Assistant**：DeepSeek + 轻量 RAG（个人知识库），设置知识边界，对无关问题返回预设拒绝话术。
  DeepSeek + lightweight RAG over a personal knowledge base, with a knowledge boundary that refuses out-of-scope questions.
- **私聊申请 · Private-chat request**：邮箱验证码登录 → 二级确认（对话摘要 + 隐私勾选）→ 触发两封邮件（访客确认 + 站长通知，含对话 Markdown 附件）。
  Email verification login → confirmation step (summary + consent) → two emails (visitor confirmation + owner notification with a Markdown attachment).
- **站长后台 · Admin panel**（`/admin`）：配置 SMTP / DeepSeek Key / 模型 / 限额 / 邮件模板，查看私聊记录与对话详情、黑名单、每日用量统计。
  Configure SMTP / DeepSeek key / model / limits / email templates; view requests, blacklist, and daily usage stats.
- **双语 · i18n**：导航栏一键切换中英文，界面与内容均双语。
  One-click language switch in the navbar; both the UI and the content are bilingual.

---

## 技术栈 · Tech Stack

| 层 · Layer | 技术 · Technology |
| --- | --- |
| 前端 · Frontend | Next.js (App Router) + Tailwind CSS + Zustand |
| 后端 · Backend | Next.js Route Handlers |
| AI | DeepSeek API + 轻量 RAG · lightweight RAG |
| 邮件 · Email | nodemailer + 站长自配 SMTP · self-hosted SMTP |
| 数据库/Redis（生产）· DB/Redis (production) | Supabase + Upstash Redis |

---

## 本地运行 · Getting Started

```bash
npm install
npm run dev
```

打开 · Open http://localhost:3000。

---

## 修改内容 · Editing Content

内容与代码分离，无需改代码即可更新 · Edit content without touching code. See **[docs/content-guide.md](docs/content-guide.md)**：

- 个人信息 · Profile → `content/profile.json`
- 项目 · Projects → `content/projects.json`
- 技能 · Skills → `content/skills.json`
- 经历 · Experience → `content/experience.json`
- 常见问题（AI 知识库）· FAQ (AI knowledge base) → `content/faq.json`
- 社交链接 · Social links → `content/social.json`
- 图片 · Images → `public/content/images/`

> 内容字段支持双语：中文字段为主，`_en` 后缀为英文翻译（如 `title` / `title_en`）。
> Content fields are bilingual: the Chinese field is primary, and the `_en` suffix holds the English translation (e.g. `title` / `title_en`).

---

## 环境变量 · Environment Variables

复制 `.env.example` 为 `.env.local`（本地）或在 Vercel 配置（线上）· Copy `.env.example` to `.env.local` (local) or configure on Vercel (production).

关键变量 · Key variables（完整清单见 [docs/deployment.md](docs/deployment.md) · full list in the deployment doc）：

- `DEEPSEEK_API_KEY` — AI 回答（不填则降级为知识库回答）· for real AI answers
- `ADMIN_PASSWORD` — 后台密码（开发默认 `admin123`）· admin password
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — 站长自配 SMTP · self-hosted SMTP
- `OWNER_EMAIL` — 站长接收通知的邮箱 · owner notification email
- `ENCRYPTION_KEY` — 敏感信息加密密钥 · encryption key

---

## 部署 · Deployment

详见 · See **[docs/deployment.md](docs/deployment.md)**：环境变量清单、Vercel 部署步骤、SPF/DKIM 配置、Supabase/Upstash 生产接入、上线检查清单。
Environment variable list, Vercel deployment steps, SPF/DKIM setup, Supabase/Upstash production integration, and a pre-launch checklist.

---

## 目录结构 · Project Structure

```
app/                  # 页面路由 · routes (首页/关于/项目/技能/隐私/后台)
components/
  layout/             # 导航栏、页脚 · navbar, footer
  portfolio/          # 作品集展示组件 · portfolio components
  chat/               # AI 聊天 · chat
  auth/               # 邮箱登录、私聊申请 · login & private-request modals
  admin/              # 后台管理 · admin panel
content/              # 展示内容（JSON，可直接编辑）· content (editable JSON)
lib/                  # contentLoader、i18n、AI、邮件等工具 · utilities
store/                # Zustand 全局状态 · global state
public/content/       # 静态资源（图片）· static assets (images)
docs/                 # 维护与部署文档 · docs
```

---

## 里程碑进度 · Milestones

- [x] 里程碑 1 · M1：前端框架与主菜单布局 · Framework & main menu layout
- [x] 里程碑 2 · M2：作品集展示（内容解耦）· Portfolio (decoupled content)
- [x] 里程碑 3 · M3：AI 聊天基础问答 · AI chat basics
- [x] 里程碑 4 · M4：邮箱收集与自动邮件 · Email collection & auto-email
- [x] 里程碑 5 · M5：主菜单状态同步 + 站长后台 · State sync + admin panel
- [x] 里程碑 6 · M6：隐私 + 部署文档 + 构建验证 · Privacy + deploy docs + build
- [x] 里程碑 7 · M7：中英双语界面 · Bilingual (EN/ZH) UI

---

## 已知说明 · Notes

- 设置、私聊记录、用量统计、验证码、限流、黑名单目前为**内存实现**（开发用），生产需替换为 Supabase + Upstash Redis（见部署文档）。
  Settings, requests, stats, verification codes, rate limits, and the blacklist are currently **in-memory** (dev only); replace with Supabase + Upstash Redis for production.
- 后端 API 的少量错误提示仍为中文，界面与内容已全部双语。
  A few backend API error messages remain Chinese; the UI and content are fully bilingual.

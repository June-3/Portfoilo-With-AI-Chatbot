# 个人作品集 + AI 助手 · Personal Portfolio + AI Assistant
[English](README.md) | 中文

一个个人作品集网站：展示经历、项目与技能，并提供 AI 聊天助手（帮助访客了解你，并支持具体项目讲解）。支持 **中英双语切换**。

---

## 功能特性

- **作品集展示**：Hero、关于我、项目作品（分类筛选）、技能、经历时间线、联系方式，内容与代码分离（编辑 `/content` 下的 JSON 即可更新，同时支持/admin后端图形化界面编辑内容）。

- **AI 聊天助手**：DeepSeek + 轻量 RAG（个人知识库）+ （上传代码知识库），设置知识边界，对无关问题返回预设拒绝话术。

- **私聊申请**：邮箱验证码登录 → 二级确认（对话摘要 + 隐私勾选）→ 触发两封邮件（访客确认 + 站长通知，含对话 Markdown 附件）。

- **站长后台**（`/admin`）：配置 SMTP / DeepSeek Key / 模型 / 限额 / 邮件模板，查看私聊记录与对话详情、黑名单、每日用量统计。

- **双语**：导航栏一键切换中英文，界面与内容均双语。

---

## 技术栈

| 层| 技术 |
| --- | --- |
| 前端 | Next.js (App Router) + Tailwind CSS + Zustand |
| 后端 | Next.js Route Handlers |
| AI | DeepSeek API + 轻量 RAG · lightweight RAG |
| 邮件 | nodemailer + 站长自配 SMTP · self-hosted SMTP |
| 数据库/知识库/Redis（生产）| Supabase PostgreSQL + Supabase_pgvector + Upstash Redis |

---

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000。

---

## 可修改内容

内容与代码分离，无需改代码即可更新 **[docs/content-guide.zh.md](docs/content-guide.zh.md)**：

- 个人信息 · Profile → `content/profile.json`
- 项目 · Projects → `content/projects.json`
- 技能 · Skills → `content/skills.json`
- 经历 · Experience → `content/experience.json`
- 常见问题（AI 知识库）→ `content/faq.json`
- 社交链接 · Social links → `content/social.json`
- 图片 · Images → `public/content/images/`

> 内容字段支持双语：中文字段为主，`_en` 后缀为英文翻译（如 `title` / `title_en`）。

---

## 环境变量

复制 `.env.example` 为 `.env.local`（本地）或在 Vercel 配置（线上）

关键变量（完整清单见 [docs/deployment.md](docs/deployment.md)）：

- `DEEPSEEK_API_KEY` — AI 回答（不填则降级为知识库回答
- `ADMIN_PASSWORD` — 后台密码（开发默认 `admin123`）
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — 站长自配 SMTP 
- `OWNER_EMAIL` — 站长接收通知的邮箱
- `ENCRYPTION_KEY` — 敏感信息加密密钥

---

## 部署

详见 **[docs/deployment.zh.md](docs/deployment.zh.md)**：环境变量清单、Vercel 部署步骤、SPF/DKIM 配置、Supabase/Upstash 生产接入、上线检查清单。


---

## 目录结构 · Project Structure

```
app/                  # 页面路由 (首页/关于/项目/技能/隐私/后台)
components/
  layout/             # 导航栏、页脚 
  portfolio/          # 作品集展示组件 
  chat/               # AI 聊天 
  auth/               # 邮箱登录、私聊申请 
  admin/              # 后台管理 
content/              # 展示内容（JSON，可直接编辑）
lib/                  # contentLoader、i18n、AI、邮件等工具
store/                # Zustand 全局状态
public/content/       # 静态资源（图片）
docs/                 # 维护与部署文档
```

---

## 里程碑进度

- [x] 里程碑 1 · M1：前端框架与主菜单布局 
- [x] 里程碑 2 · M2：作品集展示（内容解耦）
- [x] 里程碑 3 · M3：AI 聊天基础问答 
- [x] 里程碑 4 · M4：邮箱收集与自动邮件 
- [x] 里程碑 5 · M5：主菜单状态同步 + 站长后台 
- [x] 里程碑 6 · M6：隐私 + 部署文档 + 构建验证 
- [x] 里程碑 7 · M7：中英双语界面 

---

## 已知说明 · Notes

- **持久化**：验证码 / 每日额度 / 限流 / 黑名单使用 **Upstash Redis**；配置 / 用户 / 私聊记录 / 用量统计使用 **Supabase**。未配置对应密钥时自动回退到内存实现（适合本地演示；多实例不共享、重启即清空）。上线前需在 Supabase 执行 `supabase/schema.sql` 与 `supabase/schema-persistence.sql` 建表。

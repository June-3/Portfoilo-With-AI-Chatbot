# 个人作品集 + AI 助手

一个个人品牌网站：展示经历、项目与技能，并提供 AI 聊天助手（引导访客了解你、收集邮箱并发起私聊申请）。

## 技术栈

- **前端**：Next.js（App Router）+ Tailwind CSS + Zustand
- **后端**：Next.js Route Handlers / Server Actions
- **内容**：`/content` 下的 JSON 文件 + `contentLoader` 统一读取
- **AI**：DeepSeek API + 轻量 RAG（后续里程碑）
- **数据库 / 存储**：Supabase（PostgreSQL + Storage，后续里程碑）
- **Redis**：Upstash（验证码、限流、黑名单，后续里程碑）
- **邮件**：站长自配 SMTP + nodemailer（后续里程碑）
- **部署**：Vercel

## 目录结构

```
app/                  # 页面路由（首页 / 关于我 / 项目作品 / 技能经历）
components/
  layout/             # 导航栏、页脚
  portfolio/          # 作品集展示组件（Hero、项目卡片、技能、时间线等）
  chat/               # AI 聊天（里程碑 2 接入）
  auth/               # 邮箱登录（里程碑 2 接入）
content/              # 展示内容（JSON 文件，可直接编辑）
lib/                  # contentLoader 等工具
store/                # Zustand 全局状态
public/content/       # 静态资源（图片等）
docs/                 # 维护与部署文档
```

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

## 修改内容

网站内容与代码分离，无需改代码即可更新。详见 **[docs/content-guide.md](docs/content-guide.md)**：

- 改个人信息 → `content/profile.json`
- 加项目 → `content/projects.json`
- 改技能 → `content/skills.json`
- 改经历 → `content/experience.json`
- 改社交链接 → `content/social.json`
- 图片 → 放入 `public/content/images/`

## AI 助手

聊天助手以 `/content` 下的内容为个人知识库（轻量检索），并调用 DeepSeek 生成回答。

- 配置 `DEEPSEEK_API_KEY`（复制 `.env.example` 为 `.env.local`）后，助手用真实大模型回答；
- 未配置时，助手自动降级为直接返回知识库中检索到的内容，便于本地演示；
- 匿名访客每日 token 限额默认 2000，可用 `DAILY_TOKEN_LIMIT` 调整；
- 知识库检索不到（置信度低）或与站长无关的问题，返回预设拒绝话术。

## 私聊申请 / 邮箱登录

访客在 AI 聊天窗口点击「私聊申请」后：未登录先走邮箱验证码登录，已登录直接进入二级确认（展示对话摘要 + 隐私政策勾选），确认后后端保存记录并触发两封邮件（访客确认邮件 + 站长通知邮件，含对话 Markdown 附件）。

- 验证码通过站长自配 SMTP 发送，同一邮箱 / IP 每小时最多 3 次；
- 邮箱与对话记录使用 AES-256-GCM 加密存储（`ENCRYPTION_KEY`）；
- 未配置 SMTP 时进入开发模式：验证码直接显示在界面上，邮件只打印到控制台；
- 存储目前为内存实现（开发用），生产替换为 Supabase + Upstash Redis。

## 里程碑进度

- [x] 里程碑 1：前端框架与主菜单布局
- [x] 里程碑 2：传统作品集展示（内容解耦 + contentLoader + 操作文档）
- [x] 里程碑 3：接入 AI 聊天基础问答（DeepSeek + 知识库 + 匿名额度）
- [x] 里程碑 4：邮箱收集与自动邮件（验证码登录 + 私聊申请 + 两封邮件）
- [ ] 里程碑 5：AI 聊天与主菜单、作品集集成
- [ ] 里程碑 6：测试部署、隐私与邮件送达检查

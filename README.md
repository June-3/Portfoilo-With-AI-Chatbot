# Personal Portfolio + AI Assistant
English | [中文](README.zh.md)

A personal-portfolio website that showcases experience, projects and skills, plus an AI chat assistant (introduces you and handles private-chat requests). Supports **Chinese / English switching**.

---

## Features

- **Portfolio**: Hero, About Me, Projects (with category filtering), Skills, Experience Timeline, Contact. Content is decoupled from code (edit JSON files under `/content` to update; also supports a graphical admin interface at `/admin` for content editing).

- **AI Assistant**: DeepSeek + lightweight RAG (personal knowledge base) + (uploaded code knowledge base). Sets knowledge boundaries and returns preset rejection responses for irrelevant questions.

- **Private-chat request**: Email verification code login → second-level confirmation (conversation summary + privacy checkbox) → triggers two emails (visitor confirmation + owner notification, with conversation Markdown attachment).

- **Owner Admin Panel**（`/admin`）:Configure SMTP / DeepSeek Key / model / quotas / email templates; view private chat records and conversation details, blacklist, and daily usage statistics.

- **Bilingual, i18n**：One-click language switch in the navigation bar; both interface and content are bilingual.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js (App Router) + Tailwind CSS + Zustand |
| Backend | Next.js Route Handlers |
| AI | DeepSeek API + lightweight RAG |
| Email | nodemailer + self-hosted SMTP |
| Database/Knowledge Base/Redis (production) | Supabase PostgreSQL + Supabase pgvector + Upstash Redis |

---

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000。

---

## Editable Content

Content is decoupled from code. You can update content without changing code — see **[docs/content-guide.md](docs/content-guide.md)**：

- Profile → `content/profile.json`
- Projects → `content/projects.json`
- Skills → `content/skills.json`
- Experience → `content/experience.json`
- FAQ (AI knowledge base) → `content/faq.json`
- Social links → `content/social.json`
- Images → `public/content/images/`

> Content fields are bilingual: the Chinese field is primary, and the `_en` suffix holds the English translation (e.g. `title` / `title_en`).

---

## Environment Variables
Copy .env.example to .env.local (local development) or configure in Vercel (production).

Key variables (full list in docs/deployment.md):

- `DEEPSEEK_API_KEY` — AI answers (if not set, falls back to knowledge base answers)

- `ADMIN_PASSWORD` — Admin password (default admin123 in development)

- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — Self-hosted SMTP configuration

- `OWNER_EMAIL` — Owner notification email

- `ENCRYPTION_KEY` — Encryption key for sensitive information


---

## Deployment

See **[docs/deployment.md](docs/deployment.md)**: Environment variable list, Vercel deployment steps, SPF/DKIM setup, Supabase/Upstash production integration, and go-live checklist.

---

## 目录结构 · Project Structure

```
app/                  # Page routes (Home/About/Projects/Skills/Privacy/Admin)
components/
  layout/             # Navigation bar, footer
  portfolio/          # Portfolio display components
  chat/               # AI chat
  auth/               # Email login, private chat application
  admin/              # Admin panel
content/              # Display content (JSON, directly editable)
lib/                  # contentLoader, i18n, AI, email utilities
store/                # Zustand global state
public/content/       # Static assets (images)
docs/                 # Maintenance and deployment documentation
```

---

## Milestones

☑ Milestone 1 · M1: Frontend framework and main menu layout
☑ Milestone 2 · M2: Portfolio display (content decoupled)
☑ Milestone 3 · M3: AI chat basic Q&A
☑ Milestone 4 · M4: Email collection and automatic emails
☑ Milestone 5 · M5: Main menu state sync + owner admin panel
☑ Milestone 6 · M6: Privacy + deployment docs + build verification
☑ Milestone 7 · M7: Bilingual Chinese-English interface

---

## Notes

- Settings, private chat records, usage statistics, verification codes, rate limiting, and blacklist are currently implemented in memory (for development). For production, replace with Supabase + Upstash Redis (see deployment docs).

# Deployment & Environment Variables Guide
English | [中文](deployment.zh.md)

This guide explains how to run, build, and deploy this site locally, and what must be configured before going live (especially email deliverability and data persistence).

---

## 1. Environment Variables

Copy `.env.example` at the project root to `.env.local` (local) or configure it in your Vercel project settings (production).
`.env.local` is ignored by `.gitignore` — **never commit it**.

| Variable | Required | Description | Default |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | No* | DeepSeek API key; if unset, the AI assistant falls back to knowledge-base answers | empty |
| `DEEPSEEK_BASE_URL` | No | DeepSeek API base URL | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | No | Model name | `deepseek-v4-flash` |
| `DAILY_TOKEN_LIMIT` | No | Anonymous daily token limit | `10000` |
| `LOGGED_IN_DAILY_LIMIT` | No | Signed-in daily token limit | `50000` |
| `ADMIN_PASSWORD` | **Yes** | `/admin` panel password (dev default `admin123`; change it in production) | `admin123` |
| `SMTP_HOST` | No* | SMTP server host | empty |
| `SMTP_PORT` | No | SMTP port (465 = SSL) | `465` |
| `SMTP_USER` | No* | SMTP username / email address | empty |
| `SMTP_PASS` | No* | SMTP password | empty |
| `SMTP_FROM` | No | From address | same as `SMTP_USER` |
| `OWNER_EMAIL` | No | Owner email that receives private-request notifications | empty |
| `ENCRYPTION_KEY` | **Yes** | Encrypts emails / conversations (32+ char random string) | empty |
| `NEXT_PUBLIC_SITE_URL` | No | Full site URL (for sitemap/robots) | `http://localhost:3000` |
| `SUPABASE_URL` etc. | No* | Database (see section 6) | empty |
| `UPSTASH_REDIS_*` | No* | Redis (see section 6) | empty |
| `JINA_API_KEY` | No* | Jina Embeddings API key (code KB ingest/retrieval) | empty |
| `JINA_EMBED_MODEL` | No | Embedding model | `jina-embeddings-v3` |
| `JINA_EMBED_DIM` | No | Embedding dimension | `1024` |
| `KB_STRONG_SCORE` | No | Profile-KB strong-match score threshold (higher = stricter) | `2` |
| `CODE_SCORE_THRESHOLD` | No | Code vector-similarity threshold (0–1, lower = more tolerant) | `0.25` |

> \* `DEEPSEEK_API_KEY` and the three SMTP variables: when unset the app runs in "dev mode" — the AI returns knowledge-base content, the verification code is shown directly in the UI, and emails are only logged. **They must be configured before going live.**
> \* `JINA_API_KEY` / `SUPABASE_*` / `UPSTASH_REDIS_*`: when unset, the related features automatically fall back to in-memory storage (local demos only). **Configure them before going live.**

---

## 2. Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## 3. Verify a Production Build (required before launch)

```bash
npm run build
npm start   # verify the production build at http://localhost:3000
```

Confirm the build has no errors and that pages, chat, login, and the admin panel work.

---

## 4. Deploy to Vercel

1. Push the project to a GitHub/GitLab repository.
2. In [Vercel](https://vercel.com), choose "Add New → Project" and import the repository (the framework is detected automatically as Next.js).
3. Under **Settings → Environment Variables**, configure all required variables from section 1 (`ADMIN_PASSWORD`, `ENCRYPTION_KEY`, `DEEPSEEK_API_KEY`, SMTP, `OWNER_EMAIL`, `NEXT_PUBLIC_SITE_URL`).
4. Click Deploy; once done, visit the assigned domain.
5. Every `git push` after that triggers an automatic rebuild and deploy.

---

## 5. Email Deliverability (SPF / DKIM) — Self-hosted SMTP

This project uses the "owner's own SMTP", so deliverability depends on whether **SPF** and **DKIM** records are correctly configured for your email domain. Without them, emails will likely land in spam.

Using your domain `example.com` (replace with your real one), add these records in your domain DNS console:

- **SPF (TXT record)**, hostname `@`:
  ```
  v=spf1 include:YOUR_SMTP_PROVIDER_SPF ~all
  ```
  (Use the SPF value your SMTP provider requires — Tencent Enterprise Mail, Alibaba Enterprise Mail, Gmail, etc. each publish official values.)

- **DKIM (TXT record)**: generate the DKIM key in your mail provider's admin, then add the hostname and value it gives you.

- **DMARC (optional but recommended)**, hostname `_dmarc`:
  ```
  v=DMARC1; p=none; rua=mailto:your-email@example.com
  ```

After configuring, verify deliverability with [mail-tester.com](https://www.mail-tester.com) or [mxtoolbox.com](https://mxtoolbox.com).

> If you'd rather not maintain SPF/DKIM yourself, switch to a transactional email service (e.g. Resend / AWS SES) by replacing the sending layer in `lib/mail.ts` with the corresponding SDK — deliverability becomes much easier.

---

## 6. Data Persistence (Supabase + Upstash Redis) — Implemented

The code now uses a "**Redis / Supabase first, in-memory fallback**" approach:

| Module | Implementation |
| --- | --- |
| `lib/verification.ts` verification codes | Upstash Redis `SETEX` (10-min expiry) |
| `lib/quota.ts` daily quotas | Upstash Redis `INCRBY` + daily expiry |
| `lib/rate-limit.ts` rate limiting | Upstash Redis sorted-set sliding window |
| `lib/blacklist.ts` blacklist | Upstash Redis `SET` |
| `lib/settings.ts` settings | Supabase `site_settings` |
| `lib/private-requests.ts` users / private requests | Supabase `users` / `private_requests` |
| `lib/stats.ts` usage stats | Supabase `usage_stats` (`increment_usage` RPC) |

When the corresponding keys are missing, the app falls back to in-memory storage (fine for local demos; not shared across instances and cleared on restart).

**Before going live, you must:**
1. In the Supabase SQL Editor, run `supabase/schema.sql` (code KB) and then `supabase/schema-persistence.sql` (settings / users / private requests / usage tables).
2. Configure `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` (server-only) and `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
3. Recommended: `site_settings` currently stores sensitive fields (SMTP password / API key) as plain JSON; for production, encrypt them with `ENCRYPTION_KEY` before saving (can be enhanced later).

---

## 7. Pre-launch Checklist

- [ ] Configure and verify `ADMIN_PASSWORD` (change the default)
- [ ] Configure `ENCRYPTION_KEY` (32+ char random string)
- [ ] Configure `DEEPSEEK_API_KEY` (real AI answers)
- [ ] Configure SMTP and `OWNER_EMAIL`; walk through "code → login → private request" with a real email
- [ ] Configure SPF / DKIM and verify deliverability with mail-tester
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your production domain
- [ ] Replace the sample data under `/content` with real information
- [ ] Run `supabase/schema.sql` and `supabase/schema-persistence.sql` in Supabase to create the tables (see section 6)
- [ ] Review the `/privacy` policy to make sure it matches actual data handling

# 部署与环境变量说明

本文说明如何本地运行、构建并部署本站，以及上线前需要完成的配置（尤其邮件送达率与数据持久化）。

---

## 一、环境变量清单

复制项目根目录的 `.env.example` 为 `.env.local`（本地）或在 Vercel 项目设置中配置（线上）。
`.env.local` 已被 `.gitignore` 忽略，**切勿提交到仓库**。

| 变量 | 必填 | 说明 | 默认值 |
| --- | --- | --- | --- |
| `DEEPSEEK_API_KEY` | 否* | DeepSeek 平台 API Key；不填则 AI 助手降级为知识库回答 | 空 |
| `DEEPSEEK_BASE_URL` | 否 | DeepSeek API 地址 | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 否 | 模型名称 | `deepseek-v4-flash` |
| `DAILY_TOKEN_LIMIT` | 否 | 匿名访客每日 token 限额 | `10000` |
| `LOGGED_IN_DAILY_LIMIT` | 否 | 登录用户每日 token 限额 | `50000` |
| `ADMIN_PASSWORD` | **是** | 后台 `/admin` 登录密码（开发默认 `admin123`，生产务必修改） | `admin123` |
| `SMTP_HOST` | 否* | SMTP 服务器地址 | 空 |
| `SMTP_PORT` | 否 | SMTP 端口（465 为 SSL） | `465` |
| `SMTP_USER` | 否* | SMTP 登录用户名/具体邮件地址 | 空 |
| `SMTP_PASS` | 否* | SMTP 密码 | 空 |
| `SMTP_FROM` | 否 | 发件人地址 | 同 `SMTP_USER` |
| `OWNER_EMAIL` | 否 | 站长接收私聊通知的邮箱 | 空 |
| `ENCRYPTION_KEY` | **是** | 加密邮箱/对话记录（32+ 位随机字符串） | 空 |
| `NEXT_PUBLIC_SITE_URL` | 否 | 站点完整 URL（用于 sitemap/robots） | `http://localhost:3000` |
| `SUPABASE_URL` 等 | 否* | 数据库（见第六节） | 空 |
| `UPSTASH_REDIS_*` | 否* | Redis（见第六节） | 空 |
| `JINA_API_KEY` | 否* | Jina Embeddings API Key（代码知识库入库/检索） | 空 |
| `JINA_EMBED_MODEL` | 否 | 向量模型 | `jina-embeddings-v3` |
| `JINA_EMBED_DIM` | 否 | 向量维度 | `1024` |
| `KB_STRONG_SCORE` | 否 | 个人知识库强命中分数阈值（越高越严格） | `2` |
| `CODE_SCORE_THRESHOLD` | 否 | 代码向量相似度阈值（0–1，越低越宽容） | `0.25` |

> \* `DEEPSEEK_API_KEY` 与 SMTP 三项：未配置时进入「开发模式」——AI 返回知识库内容、验证码直接显示在界面、邮件只打印日志。**上线前必须配置。**
> \* `JINA_API_KEY` / `SUPABASE_*` / `UPSTASH_REDIS_*`：未配置时相关功能自动回退到内存实现（仅本地演示）。**上线前必须配置。**

---

## 二、本地运行

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:3000。

## 三、本地构建验证（上线前必做）

```bash
npm run build
npm start   # 验证生产构建，访问 http://localhost:3000
```

确认构建无报错、各页面与聊天/登录/后台功能正常。

---

## 四、部署到 Vercel

1. 将项目推送到 GitHub/GitLab 仓库。
2. 在 [Vercel](https://vercel.com) 中「Add New → Project」，导入该仓库（框架会自动识别为 Next.js）。
3. 在 **Settings → Environment Variables** 中按第一节配置所有必填变量（`ADMIN_PASSWORD`、`ENCRYPTION_KEY`、`DEEPSEEK_API_KEY`、SMTP、`OWNER_EMAIL`、`NEXT_PUBLIC_SITE_URL`）。
4. 点击 Deploy，完成后访问分配给你的域名。
5. 之后每次 `git push` 都会自动重新构建发布。

---

## 五、邮件送达率（SPF / DKIM）——自配 SMTP

本项目选择的是「站长自配 SMTP」，因此邮件送达率取决于你邮箱域名是否正确配置了 **SPF** 与 **DKIM** 记录。未配置时邮件很可能进入垃圾箱。

以你的域名 `example.com`（实际请替换）为例，在域名 DNS 控制台添加：

- **SPF（TXT 记录）**，主机名 `@`：
  ```
  v=spf1 include:你的邮件服务商SPF域名 ~all
  ```
  （用哪家 SMTP 就按哪家要求填，例如腾讯企业邮 / 阿里企业邮 / Gmail 等各有官方 SPF 值）

- **DKIM（TXT 记录）**：在邮件服务商后台生成 DKIM 密钥后，按其给的主机名与值添加。

- **DMARC（可选但推荐）**，主机名 `_dmarc`：
  ```
  v=DMARC1; p=none; rua=mailto:你的邮箱
  ```

配置完成后可用 [mail-tester.com](https://www.mail-tester.com) 或 [mxtoolbox.com](https://mxtoolbox.com) 检测邮件是否进入垃圾箱。

> 若不想自己维护 SPF/DKIM，可改为专业事务邮件服务（如 Resend / AWS SES），把 `lib/mail.ts` 的发送层换成对应 SDK，送达率最省心。

---

## 六、数据持久化（Supabase + Upstash Redis）——已实现

代码已完成「**Redis/Supabase 优先 + 内存兜底**」改造：

| 模块 | 实现 |
| --- | --- |
| `lib/verification.ts` 验证码 | Upstash Redis `SETEX`（10 分钟过期）|
| `lib/quota.ts` 每日额度 | Upstash Redis `INCRBY` + 按天过期 |
| `lib/rate-limit.ts` 限流 | Upstash Redis 有序集合滑动窗口 |
| `lib/blacklist.ts` 黑名单 | Upstash Redis `SET` |
| `lib/settings.ts` 配置 | Supabase `site_settings` |
| `lib/private-requests.ts` 用户/私聊记录 | Supabase `users` / `private_requests` |
| `lib/stats.ts` 用量统计 | Supabase `usage_stats`（`increment_usage` RPC）|

未配置对应密钥时自动回退到内存实现（适合本地演示；多实例不共享、重启即清空）。

**上线前必须：**
1. 在 Supabase SQL Editor 依次执行 `supabase/schema.sql`（代码知识库）与 `supabase/schema-persistence.sql`（配置 / 用户 / 私聊 / 用量表）。
2. 配置 `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`（仅服务端）与 `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`。
3. 建议：`site_settings` 目前以 JSON 明文保存敏感字段（SMTP 密码 / API Key），生产环境建议先用 `ENCRYPTION_KEY` 加密后再入库（后续可增强）。

---

## 七、上线前检查清单

- [ ] 配置并验证 `ADMIN_PASSWORD`（已修改默认密码）
- [ ] 配置 `ENCRYPTION_KEY`（32+ 位随机串）
- [ ] 配置 `DEEPSEEK_API_KEY`（AI 真实回答）
- [ ] 配置 SMTP 与 `OWNER_EMAIL`，并用真实邮箱走通「验证码 → 登录 → 私聊申请」流程
- [ ] 配置 SPF / DKIM，用 mail-tester 验证送达率
- [ ] 配置 `NEXT_PUBLIC_SITE_URL` 为正式域名
- [ ] 把 `/content` 下的示例数据替换为真实信息
- [ ] 在 Supabase 执行 `supabase/schema.sql` 与 `supabase/schema-persistence.sql` 建表（见第六节）
- [ ] 复核隐私政策 `/privacy` 内容是否与实际数据处理一致

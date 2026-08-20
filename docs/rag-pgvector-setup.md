# RAG / pgvector 代码知识库 — 接入步骤 · Setup Guide

让 AI 助手能回答「站长 GitHub 项目的代码级问题」。此功能需要 **Jina Embeddings API** + **Supabase(pgvector)**。
Enables the AI assistant to answer code-level questions about the owner's GitHub projects. Requires **Jina Embeddings API** + **Supabase (pgvector)**.

---

## 1. 前置条件 · Prerequisites

- 一个 [Jina](https://jina.ai) 账号的 API Key。
- 一个 [Supabase](https://supabase.com) 项目（免费版即可）。

## 2. 建表 · Create the table

在 Supabase 控制台 → **SQL Editor** 中，粘贴并执行 `supabase/schema.sql` 的完整内容（会创建 `vector` 扩展、`code_chunks` 表、HNSW 索引与 `match_code_chunks` 检索函数）。
In Supabase → **SQL Editor**, run the whole `supabase/schema.sql` (creates the `vector` extension, the `code_chunks` table, an HNSW index, and the `match_code_chunks` search function).

> 注意：向量列维度是 `vector(1024)`，对应 `jina-embeddings-v3`。若换模型需同步改 SQL 与 `JINA_EMBED_DIM`。
> Note: the column is `vector(1024)` for `jina-embeddings-v3`. If you change models, update both the SQL and `JINA_EMBED_DIM`.

## 3. 环境变量 · Environment variables

在 `.env.local`（本地）或 Vercel 环境变量里配置：
Set in `.env.local` (local) or Vercel env vars:

| 变量 · Variable | 说明 · Description |
| --- | --- |
| `JINA_API_KEY` | Jina API Key（必填）· required |
| `JINA_EMBED_MODEL` | 默认 `jina-embeddings-v3` · default |
| `JINA_EMBED_DIM` | 默认 `1024` · default |
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅服务端使用 · server-only（勿暴露到前端 · never expose to the client） |

## 4. 入库 · Ingest

1. 启动应用，访问 `/admin` 登录后台。
2. 打开 **「代码知识库 / Code KB」** 标签页。
3. 两种方式任选其一：
   - 填 **GitHub 仓库地址**（如 `https://github.com/owner/repo`）→ 点「入库」；
   - 或上传 **zip**（≤3MB）。
4. 后端会自动：拉取文件 → 分块 → Jina 向量化 → 写入 Supabase pgvector（同一项目再次入库会**替换**旧数据）。

> 说明：GitHub 拉取走 GitHub API（未鉴权有速率限制，约 60 次/小时）；大仓库建议后续用离线脚本（见下）。

## 5. 测试 · Test

在聊天窗口问代码相关问题，例如：
Ask code questions in the chat, e.g.:

- 「`个人博客系统` 用什么技术栈？」/ "What tech stack does `blog` use?"
- 「登录功能在哪个文件实现的？」/ "Which file implements the login?"
- 「`parseGitHubUrl` 这个函数在哪？」/ "Where is the `parseGitHubUrl` function?"

命中的回答会带文件路径来源。若问题含代码关键词但 pgvector 无命中，会回退到个人简介知识库。
Matched answers include file paths. If a code question has no pgvector hits, it falls back to the profile knowledge base.

## 6. 限制与说明 · Limits & Notes

- **Vercel 函数限制**：入库在单个 API route 内完成，免费版默认 10s 超时（可上调至 60s）。只适合**小仓库**（几十~几百个文件）；大仓库用离线脚本。
- **GitHub 未鉴权速率限制**：约 60 请求/小时，超限会入库失败。
- **安全**：zip 解压有路径穿越/大小/文件数校验；上传代码只解析不执行；`SUPABASE_SERVICE_ROLE_KEY` 仅服务端。
- **许可证**：`jina-embeddings-v3` 商业可用。若自托管 `jina-code-embeddings-1.5b` 需注意其 `cc-by-nc-4.0`（非商业）许可。

## 7. 大仓库离线入库（可选，第二期）· Offline ingest (optional, phase 2)

绕开 Vercel 超时，可在本地脚本中分块 + 向量化后直写 Supabase。当前未实现，可后续补充。
To bypass Vercel timeouts, a local script could chunk + embed then write Supabase directly. Not implemented yet.

# RAG / pgvector 集成方案（交接文档）

> 生成时间：本次会话
> 用途：供 AI 助手项目（Protfoilo-With-AI-Chatbot）的新工作区会话直接读取并按此执行。
> 来源：与 MyAgentic 项目（git_rag_agentic_demo_fork）对比分析后的决策记录。

## 1. 目标

让作品集 AI 助手能够回答访客关于**站长 GitHub 项目的具体问题**（如"这个项目用什么技术栈"、"登录功能怎么实现的"、"某函数在哪"），基于**代码向量检索（RAG）**，部署在 Vercel。

当前助手只能回答 `/content` 里的个人简介/项目/技能/经历/FAQ（关键词检索，`lib/knowledge-base.ts`），**不能回答代码级问题**。本次改造补上"代码知识库"。

## 2. 已定架构决策

| 项 | 决策 | 说明 |
|---|---|---|
| 向量库 | **Supabase pgvector**（托管） | 不用本地 Chroma/SQLite；serverless 文件系统不持久 |
| 向量模型 | **jina-code-embeddings-1.5b** | ⚠️ 需先验证 `api.jina.ai` 是否直接提供该模型（见 §5 待办 1） |
| 问答模型 | DeepSeek（沿用现有 `lib/ai.ts`） | 已有链路，只换检索层 |
| 宿主 | 前端 + 后端全部上 Vercel（Next.js API Routes） | 现有项目即 Next.js，无需引入 Python 服务 |
| 入库方式 | 用户在界面/后端上传 **zip 或 GitHub URL** → 分块 → Jina API 向量化 → 写入 Supabase pgvector | 查询时：embed 查询 → pgvector 检索 → context → DeepSeek |
| 许可证注意 | jina-code-embeddings-1.5b 权重为 **cc-by-nc-4.0（非商业）** | 个人作品集可用；商业化需换模型 |

## 3. 目标项目现状（已核实）

- 技术栈：Next.js 16.3.1、React 19、TypeScript、Tailwind 4、Zustand、ESLint。
- 现有 RAG-lite：`lib/knowledge-base.ts` → `buildKnowledgeBase(lang)` 从 `content/` JSON 生成知识块；`retrieveChunks(query, chunks, topK)` 关键词/标题打分检索，阈值 `SCORE_THRESHOLD = 1`。
- 现有问答链路：`lib/ai.ts` → `answerQuestion(query, history, lang)`：检索 → 无命中返回拒绝话术 → 有 Key 拼 system prompt + context 调 DeepSeek → 无 Key 降级返回原文。
- 聊天路由：`app/api/chat/route.ts`。
- 环境变量已预留：`.env.example` 中 `SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY`（里程碑 4 曾计划使用）、`DEEPSEEK_API_KEY`、`ENCRYPTION_KEY` 等。
- 数据源：`content/` 下 JSON（profile / projects / skills / experience / faq）。

## 4. 参考实现（移植来源：git_rag_agentic_demo_fork）

以下 Python 文件是"代码入库 + 检索"的成熟实现，移植到 TypeScript 时照此结构：

| 参考文件 | 作用 | 移植要点 |
|---|---|---|
| `backend/app/services/parser_service.py` | 扫描仓库文件、区分 code/doc/image、按函数/类切块（代码）、按行数重叠切块（文档） | 核心移植对象；图片/图生文部分可跳过 |
| `backend/app/services/embedding.py` | `embed()`（文档侧）/ `embed_query()`（查询侧）接口 | TS 版实现同样的两个方法；BGE 指令前缀逻辑替换为 **Jina `task` 参数**（文档侧 `retrieval.passage`，查询侧 `retrieval.query`） |
| `backend/app/services/vector_store.py` | `VectorStore` Protocol：`upsert / delete / query / keyword_candidates / count` 5 个方法 | pgvector 版按此接口实现（TS 类），检索逻辑与存储解耦 |
| `backend/app/services/retrieval.py` | 混合检索：向量候选 + 关键词候选融合打分、按 project_id / file_type 过滤、同文件去重 | 第一版可只做纯向量检索 + 元数据过滤，后续再补关键词融合 |
| `backend/app/services/index_service.py` | 入库任务状态机（pending→running→success/failed）、增量更新 | 可简化：上传→分块→入库一步完成，暂不做增量 |

分块记录字段（沿用参考实现的 metadata 设计，写入 pgvector 行）：

```text
id, project_id (owner/repo), path, file_type (code/doc), language,
text (分块内容), symbol (可选：函数/类名), chunk_index, metadata (jsonb)
```

## 5. 执行清单（在 AI 助手项目内按序实施）

### 待办 1：验证 Jina 模型可用性（先做，影响后续所有代码）

- 带 API Key 调 `GET https://api.jina.ai/v1/models` 查模型列表，或直接发 embedding 请求试 `model: "jina-code-embeddings-1.5b"`。
- 若 API 不提供该模型，二选一：
  - a) 用 API 的 `jina-embeddings-v3`（1024 维，代码检索效果也好，零运维）；
  - b) 自托管 GGUF（`jinaai/jina-code-embeddings-1.5b-GGUF`，Ollama/llama.cpp）——与"轻量云"目标冲突，不推荐。
- **确认向量维度**（pgvector 列 `vector(N)` 建表后不可改，先定模型再建表）。

### 待办 2：Supabase 建表 + 启用 pgvector

```sql
create extension if not exists vector;
create table if not exists code_chunks (
  id text primary key,
  project_id text not null,
  path text not null,
  file_type text not null,
  language text,
  text text not null,
  symbol text,
  chunk_index int,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1024)          -- 维度以实际模型为准
);
create index on code_chunks using hnsw (embedding vector_cosine_ops);
create index on code_chunks (project_id);
```

### 待办 3：lib/ 新增模块

- `lib/jina.ts`：`embed(texts)` / `embedQuery(text)`，调 `https://api.jina.ai/v1/embeddings`（OpenAI 兼容），带 `task` 参数、批处理（如 32 条/批）、超时与重试。
- `lib/pgvector.ts`：实现上面 §4 的 5 方法接口（用 `@supabase/supabase-js` 的 service role key 执行 SQL：`select 1 - (embedding <=> $1) as score ...`）。
- `lib/code-chunker.ts`：移植 `parser_service.py` 的分块逻辑（按函数/类切块，回退按行数切块；过滤 `node_modules`/`.git`/`dist`/`build` 等目录）。
- `app/api/ingest/route.ts`：接收 zip 上传（或 GitHub URL）→ 解压到内存/tmp → 校验大小与路径穿越 → 分块 → embed → 写入 pgvector。
  - Vercel 注意：函数时长与体积限制（Hobby 默认 10s、可调 60s；Pro 可调 300s）。小仓库（几十个文件）可运行时入库；大仓库建议离线脚本入库（见待办 6）。

### 待办 4：改造检索层（接现有问答链路）

- `lib/ai.ts` 的 `answerQuestion()` 或 `lib/knowledge-base.ts` 增加一路"代码检索"：命中代码问题时，走 pgvector 检索（embed query → top-k），context 换成代码块（带 `project_id/path` 来源），其余（拒绝话术、DeepSeek 调用、降级）复用现有逻辑。
- 与现有个人简介关键词检索的融合方式：可先做**路由式**（用户问题含项目名/代码关键词 → 代码检索；否则 → 现有 KB），后续再升级为混合。

### 待办 5：环境变量与配置

- `.env.local` 新增：`JINA_API_KEY`、`JINA_EMBED_MODEL`（如 `jina-code-embeddings-1.5b` 或 `jina-embeddings-v3`）、`JINA_EMBED_DIM`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`（已有占位）。
- 同步更新 `.env.example`。

### 待办 6：大仓库离线入库脚本（可选，第二期）

- 写一个 Node/TS 脚本（或保留 Python 参考实现跑批）：本地分块 + embed → 写入 Supabase pgvector，产物即上线可查，绕过 Vercel 函数时长限制。

### 待办 7：测试与部署

- 单元测试：chunker（TS 移植）、jina client（mock）、pgvector 检索（本地或 Supabase）。
- `next build` + ESLint 通过后部署 Vercel，验证：上传小 zip → 提问项目相关问题 → 返回带来源的回答。

## 6. 安全注意

- zip 解压必须防**路径穿越**（`../`、绝对路径），限制解压后总大小与文件数（zip 炸弹）。
- 上传代码只解析不执行。
- `SUPABASE_SERVICE_ROLE_KEY` 只能放服务端（API route），禁止暴露到客户端。

## 7. 参考文档

- 参考实现项目：`D:\Xi\Resume\Portfoliio Page\git_rag_agentic_demo_fork`（README、docs/05-向量数据库设计.md、docs/11-检索能力问题分析.md）。
- 模型：https://huggingface.co/jinaai/jina-code-embeddings-1.5b 、https://huggingface.co/jinaai/jina-code-embeddings-1.5b-GGUF
- Jina Embeddings API 文档（v3 参考）：https://qdrant.tech/documentation/embeddings/jina-embeddings/

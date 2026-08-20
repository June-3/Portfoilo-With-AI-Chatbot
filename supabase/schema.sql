-- ============================================================
-- RAG / pgvector 代码知识库表结构 / Schema for the code knowledge base
-- 在 Supabase SQL Editor 中执行一次 / Run once in the Supabase SQL Editor.
-- ============================================================

create extension if not exists vector;

create table if not exists code_chunks (
  id text primary key,
  project_id text not null,            -- 格式 / format: owner/repo
  path text not null,
  file_type text not null,             -- 'code' | 'doc'
  language text,
  text text not null,
  symbol text,                         -- 可选：函数/类名 / optional: function/class name
  chunk_index int,
  metadata jsonb default '{}'::jsonb,
  embedding vector(1024)               -- jina-embeddings-v3（维度以此模型为准 / dim per the chosen model）
);

create index if not exists code_chunks_embedding_idx
  on code_chunks using hnsw (embedding vector_cosine_ops);

create index if not exists code_chunks_project_idx
  on code_chunks (project_id);

-- 向量检索函数（经 supabase.rpc 调用）/ Vector search function (called via supabase.rpc)
create or replace function match_code_chunks(
  query_embedding vector(1024),
  match_project_id text default null,
  match_limit int default 8
)
returns table (
  id text,
  project_id text,
  path text,
  file_type text,
  language text,
  text text,
  symbol text,
  chunk_index int,
  metadata jsonb,
  score float
)
language plpgsql
as $$
begin
  return query
  select
    c.id,
    c.project_id,
    c.path,
    c.file_type,
    c.language,
    c.text,
    c.symbol,
    c.chunk_index,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as score
  from code_chunks c
  where (match_project_id is null or c.project_id = match_project_id)
  order by c.embedding <=> query_embedding
  limit match_limit;
end;
$$;

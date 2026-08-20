-- ============================================================
-- 持久化表结构（配置 / 用户 / 私聊申请 / 用量统计）
-- Persistence tables: settings / users / private requests / usage stats
-- 在 Supabase SQL Editor 中执行一次（与 schema.sql 互补，可单独执行）
-- Run once in the Supabase SQL Editor (complements schema.sql, safe to run alone).
-- ============================================================

-- 站点配置（单行，id=1）/ site settings (single row, id=1)
create table if not exists site_settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 用户 / users
create table if not exists users (
  id text primary key,
  email text unique not null,
  encrypted_email text,
  created_at timestamptz not null default now()
);

-- 私聊申请 / private-chat requests
create table if not exists private_requests (
  id text primary key,
  user_id text references users(id),
  email text not null,
  intent text,
  summary text,
  encrypted_markdown text,
  created_at timestamptz not null default now()
);
create index if not exists private_requests_user_idx on private_requests (user_id);

-- 每日 AI 用量统计 / daily AI usage stats
create table if not exists usage_stats (
  date text primary key,          -- YYYY-MM-DD
  requests int not null default 0,
  tokens int not null default 0
);

-- 原子累加用量（经 supabase.rpc 调用）/ atomic increment for usage (via supabase.rpc)
create or replace function increment_usage(p_date text, p_tokens int)
returns void
language plpgsql
as $$
begin
  insert into usage_stats (date, requests, tokens)
  values (p_date, 1, greatest(p_tokens, 0))
  on conflict (date) do update
  set requests = usage_stats.requests + 1,
      tokens = usage_stats.tokens + greatest(p_tokens, 0);
end;
$$;

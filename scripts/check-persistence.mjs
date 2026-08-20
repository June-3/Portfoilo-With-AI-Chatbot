// 临时调试：检查 Redis 连通性与 Supabase 持久化表 / Temp debug: check Redis connectivity & Supabase persistence tables.
import { readFileSync } from "node:fs";
import { Redis } from "@upstash/redis";

const env = {};
for (const line of readFileSync(".env", "utf-8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !line.trim().startsWith("#")) {
    let v = m[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[m[1]] = v;
  }
}

// Redis
if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    const r = new Redis({ url: env.UPSTASH_REDIS_REST_URL, token: env.UPSTASH_REDIS_REST_TOKEN });
    await r.set("__ping__", "1", { ex: 60 });
    const v = await r.get("__ping__");
    console.log("Redis: 连接成功 ✓ (set/get ok, value=", v, ")");
    await r.del("__ping__");
  } catch (e) {
    console.log("Redis: 连接失败 ✗", e.message);
  }
} else {
  console.log("Redis: 未配置 / not configured");
}

// Supabase tables
if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
  for (const table of ["site_settings", "users", "private_requests", "usage_stats"]) {
    try {
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?select=id&limit=1`, {
        headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
        signal: AbortSignal.timeout(15000),
      });
      console.log(`Supabase ${table}: ${res.ok ? "存在 ✓" : `缺失 ✗ (${res.status})`}`);
    } catch (e) {
      console.log(`Supabase ${table}: 网络错误 ✗ ${e.message}`);
    }
  }
} else {
  console.log("Supabase: 未配置 / not configured");
}

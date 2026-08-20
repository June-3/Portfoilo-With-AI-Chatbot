/**
 * RAG 环境自检脚本 / RAG env self-check.
 * 读取 .env，验证 Jina Key 与 Supabase code_chunks 表，不打印任何密钥明文。
 * Reads .env and verifies the Jina key and the Supabase code_chunks table;
 * never prints secret values.
 */
import { readFileSync } from "node:fs";

function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(".env", "utf-8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !line.trim().startsWith("#")) {
        let v = m[2].trim();
        if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
        env[m[1]] = v;
      }
    }
  } catch {
    /* ignore */
  }
  return env;
}

const env = loadEnv();

async function checkJina() {
  const key = env.JINA_API_KEY ?? "";
  if (!key) return console.log("JINA_API_KEY: 未设置 / missing");
  try {
    const res = await fetch("https://api.jina.ai/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: env.JINA_EMBED_MODEL ?? "jina-embeddings-v3",
        task: "retrieval.query",
        input: ["test"],
      }),
      signal: AbortSignal.timeout(20000),
    });
    const text = await res.text();
    if (res.ok) {
      const dims = JSON.parse(text).data?.[0]?.embedding?.length;
      console.log(`JINA_API_KEY: 有效 ✓ (embedding dims=${dims})`);
    } else {
      console.log(`JINA_API_KEY: 无效 ✗ status=${res.status} body=${text.slice(0, 200)}`);
    }
  } catch (e) {
    console.log(`JINA_API_KEY: 网络错误 ✗ ${e.message}`);
  }
}

async function checkSupabase() {
  const url = env.SUPABASE_URL ?? "";
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) return console.log("SUPABASE: 未配置 / missing");
  try {
    const res = await fetch(`${url}/rest/v1/code_chunks?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) {
      console.log("SUPABASE code_chunks 表: 存在 ✓");
    } else {
      const text = await res.text();
      console.log(`SUPABASE code_chunks 表: 不可用 ✗ status=${res.status} body=${text.slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`SUPABASE: 网络错误 ✗ ${e.message}`);
  }
}

async function checkRpc() {
  const url = env.SUPABASE_URL ?? "";
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !key) return console.log("RPC: 未配置 / missing");
  try {
    const res = await fetch(`${url}/rest/v1/rpc/match_code_chunks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query_embedding: new Array(1024).fill(0), match_project_id: null, match_limit: 1 }),
      signal: AbortSignal.timeout(20000),
    });
    if (res.ok) {
      console.log("RPC match_code_chunks: 存在 ✓");
    } else {
      const text = await res.text();
      console.log(`RPC match_code_chunks: 不可用 ✗ status=${res.status} body=${text.slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`RPC: 网络错误 ✗ ${e.message}`);
  }
}

async function checkSearch() {
  const url = env.SUPABASE_URL ?? "";
  const key = env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const jina = env.JINA_API_KEY ?? "";
  if (!url || !key || !jina) return console.log("SEARCH: 未配置 / missing");
  try {
    const q = "Tell me about the webpage in this repo";
    const embRes = await fetch("https://api.jina.ai/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jina}` },
      body: JSON.stringify({ model: env.JINA_EMBED_MODEL ?? "jina-embeddings-v3", task: "retrieval.query", input: [q] }),
      signal: AbortSignal.timeout(20000),
    });
    const emb = (await embRes.json()).data?.[0]?.embedding;
    if (!emb) return console.log("SEARCH: embed 失败 / embed failed");
    const rpcRes = await fetch(`${url}/rest/v1/rpc/match_code_chunks`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({ query_embedding: emb, match_project_id: null, match_limit: 8 }),
      signal: AbortSignal.timeout(20000),
    });
    const txt = await rpcRes.text();
    if (rpcRes.ok) {
      const rows = JSON.parse(txt);
      console.log(`SEARCH: 返回 ${rows.length} 行`);
      for (const r of rows.slice(0, 3)) console.log(`  - ${r.path} (score=${r.score?.toFixed(3)})`);
    } else {
      console.log(`SEARCH: RPC 失败 ✗ status=${rpcRes.status} body=${txt.slice(0, 300)}`);
    }
  } catch (e) {
    console.log(`SEARCH: 错误 ✗ ${e.message}`);
  }
}

await checkJina();
await checkSupabase();
await checkRpc();
await checkSearch();

import AdmZip from "adm-zip";
import { getAdminTokenFromRequest, verifyAdminToken } from "@/lib/admin-auth";
import { embed, isJinaConfigured } from "@/lib/jina";
import { getVectorStore, isVectorStoreConfigured } from "@/lib/pgvector";
import {
  chunkFile,
  isBinaryPath,
  isIgnoredPath,
  MAX_FILE_CHARS,
  type CodeChunk,
} from "@/lib/code-chunker";
import { fetchRepoFiles, parseGitHubUrl, type RepoFile } from "@/lib/github";

/**
 * 代码入库接口 / Code ingestion endpoint.
 *
 * POST：上传 zip（multipart）或提交 GitHub URL（JSON）→ 分块 → 向量化 → 写入 pgvector。
 * GET：列出已索引项目。DELETE：删除某个项目。
 * POST: upload a zip (multipart) or GitHub URL (JSON) → chunk → embed → write pgvector.
 * GET: list indexed projects. DELETE: remove a project.
 */

const MAX_ZIP_BYTES = 3 * 1024 * 1024; // 3MB（Vercel 请求体限制 / Vercel body limit）
const MAX_FILES = 300;

function isAuthorized(request: Request): boolean {
  const token = getAdminTokenFromRequest(request);
  return Boolean(token && verifyAdminToken(token));
}

function unauthorized() {
  return Response.json({ error: "unauthorized" }, { status: 401 });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!isJinaConfigured()) {
    return Response.json(
      { ok: false, message: "JINA_API_KEY 未配置 / not configured" },
      { status: 400 },
    );
  }
  if (!isVectorStoreConfigured()) {
    return Response.json(
      { ok: false, message: "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 未配置 / not configured" },
      { status: 400 },
    );
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    let files: RepoFile[] = [];
    let projectId = "";

    if (contentType.includes("multipart/form-data")) {
      // zip 上传 / zip upload
      const form = await request.formData();
      const file = form.get("file");
      projectId = String(form.get("projectId") ?? "").trim();

      if (!(file instanceof File)) {
        return Response.json({ ok: false, message: "未收到 zip 文件 / no zip file" }, { status: 400 });
      }
      if (file.size > MAX_ZIP_BYTES) {
        return Response.json(
          { ok: false, message: "zip 文件过大（限 3MB）/ zip too large (max 3MB)" },
          { status: 400 },
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const zip = new AdmZip(buffer);
      let count = 0;
      for (const entry of zip.getEntries()) {
        if (entry.isDirectory) continue;
        const path = entry.entryName.replace(/\\/g, "/");
        // 防路径穿越 / path-traversal guard
        if (path.startsWith("/") || path.split("/").includes("..")) continue;
        if (isIgnoredPath(path) || isBinaryPath(path)) continue;
        if (count >= MAX_FILES) break;
        const content = entry.getData().toString("utf-8");
        if (content.length > MAX_FILE_CHARS) continue;
        files.push({ path, content });
        count++;
      }
      if (!projectId) projectId = `zip_${Date.now()}`;
    } else {
      // GitHub URL
      const body = (await request.json()) as { url?: string };
      const url = typeof body.url === "string" ? body.url.trim() : "";
      if (!url) {
        return Response.json({ ok: false, message: "缺少 GitHub URL / missing GitHub URL" }, { status: 400 });
      }
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        return Response.json({ ok: false, message: "GitHub URL 格式不正确 / invalid GitHub URL" }, { status: 400 });
      }
      projectId = `${parsed.owner}/${parsed.repo}`;
      files = await fetchRepoFiles(parsed.owner, parsed.repo);
    }

    if (files.length === 0) {
      return Response.json(
        { ok: false, message: "未找到可入库的代码/文档文件 / no code/doc files found" },
        { status: 400 },
      );
    }

    // 分块 / chunk
    const chunks: CodeChunk[] = [];
    for (const f of files) {
      chunks.push(...chunkFile({ projectId, path: f.path, content: f.content }));
    }
    if (chunks.length === 0) {
      return Response.json({ ok: false, message: "分块后无内容 / nothing after chunking" }, { status: 400 });
    }

    // 向量化 / embed
    const embeddings = await embed(chunks.map((c) => c.text));

    // 写库：先删旧再插入（替换该项目）/ replace the project
    const store = getVectorStore();
    await store.deleteByProject(projectId);
    await store.upsert(
      chunks.map((c, i) => ({
        id: `${projectId}:${c.path}:${c.chunkIndex}`,
        project_id: projectId,
        path: c.path,
        file_type: c.fileType,
        language: c.language ?? null,
        text: c.text,
        symbol: c.symbol ?? null,
        chunk_index: c.chunkIndex,
        metadata: {},
        embedding: embeddings[i],
      })),
    );

    return Response.json({ ok: true, projectId, chunks: chunks.length });
  } catch (err) {
    console.error("[ingest] 入库失败 / ingest failed:", err);
    return Response.json(
      { ok: false, message: err instanceof Error ? err.message : "入库失败 / ingest failed" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!isVectorStoreConfigured()) {
    return Response.json({ projects: [], configured: false });
  }
  try {
    const projects = await getVectorStore().listProjects();
    return Response.json({ projects, configured: true });
  } catch (err) {
    return Response.json({
      projects: [],
      configured: true,
      error: err instanceof Error ? err.message : "error",
    });
  }
}

export async function DELETE(request: Request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!isVectorStoreConfigured()) {
    return Response.json({ ok: false, message: "未配置 / not configured" }, { status: 400 });
  }

  let body: { projectId?: string };
  try {
    body = (await request.json()) as { projectId?: string };
  } catch {
    return Response.json({ ok: false, message: "请求体不是有效的 JSON。" }, { status: 400 });
  }

  const projectId = typeof body.projectId === "string" ? body.projectId.trim() : "";
  if (!projectId) {
    return Response.json({ ok: false, message: "缺少 projectId / missing projectId" }, { status: 400 });
  }

  await getVectorStore().deleteByProject(projectId);
  return Response.json({ ok: true });
}

import { isBinaryPath, isIgnoredPath } from "@/lib/code-chunker";

/**
 * 通过 GitHub API 拉取仓库文件（无需 git 二进制，适配 Vercel serverless）。
 * Fetch a repository's files via the GitHub API (no git binary, Vercel-friendly).
 */

export interface RepoFile {
  path: string;
  content: string;
}

const MAX_FILES = 300;
const MAX_FILE_CHARS = 150_000;
const TIMEOUT_MS = 20_000;

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const trimmed = url.trim();
  const m = trimmed.match(/github\.com\/([^/]+)\/([^/#?\s]+)/);
  if (m) return { owner: m[1], repo: m[2].replace(/\.git$/, "") };
  const m2 = trimmed.match(/^([^/\s]+)\/([^/#?\s]+)$/);
  if (m2) return { owner: m2[1], repo: m2[2].replace(/\.git$/, "") };
  return null;
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    headers: { "User-Agent": "portfolio-rag", Accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`GitHub API 错误 ${res.status} / error ${res.status}`);
  }
  return (await res.json()) as Record<string, unknown>;
}

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) return "";
  return await res.text();
}

export async function fetchRepoFiles(owner: string, repo: string): Promise<RepoFile[]> {
  const repoInfo = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`);
  const branch = (repoInfo.default_branch as string) ?? "main";

  const treeInfo = await fetchJson(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
  );
  const tree = (treeInfo.tree ?? []) as { path: string; type: string }[];
  const blobs = tree.filter(
    (t) =>
      t.type === "blob" &&
      !isIgnoredPath(t.path) &&
      !isBinaryPath(t.path),
  );

  const files: RepoFile[] = [];
  for (const blob of blobs.slice(0, MAX_FILES)) {
    const content = await fetchText(
      `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURIComponent(blob.path)}`,
    );
    if (content && content.length <= MAX_FILE_CHARS) {
      files.push({ path: blob.path, content });
    }
  }
  return files;
}

/**
 * 代码/文档分块器 / Code & document chunker.
 *
 * 移植参考实现 parser_service.py 的分块思路（简化版，不使用 tree-sitter）：
 * 代码文件按函数/类定义切块，过大时按行数回退；文档按行数重叠切块；
 * 过滤 node_modules/.git/dist 等目录与二进制文件。
 * A simplified port of the reference parser_service.py (no tree-sitter): code files
 * are split at function/class definitions (falling back to line-based chunks), docs
 * are chunked by lines with overlap; ignored dirs and binary files are skipped.
 */

export interface ChunkInput {
  projectId: string;
  path: string;
  content: string;
}

export interface CodeChunk {
  projectId: string;
  path: string;
  fileType: "code" | "doc";
  language?: string;
  symbol?: string;
  chunkIndex: number;
  text: string;
}

const MAX_CHUNK_CHARS = 6000;
const CODE_CHUNK_LINES = 120;
const DOC_CHUNK_LINES = 60;
const DOC_OVERLAP_LINES = 10;
const MAX_FILE_CHARS = 150_000;

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "out",
  "__pycache__",
  ".venv",
  "venv",
  ".idea",
  ".vscode",
  "coverage",
  "vendor",
  "target",
]);

const BINARY_EXTS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp", ".pdf",
  ".zip", ".gz", ".tar", ".rar", ".7z", ".woff", ".woff2", ".ttf", ".eot",
  ".mp3", ".mp4", ".mov", ".avi", ".exe", ".dll", ".so", ".dylib", ".lock",
  ".map", ".min.js", ".min.css",
]);

const DOC_EXTS = new Set([".md", ".markdown", ".txt", ".rst", ".adoc"]);
const CODE_EXTS = new Set([
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".py", ".java", ".go", ".rs", ".c", ".h", ".cpp", ".hpp", ".cs",
  ".rb", ".php", ".swift", ".kt", ".kts", ".scala", ".sh", ".bash",
  ".css", ".scss", ".less", ".html", ".vue", ".svelte",
  ".sql", ".json", ".yaml", ".yml", ".toml", ".xml", ".graphql",
]);

const SYMBOL_RE =
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\s+([A-Za-z_$][\w$]*)|(?:class|interface|type|enum)\s+([A-Za-z_$][\w$]*)|(?:def|func|fn)\s+([A-Za-z_$][\w$]*))/;

function extOf(path: string): string {
  const base = path.split("/").pop() ?? "";
  const dot = base.lastIndexOf(".");
  return dot >= 0 ? base.slice(dot).toLowerCase() : "";
}

export function isIgnoredPath(path: string): boolean {
  return path.split("/").some((seg) => IGNORED_DIRS.has(seg));
}

export function isBinaryPath(path: string): boolean {
  const ext = extOf(path);
  if (BINARY_EXTS.has(ext)) return true;
  const base = path.split("/").pop() ?? "";
  return BINARY_EXTS.has(base.toLowerCase());
}

export function classifyFile(path: string): "code" | "doc" | "other" {
  const ext = extOf(path);
  if (DOC_EXTS.has(ext)) return "doc";
  if (CODE_EXTS.has(ext)) return "code";
  return "other";
}

const LANG_BY_EXT: Record<string, string> = {
  ".js": "javascript", ".jsx": "javascript", ".mjs": "javascript", ".cjs": "javascript",
  ".ts": "typescript", ".tsx": "typescript",
  ".py": "python", ".java": "java", ".go": "go", ".rs": "rust",
  ".c": "c", ".h": "c", ".cpp": "cpp", ".hpp": "cpp", ".cs": "csharp",
  ".rb": "ruby", ".php": "php", ".swift": "swift", ".kt": "kotlin", ".kts": "kotlin",
  ".scala": "scala", ".sh": "shell", ".bash": "shell",
  ".css": "css", ".scss": "scss", ".less": "less", ".html": "html",
  ".vue": "vue", ".svelte": "svelte",
  ".sql": "sql", ".json": "json", ".yaml": "yaml", ".yml": "yaml",
  ".toml": "toml", ".xml": "xml", ".graphql": "graphql",
};

function languageOf(path: string): string | undefined {
  return LANG_BY_EXT[extOf(path)];
}

function chunkCode(input: ChunkInput, language?: string): CodeChunk[] {
  const lines = input.content.split("\n");
  const segments: { symbol?: string; lines: string[] }[] = [];
  let current: string[] = [];
  let currentSymbol: string | undefined;

  for (const line of lines) {
    const m = line.match(SYMBOL_RE);
    if (m) {
      if (current.length > 0) segments.push({ symbol: currentSymbol, lines: current });
      current = [line];
      currentSymbol = m[1] ?? m[2] ?? m[3];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) segments.push({ symbol: currentSymbol, lines: current });

  const chunks: CodeChunk[] = [];
  let index = 0;
  for (const seg of segments) {
    if (seg.lines.join("\n").length <= MAX_CHUNK_CHARS) {
      chunks.push({
        projectId: input.projectId,
        path: input.path,
        fileType: "code",
        language,
        symbol: seg.symbol,
        chunkIndex: index++,
        text: seg.lines.join("\n"),
      });
    } else {
      for (let i = 0; i < seg.lines.length; i += CODE_CHUNK_LINES) {
        chunks.push({
          projectId: input.projectId,
          path: input.path,
          fileType: "code",
          language,
          symbol: seg.symbol,
          chunkIndex: index++,
          text: seg.lines.slice(i, i + CODE_CHUNK_LINES).join("\n"),
        });
      }
    }
  }
  return chunks;
}

function chunkDoc(input: ChunkInput): CodeChunk[] {
  const lines = input.content.split("\n");
  const step = Math.max(1, DOC_CHUNK_LINES - DOC_OVERLAP_LINES);
  const chunks: CodeChunk[] = [];
  let index = 0;
  for (let i = 0; i < lines.length; i += step) {
    const slice = lines.slice(i, i + DOC_CHUNK_LINES);
    if (slice.length === 0) break;
    chunks.push({
      projectId: input.projectId,
      path: input.path,
      fileType: "doc",
      chunkIndex: index++,
      text: slice.join("\n"),
    });
  }
  return chunks;
}

/** 将一个文件分块；不适合的文件返回空数组。/ Chunk one file; returns [] for non-code/doc. */
export function chunkFile(input: ChunkInput): CodeChunk[] {
  const type = classifyFile(input.path);
  if (type === "other") return [];
  if (isIgnoredPath(input.path) || isBinaryPath(input.path)) return [];
  if (!input.content || input.content.length === 0) return [];
  if (input.content.length > MAX_FILE_CHARS) return [];

  const language = languageOf(input.path);
  return type === "code" ? chunkCode(input, language) : chunkDoc(input);
}

export { MAX_FILE_CHARS };

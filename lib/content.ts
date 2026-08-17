import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * 内容加载层（contentLoader）。
 *
 * 所有展示内容都存放在项目根目录的 /content 目录下（JSON 文件），
 * 页面组件不包含任何具体内容，只负责调用这里的读取函数并渲染。
 *
 * 读取失败时不会抛出异常导致白屏，而是返回一个 `ContentResult`，
 * 由组件据此显示友好错误提示。
 */

// ---- 数据类型定义（与 /content 下的 JSON 结构一一对应） -------------------

export interface Profile {
  name: string;
  title: string;
  headline: string;
  avatar?: string;
  bio: string;
  location?: string;
  email?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  category?: string;
}

export interface SkillCategory {
  category: string;
  label: string;
  items: string[];
}

export interface ExperienceItem {
  id?: string;
  type: "work" | "education";
  role?: string;
  company?: string;
  school?: string;
  degree?: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Social {
  linkedin?: string;
  github?: string;
  twitter?: string;
  email?: string;
}

// ---- 结果类型 -----------------------------------------------------------

export type ContentResult<T> =
  | { ok: true; data: T }
  | { ok: false; fileName: string; error: string };

const contentDir = path.join(process.cwd(), "content");

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJson<T>(fileName: string): Promise<ContentResult<T>> {
  const filePath = path.join(contentDir, fileName);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const data: unknown = JSON.parse(raw);
    return { ok: true, data: data as T };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, fileName, error: message };
  }
}

// ---- 各文件的读取函数 ----------------------------------------------------

export async function getProfile(): Promise<ContentResult<Profile>> {
  const result = await readJson<Profile>("profile.json");
  if (result.ok && !isObject(result.data)) {
    return {
      ok: false,
      fileName: "profile.json",
      error: "profile.json 应该是一个 JSON 对象（而不是数组）。",
    };
  }
  return result;
}

export async function getProjects(): Promise<ContentResult<Project[]>> {
  const result = await readJson<Project[]>("projects.json");
  if (result.ok && !Array.isArray(result.data)) {
    return {
      ok: false,
      fileName: "projects.json",
      error: "projects.json 应该是一个 JSON 数组。",
    };
  }
  return result;
}

export async function getSkills(): Promise<ContentResult<SkillCategory[]>> {
  const result = await readJson<SkillCategory[]>("skills.json");
  if (result.ok && !Array.isArray(result.data)) {
    return {
      ok: false,
      fileName: "skills.json",
      error: "skills.json 应该是一个 JSON 数组。",
    };
  }
  return result;
}

export async function getExperience(): Promise<ContentResult<ExperienceItem[]>> {
  const result = await readJson<ExperienceItem[]>("experience.json");
  if (result.ok && !Array.isArray(result.data)) {
    return {
      ok: false,
      fileName: "experience.json",
      error: "experience.json 应该是一个 JSON 数组。",
    };
  }
  return result;
}

export async function getSocial(): Promise<ContentResult<Social>> {
  const result = await readJson<Social>("social.json");
  if (result.ok && !isObject(result.data)) {
    return {
      ok: false,
      fileName: "social.json",
      error: "social.json 应该是一个 JSON 对象（而不是数组）。",
    };
  }
  return result;
}

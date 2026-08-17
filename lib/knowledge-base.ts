import { promises as fs } from "node:fs";
import path from "node:path";
import {
  getExperience,
  getProfile,
  getProjects,
  getSkills,
  getSocial,
} from "@/lib/content";

/**
 * 个人知识库 + 轻量检索（RAG 的简化版）。
 *
 * 把 /content 下的内容（个人简介、项目、技能、经历、社交、FAQ）整理成
 * 若干个「知识块」，检索时用关键词 / 标题 / 子串匹配打分，返回最相关的几块，
 * 作为给大模型的上下文。
 *
 * 说明：当前为轻量检索（里程碑 3），未使用向量数据库；后续可替换为
 * embedding + 向量检索以提升语义匹配能力。
 */

export interface KnowledgeChunk {
  source: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface FaqEntry {
  question: string;
  answer: string;
}

async function loadFaq(): Promise<FaqEntry[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "content", "faq.json"),
      "utf-8",
    );
    return JSON.parse(raw) as FaqEntry[];
  } catch {
    return [];
  }
}

export async function buildKnowledgeBase(): Promise<KnowledgeChunk[]> {
  const [profile, projects, skills, experience, social, faq] = await Promise.all([
    getProfile(),
    getProjects(),
    getSkills(),
    getExperience(),
    getSocial(),
    loadFaq(),
  ]);

  const chunks: KnowledgeChunk[] = [];

  if (profile.ok) {
    const p = profile.data;
    chunks.push({
      source: "profile",
      title: `${p.name} 的个人简介`,
      content: `${p.name}，${p.title}。${p.headline}。${p.bio}${
        p.location ? ` 所在地：${p.location}。` : ""
      }${p.email ? ` 邮箱：${p.email}。` : ""}`,
      keywords: [
        p.name,
        p.title,
        "简介",
        "背景",
        "职位",
        "是谁",
        "介绍",
        p.location ?? "",
        p.email ?? "",
      ].filter(Boolean),
    });
  }

  if (projects.ok) {
    for (const project of projects.data) {
      chunks.push({
        source: `project:${project.id}`,
        title: project.title,
        content: `项目「${project.title}」（${project.category ?? "未分类"}）：${
          project.description
        } 技术栈：${project.techStack.join("、")}。${
          project.liveUrl ? `在线演示：${project.liveUrl}。` : ""
        }${project.githubUrl ? `源码：${project.githubUrl}。` : ""}`,
        keywords: [project.title, project.category ?? "", ...project.techStack].filter(
          Boolean,
        ),
      });
    }
  }

  if (skills.ok) {
    for (const category of skills.data) {
      chunks.push({
        source: `skill:${category.category}`,
        title: `技能：${category.label}`,
        content: `${category.label}：${category.items.join("、")}。`,
        keywords: [category.label, ...category.items].filter(Boolean),
      });
    }
  }

  if (experience.ok) {
    for (const item of experience.data) {
      const id = item.id ?? `${item.type}-${item.startDate}`;
      if (item.type === "work") {
        chunks.push({
          source: `experience:${id}`,
          title: `${item.role}（${item.company}）`,
          content: `工作经历：${item.role} @ ${item.company}，${item.startDate} 至 ${
            item.endDate
          }。${item.description ?? ""}`,
          keywords: [item.role ?? "", item.company ?? "", "经历", "工作"].filter(Boolean),
        });
      } else {
        chunks.push({
          source: `experience:${id}`,
          title: `${item.school}（${item.degree}）`,
          content: `教育经历：${item.school}，${item.degree}，${item.startDate} 至 ${
            item.endDate
          }。${item.description ?? ""}`,
          keywords: [item.school ?? "", item.degree ?? "", "教育", "学历", "大学"].filter(
            Boolean,
          ),
        });
      }
    }
  }

  if (social.ok) {
    const s = social.data;
    const links = [
      s.github ? `GitHub：${s.github}` : "",
      s.linkedin ? `LinkedIn：${s.linkedin}` : "",
      s.email ? `邮箱：${s.email}` : "",
    ].filter(Boolean);
    if (links.length > 0) {
      chunks.push({
        source: "social",
        title: "联系方式",
        content: `联系方式：${links.join("；")}。`,
        keywords: [
          "联系",
          "联系方式",
          "邮箱",
          "github",
          "linkedin",
          "怎么联系",
          "如何联系",
          s.github ?? "",
          s.linkedin ?? "",
          s.email ?? "",
        ].filter(Boolean),
      });
    }
  }

  for (const entry of faq) {
    chunks.push({
      source: `faq:${entry.question}`,
      title: entry.question,
      content: entry.answer,
      keywords: [
        entry.question,
        ...entry.question.split(/[，。？、！\s]+/).filter(Boolean),
      ],
    });
  }

  return chunks;
}

export interface RetrievedChunk {
  chunk: KnowledgeChunk;
  score: number;
}

/** 检索置信度阈值：分数低于此值时视为「知识库无相关内容」。 */
const SCORE_THRESHOLD = 1;

export function retrieveChunks(
  query: string,
  chunks: KnowledgeChunk[],
  topK = 4,
): RetrievedChunk[] {
  const q = query.toLowerCase();
  const scored: RetrievedChunk[] = [];

  for (const chunk of chunks) {
    let score = 0;
    const title = chunk.title.toLowerCase();

    // 标题完全/子串匹配，权重最高
    if (q.length >= 2 && (q.includes(title) || title.includes(q))) {
      score += 4;
    }

    for (const kw of chunk.keywords) {
      const k = kw.toLowerCase();
      if (!k) continue;
      // 关键词出现在问题中
      if (k.length >= 2 && q.includes(k)) score += 2;
      // 问题中的词出现在关键词中（关键词较长时）
      else if (k.length >= 4 && q.length >= 2 && k.includes(q)) score += 1;
    }

    if (score >= SCORE_THRESHOLD) scored.push({ chunk, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

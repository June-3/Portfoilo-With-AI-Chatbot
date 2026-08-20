import { promises as fs } from "node:fs";
import path from "node:path";
import {
  getExperience,
  getProfile,
  getProjects,
  getSkills,
  getSocial,
} from "@/lib/content";
import { pickLocalized, type Lang } from "@/lib/i18n";

/**
 * 个人知识库 + 轻量检索（RAG 的简化版）/ Personal knowledge base + lightweight
 * retrieval (a simplified RAG).
 *
 * 把 /content 下的内容整理成若干「知识块」，检索时用关键词 / 标题 / 子串匹配
 * 打分，返回最相关的几块作为给大模型的上下文。支持中英双语：按语言生成知识块，
 * 关键词同时收录中英两种，便于双语问题都能命中。
 *
 * It turns /content into "chunks", scores them by keyword/title/substring match,
 * and returns the top matches as context for the model. It is bilingual: chunks
 * are built for the given language, while keywords cover both languages.
 */

export interface KnowledgeChunk {
  source: string;
  title: string;
  content: string;
  keywords: string[];
}

export interface FaqEntry {
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
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

export async function buildKnowledgeBase(lang: Lang): Promise<KnowledgeChunk[]> {
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
    const name = pickLocalized(lang, p.name, p.name_en);
    const title = pickLocalized(lang, p.title, p.title_en);
    const headline = pickLocalized(lang, p.headline, p.headline_en);
    const bio = pickLocalized(lang, p.bio, p.bio_en);
    const location = pickLocalized(lang, p.location ?? "", p.location_en);
    chunks.push({
      source: "profile",
      title: lang === "en" ? `${name}'s Profile` : `${name} 的个人简介`,
      content: lang === "en"
        ? `${name}, ${title}. ${headline}. ${bio}${location ? ` Location: ${location}.` : ""}${p.email ? ` Email: ${p.email}.` : ""}`
        : `${name}，${title}。${headline}。${bio}${location ? ` 所在地：${location}。` : ""}${p.email ? ` 邮箱：${p.email}。` : ""}`,
      keywords: [
        p.name,
        p.name_en ?? "",
        p.title,
        p.title_en ?? "",
        "简介",
        "背景",
        "职位",
        "是谁",
        "介绍",
        "profile",
        "background",
        "who",
        "about",
        location,
        p.email ?? "",
      ].filter(Boolean),
    });
  }

  if (projects.ok) {
    for (const project of projects.data) {
      const title = pickLocalized(lang, project.title, project.title_en);
      const desc = pickLocalized(lang, project.description, project.description_en);
      const category = pickLocalized(lang, project.category ?? "", project.category_en);
      chunks.push({
        source: `project:${project.id}`,
        title,
        content: lang === "en"
          ? `Project "${title}" (${category || "Uncategorized"}): ${desc} Tech stack: ${project.techStack.join(", ")}.${project.liveUrl ? ` Live demo: ${project.liveUrl}.` : ""}${project.githubUrl ? ` Source: ${project.githubUrl}.` : ""}`
          : `项目「${title}」（${category || "未分类"}）：${desc} 技术栈：${project.techStack.join("、")}。${project.liveUrl ? `在线演示：${project.liveUrl}。` : ""}${project.githubUrl ? `源码：${project.githubUrl}。` : ""}`,
        keywords: [
          project.title,
          project.title_en ?? "",
          project.category ?? "",
          project.category_en ?? "",
          ...project.techStack,
        ].filter(Boolean),
      });
    }
  }

  if (skills.ok) {
    for (const category of skills.data) {
      const label = pickLocalized(lang, category.label, category.label_en);
      chunks.push({
        source: `skill:${category.category}`,
        title: lang === "en" ? `Skills: ${label}` : `技能：${label}`,
        content: lang === "en"
          ? `${label}: ${category.items.join(", ")}.`
          : `${label}：${category.items.join("、")}。`,
        keywords: [category.label, category.label_en ?? "", ...category.items].filter(
          Boolean,
        ),
      });
    }
  }

  if (experience.ok) {
    for (const item of experience.data) {
      const id = item.id ?? `${item.type}-${item.startDate}`;
      if (item.type === "work") {
        const role = pickLocalized(lang, item.role ?? "", item.role_en);
        const company = pickLocalized(lang, item.company ?? "", item.company_en);
        const desc = pickLocalized(lang, item.description ?? "", item.description_en);
        chunks.push({
          source: `experience:${id}`,
          title: `${role} (${company})`,
          content: lang === "en"
            ? `Work: ${role} @ ${company}, ${item.startDate} to ${item.endDate}. ${desc}`
            : `工作经历：${role} @ ${company}，${item.startDate} 至 ${item.endDate}。${desc}`,
          keywords: [
            item.role ?? "",
            item.role_en ?? "",
            item.company ?? "",
            item.company_en ?? "",
            "经历",
            "工作",
            "experience",
            "work",
          ].filter(Boolean),
        });
      } else {
        const school = pickLocalized(lang, item.school ?? "", item.school_en);
        const degree = pickLocalized(lang, item.degree ?? "", item.degree_en);
        const desc = pickLocalized(lang, item.description ?? "", item.description_en);
        chunks.push({
          source: `experience:${id}`,
          title: `${school} (${degree})`,
          content: lang === "en"
            ? `Education: ${school}, ${degree}, ${item.startDate} to ${item.endDate}. ${desc}`
            : `教育经历：${school}，${degree}，${item.startDate} 至 ${item.endDate}。${desc}`,
          keywords: [
            item.school ?? "",
            item.school_en ?? "",
            item.degree ?? "",
            item.degree_en ?? "",
            "教育",
            "学历",
            "大学",
            "education",
            "university",
          ].filter(Boolean),
        });
      }
    }
  }

  if (social.ok) {
    const s = social.data;
    const links = [
      s.github ? `GitHub: ${s.github}` : "",
      s.linkedin ? `LinkedIn: ${s.linkedin}` : "",
      s.email ? (lang === "en" ? `Email: ${s.email}` : `邮箱：${s.email}`) : "",
    ].filter(Boolean);
    if (links.length > 0) {
      chunks.push({
        source: "social",
        title: lang === "en" ? "Contact" : "联系方式",
        content: lang === "en"
          ? `Contact: ${links.join("; ")}.`
          : `联系方式：${links.join("；")}。`,
        keywords: [
          "联系",
          "联系方式",
          "邮箱",
          "github",
          "linkedin",
          "怎么联系",
          "如何联系",
          "contact",
          "email",
          "reach",
          s.github ?? "",
          s.linkedin ?? "",
          s.email ?? "",
        ].filter(Boolean),
      });
    }
  }

  for (const entry of faq) {
    const question = pickLocalized(lang, entry.question, entry.question_en);
    const answer = pickLocalized(lang, entry.answer, entry.answer_en);
    chunks.push({
      source: `faq:${entry.question}`,
      title: question,
      content: answer,
      keywords: [
        entry.question,
        entry.question_en ?? "",
        ...entry.question.split(/[，。？、！\s]+/).filter(Boolean),
        ...(entry.question_en ?? "").split(/[,.?!\s]+/).filter(Boolean),
      ].filter(Boolean),
    });
  }

  return chunks;
}

export interface RetrievedChunk {
  chunk: KnowledgeChunk;
  score: number;
}

/** 检索置信度阈值：分数低于此值视为「知识库无相关内容」。/ Below this score, the query is treated as out-of-scope. */
const SCORE_THRESHOLD = 1;

/** 英文停用词：避免「about/Tell/he」等常见词造成误命中。/ English stop words: avoid false hits from common words. */
const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "have", "has", "had", "what", "which", "how", "where",
  "when", "who", "why", "of", "to", "in", "on", "at", "for", "with", "by",
  "from", "as", "than", "then", "this", "that", "these", "those", "it", "its",
  "he", "she", "him", "his", "her", "their", "your", "my", "me", "you", "we",
  "they", "and", "or", "but", "not", "no", "yes", "about", "tell", "please",
  "can", "could", "would", "will", "there", "here", "if", "so", "etc",
  "good", "any", "all", "some", "very", "just", "really", "thing", "things",
]);

/** 是否纯 ASCII（英文关键词按整词匹配，中文按子串匹配）。/ ASCII-only keywords match as whole words. */
function isAscii(s: string): boolean {
  return /^[\x00-\x7F]*$/.test(s);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

    // 标题完全/子串匹配，权重最高 / Exact or substring title match carries the most weight.
    if (q.length >= 2 && (q.includes(title) || title.includes(q))) {
      score += 4;
    }

    for (const kw of chunk.keywords) {
      const k = kw.toLowerCase();
      // 跳过停用词，避免常见词误命中 / Skip stop words to avoid false positives.
      if (!k || k.length < 2 || STOP_WORDS.has(k)) continue;

      if (isAscii(k)) {
        // 英文按整词匹配，避免 "he" 命中 "weather" 里的 "he" / Whole-word match for English.
        const re = new RegExp(`\\b${escapeRegExp(k)}\\b`);
        if (re.test(q)) score += 2;
      } else {
        if (q.includes(k)) score += 2;
        else if (k.length >= 4 && q.length >= 2 && k.includes(q)) score += 1;
      }
    }

    if (score >= SCORE_THRESHOLD) scored.push({ chunk, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

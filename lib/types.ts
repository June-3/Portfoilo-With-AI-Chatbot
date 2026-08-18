/**
 * 内容数据类型定义 / Content data types.
 *
 * 所有展示内容都带有双语字段：中文为主字段，`_en` 为英文翻译。
 * All display content carries bilingual fields: the Chinese field is primary,
 * and the `_en` suffix holds the English translation.
 */

export interface Profile {
  name: string;
  name_en?: string;
  title: string;
  title_en?: string;
  headline: string;
  headline_en?: string;
  avatar?: string;
  bio: string;
  bio_en?: string;
  location?: string;
  location_en?: string;
  email?: string;
}

export interface Project {
  id: string;
  title: string;
  title_en?: string;
  description: string;
  description_en?: string;
  techStack: string[];
  image?: string;
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  category?: string;
  category_en?: string;
}

export interface SkillCategory {
  category: string;
  label: string;
  label_en?: string;
  items: string[];
}

export interface ExperienceItem {
  id?: string;
  type: "work" | "education";
  role?: string;
  role_en?: string;
  company?: string;
  company_en?: string;
  school?: string;
  school_en?: string;
  degree?: string;
  degree_en?: string;
  startDate: string;
  endDate: string;
  description?: string;
  description_en?: string;
}

export interface Social {
  linkedin?: string;
  github?: string;
  twitter?: string;
  email?: string;
}

# Content Maintenance Guide (for non-technical maintainers)
English | [中文](content-guide.zh.md)

All display content on this site lives in the **`content`** folder and the **`public/content`** folder at the project root.
You don't need to know how to code: just edit these files with Notepad or any text editor (we recommend [VS Code](https://code.visualstudio.com/)), save, and refresh the page to see the change.

> Important: when editing JSON files, keep the braces `{}`, brackets `[]`, quotes `""`, and commas `,` intact, or the page will show an error. Troubleshooting tips are at the end.

---

## 1. File & Folder Overview

```
Project root/
├── content/                  ← Text content (edit these files to update the site)
│   ├── profile.json          ← Personal info, bio, avatar
│   ├── projects.json         ← Project list
│   ├── skills.json           ← Skill categories & lists
│   ├── experience.json       ← Work / education history
│   └── social.json           ← Social links, contact info
│
└── public/
    └── content/
        └── images/           ← Image assets (avatar, project screenshots, etc.)
```

| File | Purpose | Where it appears |
| --- | --- | --- |
| `content/profile.json` | Name, job title, tagline, bio, avatar, email | Homepage hero, About, Contact |
| `content/projects.json` | Project list | Projects page |
| `content/skills.json` | Skill categories & tech stack | Skills / Experience page |
| `content/experience.json` | Work & education history | Skills / Experience page, About (education part) |
| `content/social.json` | LinkedIn, GitHub, Twitter, email | Homepage, Contact section |
| `public/content/images/` | Avatar, project images, etc. | Referenced by the JSON files above |

---

## 2. Field Reference Tables

### 1. `profile.json` (personal info)

| Field | Meaning | Type | Required | Example |
| --- | --- | --- | --- | --- |
| `name` | Name | string | Yes | `"Zhang San"` |
| `title` | Job title | string | Yes | `"Full-Stack Developer"` |
| `headline` | One-line intro | string | Yes | `"Passionate about building elegant, efficient web apps"` |
| `avatar` | Avatar image path | string | No | `"/content/images/avatar.svg"` |
| `bio` | Bio (100–300 characters recommended) | string | Yes | `"5+ years of full-stack experience…"` |
| `location` | Location | string | No | `"Shanghai"` |
| `email` | Email | string | No | `"zhangsan@example.com"` |

### 2. `projects.json` (projects — an array)

Each project is one object:

| Field | Meaning | Type | Required | Example |
| --- | --- | --- | --- | --- |
| `id` | Unique id (no duplicates) | string | Yes | `"project-1"` |
| `title` | Project name | string | Yes | `"Personal Blog"` |
| `description` | Project description (1–2 sentences) | string | Yes | `"A Next.js-powered Markdown blog…"` |
| `techStack` | Tech stack list | string[] | Yes | `["Next.js", "Tailwind CSS"]` |
| `image` | Project image path | string | No | `"/content/images/blog.png"` |
| `liveUrl` | Live demo link | string | No | `"https://blog.example.com"` |
| `githubUrl` | Source code link | string | No | `"https://github.com/zhangsan/blog"` |
| `featured` | Mark as "Featured" | boolean (`true`/`false`) | No | `true` |
| `category` | Category (for filtering) | string | No | `"Web"` |

### 3. `skills.json` (skills — an array)

| Field | Meaning | Type | Required | Example |
| --- | --- | --- | --- | --- |
| `category` | Category key (English, for grouping) | string | Yes | `"frontend"` |
| `label` | Category display name | string | Yes | `"Frontend"` |
| `items` | Skill list in this category | string[] | Yes | `["React", "Vue"]` |

### 4. `experience.json` (experience — an array)

Each entry is either work (`work`) or education (`education`).

| Field | Meaning | Type | Required | Example |
| --- | --- | --- | --- | --- |
| `id` | Unique id | string | Recommended | `"exp-1"` |
| `type` | Type: `"work"` or `"education"` | string | Yes | `"work"` |
| `role` | Job title (work only) | string | Required for work | `"Senior Frontend Engineer"` |
| `company` | Company (work only) | string | Required for work | `"ABC Tech"` |
| `school` | School (education only) | string | Required for education | `"Example University"` |
| `degree` | Degree (education only) | string | Required for education | `"B.Sc. in Computer Science"` |
| `startDate` | Start date | string | Yes | `"2022-03"` |
| `endDate` | End date (or "Present") | string | Yes | `"Present"` |
| `description` | Description (what you did) | string | No | `"Led frontend architecture…"` |

### 5. `social.json` (social links)

| Field | Meaning | Type | Required | Example |
| --- | --- | --- | --- | --- |
| `linkedin` | LinkedIn profile URL | string | No | `"https://linkedin.com/in/zhangsan"` |
| `github` | GitHub profile URL | string | No | `"https://github.com/zhangsan"` |
| `twitter` | Twitter URL (hidden when empty) | string | No | `""` |
| `email` | Email | string | No | `"zhangsan@example.com"` |

> Note: empty fields (e.g. `twitter`) are automatically hidden from the page.

---

## 3. Common Tasks

### How to edit your personal info

1. Open `content/profile.json`.
2. Change fields such as `name`, `title`, `headline`, `bio`.
3. Save the file and refresh the page.

**Avatar size advice**: use a square image (e.g. 400×400 px), PNG/JPG/SVG all work. Put it in `public/content/images/`, then set the `avatar` field to its path, e.g. `"/content/images/avatar.png"`.
If `avatar` is empty or fails to load, the page automatically shows your name's first letter as the avatar.

**Bio length advice**: keep `bio` around 100–300 characters; longer text may break the layout.

### How to add a project

1. Open `content/projects.json`.
2. Find the `[ ... ]` array, add a comma `,` after the last project's `}`, then paste the template below:

```json
{
  "id": "project-7",
  "title": "New Project Name",
  "description": "Describe what this project does in one or two sentences.",
  "techStack": ["TechA", "TechB"],
  "image": "",
  "liveUrl": "",
  "githubUrl": "https://github.com/your-account/repo-name",
  "featured": false,
  "category": "Web"
}
```

3. Save and refresh the Projects page to see the new card.
4. To add an image: put the image in `public/content/images/` and set `image` to `"/content/images/your-image.png"`.

### How to delete a project

1. Open `content/projects.json`.
2. Find the project's `{ ... }` block and delete the whole block.
3. Make sure the remaining commas are correct (the last item in the array must not end with a comma).
4. Save and refresh.

### How to edit skills

1. Open `content/skills.json`.
2. Each category is an object. For example, to add a skill to the "Frontend" category, add it to the `items` of the category whose `label` is `"Frontend"`:

```json
{ "category": "frontend", "label": "Frontend", "items": ["React", "Vue", "Next.js", "Tailwind CSS", "New Skill"] }
```

3. To add a new category, append to the array:

```json
{ "category": "design", "label": "Design", "items": ["Figma", "Sketch"] }
```

### How to edit experience

1. Open `content/experience.json`.
2. To add work experience: append an object with `"type": "work"` (fields `role`, `company`, `startDate`, `endDate`).
3. To add education: append an object with `"type": "education"` (fields `school`, `degree`, `startDate`, `endDate`).
4. Save and refresh the Skills / Experience page.

---

## 4. FAQ

### Images are not showing?

1. Make sure the image file is in `public/content/images/` (not `content/images/`).
2. Make sure the JSON path starts with `/content/images/`, e.g. `"/content/images/avatar.png"`.
3. Make sure the file name (including capitalization) matches exactly.
4. If the image isn't ready yet, leave the field empty (`""`) — the page will show a placeholder/first-letter avatar instead of breaking.

### The page is blank or shows an error because of invalid JSON — how do I fix it?

The page won't go fully blank; instead the affected section shows a red "Failed to load content" message with error details.

Common mistakes:

- **Missing comma**: a `,` is missing between two fields or two objects.
- **Trailing comma**: a `,` was added after the last item (e.g. `"email": "x@x.com",` followed directly by `}`).
- **Unmatched quotes**: a string starts with `"` but doesn't end with `"`.
- **Missing or extra `}` / `]`**.

How to troubleshoot:

1. Open the [JSON validator](https://jsonlint.com/), paste the file content — it will tell you which line is wrong.
2. Fix it, save, and refresh the page until the error message disappears.

### I made changes but the page didn't update?

- Locally: save the file, then refresh the browser.
- If deployed (e.g. Vercel): you need to redeploy (see "How to publish updates" below).

---

## 5. How to Publish Updates

### Local preview

Open a terminal in the project root and run:

```bash
npm install        # only the first time
npm run dev        # start local preview, open http://localhost:3000
```

### Deploy online (using Vercel as an example)

1. Commit the changes and push to Git (`git add .` → `git commit -m "update content"` → `git push`).
2. If the project is connected to Vercel, pushing triggers an automatic rebuild and deploy — the live site updates within a few minutes.
3. You can also verify locally first with `npm run build` to make sure there are no errors before committing.

> For more detailed environment variables and deployment instructions, see [docs/deployment.md](deployment.md).

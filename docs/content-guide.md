# 内容维护指南（面向非技术维护者）

本网站的所有展示内容都存放在项目根目录下的 **`content`** 文件夹和 **`public/content`** 文件夹里。
你不需要懂代码，只需要用「记事本」或任意文本编辑器（推荐 [VS Code](https://code.visualstudio.com/)）修改这些文件，保存后刷新网页即可看到变化。

> 重要提示：修改 JSON 文件时，请保持文件的「大括号、中括号、引号、逗号」完整，否则页面会提示错误。文末有排查方法。

---

## 一、文件目录说明

```
项目根目录/
├── content/                  ← 文字内容（修改这些文件即可更新网站）
│   ├── profile.json          ← 个人信息、简介、头像
│   ├── projects.json         ← 项目作品列表
│   ├── skills.json           ← 技能分类与列表
│   ├── experience.json       ← 工作 / 教育经历
│   └── social.json           ← 社交链接、联系方式
│
└── public/
    └── content/
        └── images/           ← 图片资源（头像、项目截图等）
```

| 文件 | 作用 | 对应网页位置 |
| --- | --- | --- |
| `content/profile.json` | 姓名、职位、一句话介绍、简介、头像、邮箱 | 首页 Hero 区块、关于我、联系方式 |
| `content/projects.json` | 项目作品列表 | 项目作品页 |
| `content/skills.json` | 技能分类与技术栈 | 技能 / 经历页 |
| `content/experience.json` | 工作与教育经历 | 技能 / 经历页、关于我（教育部分） |
| `content/social.json` | LinkedIn、GitHub、Twitter、邮箱 | 首页、联系方式区块 |
| `public/content/images/` | 头像、项目图片等图片文件 | 被上面的 JSON 文件引用 |

---

## 二、字段说明表

### 1. `profile.json`（个人信息）

| 字段 | 含义 | 类型 | 必填 | 示例 |
| --- | --- | --- | --- | --- |
| `name` | 姓名 | 文字 | 是 | `"张三"` |
| `title` | 职位 | 文字 | 是 | `"全栈开发工程师"` |
| `headline` | 一句话介绍 | 文字 | 是 | `"热爱构建优雅、高效的 Web 应用"` |
| `avatar` | 头像图片路径 | 文字 | 否 | `"/content/images/avatar.svg"` |
| `bio` | 个人简介（建议 100~300 字） | 文字 | 是 | `"拥有 5 年全栈开发经验……"` |
| `location` | 所在地 | 文字 | 否 | `"上海"` |
| `email` | 邮箱 | 文字 | 否 | `"zhangsan@example.com"` |

### 2. `projects.json`（项目作品，是一个「数组」）

每个项目是一个对象，字段如下：

| 字段 | 含义 | 类型 | 必填 | 示例 |
| --- | --- | --- | --- | --- |
| `id` | 唯一标识（不能重复） | 文字 | 是 | `"project-1"` |
| `title` | 项目名称 | 文字 | 是 | `"个人博客系统"` |
| `description` | 项目描述（1~2 句话） | 文字 | 是 | `"基于 Next.js 的 Markdown 博客……"` |
| `techStack` | 技术栈列表 | 文字数组 | 是 | `["Next.js", "Tailwind CSS"]` |
| `image` | 项目图片路径 | 文字 | 否 | `"/content/images/blog.png"` |
| `liveUrl` | 在线演示链接 | 文字 | 否 | `"https://blog.example.com"` |
| `githubUrl` | 源码链接 | 文字 | 否 | `"https://github.com/zhangsan/blog"` |
| `featured` | 是否标记为「精选」 | 布尔（`true`/`false`） | 否 | `true` |
| `category` | 分类（用于筛选） | 文字 | 否 | `"Web 开发"` |

### 3. `skills.json`（技能，是一个「数组」）

| 字段 | 含义 | 类型 | 必填 | 示例 |
| --- | --- | --- | --- | --- |
| `category` | 分类标识（英文，用于区分） | 文字 | 是 | `"frontend"` |
| `label` | 分类显示名（中文） | 文字 | 是 | `"前端"` |
| `items` | 该分类下的技能列表 | 文字数组 | 是 | `["React", "Vue"]` |

### 4. `experience.json`（经历，是一个「数组」）

每个条目分两种类型：工作（`work`）和教育（`education`）。

| 字段 | 含义 | 类型 | 必填 | 示例 |
| --- | --- | --- | --- | --- |
| `id` | 唯一标识 | 文字 | 建议填写 | `"exp-1"` |
| `type` | 类型：`"work"` 或 `"education"` | 文字 | 是 | `"work"` |
| `role` | 职位（仅 `work`） | 文字 | work 时必填 | `"高级前端工程师"` |
| `company` | 公司（仅 `work`） | 文字 | work 时必填 | `"ABC 科技"` |
| `school` | 学校（仅 `education`） | 文字 | education 时必填 | `"某某大学"` |
| `degree` | 学历/学位（仅 `education`） | 文字 | education 时必填 | `"计算机科学学士"` |
| `startDate` | 开始时间 | 文字 | 是 | `"2022-03"` |
| `endDate` | 结束时间（可写「至今」） | 文字 | 是 | `"至今"` |
| `description` | 描述（做了什么） | 文字 | 否 | `"负责核心产品前端架构……"` |

### 5. `social.json`（社交链接）

| 字段 | 含义 | 类型 | 必填 | 示例 |
| --- | --- | --- | --- | --- |
| `linkedin` | LinkedIn 主页链接 | 文字 | 否 | `"https://linkedin.com/in/zhangsan"` |
| `github` | GitHub 主页链接 | 文字 | 否 | `"https://github.com/zhangsan"` |
| `twitter` | Twitter 链接（留空则不显示） | 文字 | 否 | `""` |
| `email` | 邮箱 | 文字 | 否 | `"zhangsan@example.com"` |

> 说明：留空的字段（如 `twitter`）会自动隐藏，不显示在页面上。

---

## 三、常见操作

### 如何修改个人信息

1. 打开 `content/profile.json`。
2. 修改 `name`、`title`、`headline`、`bio` 等字段。
3. 保存文件，刷新网页即可看到变化。

**头像尺寸建议**：建议使用正方形图片（如 400×400 像素），支持 PNG、JPG、SVG 等格式。放入 `public/content/images/` 后，把 `avatar` 字段改成对应的路径，例如 `"/content/images/avatar.png"`。
如果 `avatar` 留空或图片加载失败，页面会自动显示姓名首字作为头像。

**简介长度建议**：`bio` 建议控制在 100~300 字，过长会影响页面排版。

### 如何新增一个项目

1. 打开 `content/projects.json`。
2. 找到 `[ ... ]` 数组，在最后一个项目的 `}` 之后加一个逗号 `,`，然后粘贴下面的模板：

```json
{
  "id": "project-7",
  "title": "新项目名称",
  "description": "用一两句话描述这个项目做了什么。",
  "techStack": ["技术A", "技术B"],
  "image": "",
  "liveUrl": "",
  "githubUrl": "https://github.com/你的账号/仓库名",
  "featured": false,
  "category": "Web 开发"
}
```

3. 保存文件，刷新「项目作品」页即可看到新卡片。
4. 如果要给项目配图：把图片放入 `public/content/images/`，再把 `image` 改成 `"/content/images/你的图片名.png"`。

### 如何删除一个项目

1. 打开 `content/projects.json`。
2. 找到该项目对应的 `{ ... }`（从它的 `{` 到 `}`），整段删除。
3. 确保前后逗号正确（数组中最后一个项目后面不要有多余逗号）。
4. 保存并刷新。

### 如何修改技能

1. 打开 `content/skills.json`。
2. 每个分类是一个对象。例如要在「前端」分类里加一个技能，找到 `"label": "前端"` 对应的 `items`，在其中加入技能名即可：

```json
{ "category": "frontend", "label": "前端", "items": ["React", "Vue", "Next.js", "Tailwind CSS", "新技能"] }
```

3. 要新增一个分类，在数组里追加：

```json
{ "category": "design", "label": "设计", "items": ["Figma", "Sketch"] }
```

### 如何修改经历

1. 打开 `content/experience.json`。
2. 新增工作经历：追加一个 `type` 为 `"work"` 的对象（含 `role`、`company`、`startDate`、`endDate`）。
3. 新增教育经历：追加一个 `type` 为 `"education"` 的对象（含 `school`、`degree`、`startDate`、`endDate`）。
4. 保存并刷新「技能 / 经历」页。

---

## 四、常见问题（FAQ）

### 图片不显示怎么办？

1. 确认图片文件放在了 `public/content/images/` 目录下（不是 `content/images/`）。
2. 确认 JSON 里的路径以 `/content/images/` 开头，例如 `"/content/images/avatar.png"`。
3. 确认文件名（含大小写）与 JSON 里写的一致。
4. 若图片暂未准备好，把对应字段留空（`""`），页面会自动显示占位图/首字头像，不会出错。

### JSON 格式错误导致页面空白或报错，如何排查？

页面不会直接「白屏」，而是会在对应区块显示「内容加载失败」的红色提示，并给出错误信息。

常见错误：

- **少了逗号**：两个字段或两个对象之间漏了 `,`。
- **多了逗号**：数组或对象最后一个元素后面多写了一个 `,`（例如 `"email": "x@x.com",` 后面直接 `}`）。
- **引号不配对**：字符串开头有 `"` 结尾漏了 `"`。
- **多了或少了 `}` / `]`**。

排查方法：

1. 打开 [JSON 在线校验工具](https://jsonlint.com/)，把文件内容粘贴进去，它会告诉你哪一行有错。
2. 修改后重新保存，刷新页面确认「内容加载失败」提示消失。

### 修改后页面没有变化？

- 本地预览时，保存文件后刷新浏览器即可。
- 如果部署到了线上（如 Vercel），需要重新部署（见下文「如何发布更新」）。

---

## 五、如何发布更新

### 本地预览

在项目根目录打开终端，运行：

```bash
npm install        # 首次需要
npm run dev        # 启动本地预览，浏览器访问 http://localhost:3000
```

### 部署到线上（以 Vercel 为例）

1. 把改动提交到 Git 仓库并推送（`git add .` → `git commit -m "更新内容"` → `git push`）。
2. 如果项目已连接到 Vercel，推送后会自动重新构建并发布，几分钟后线上即可看到更新。
3. 也可以本地先构建检查：`npm run build`，确认没有报错再提交。

> 更详细的环境变量与部署说明，请参考 `docs/deployment.md`（后续里程碑提供）。

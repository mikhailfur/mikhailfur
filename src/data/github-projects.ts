import type { Project } from "@/types/portfolio";

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "mikhailfur";

const FALLBACK_PROJECTS: Project[] = [
  {
    name: "sd-webui-ai-wdywfm",
    description:
      "AI LLM SD WebUI Helper for Forge Neo. Turn plain language or images into model-aware Stable Diffusion prompts tailored to your local checkpoints & LoRAs!",
    stack: ["Python", "Gradio", "LM Studio", "SDXL"],
    url: "https://github.com/mikhailfur/sd-webui-ai-wdywfm",
    status: "wip",
  },
  {
    name: "claudecodecli-minimax-usage",
    description:
      "Plugin shows MiniMax Token Plan usage in Claude Code CLI with live quota bars and token usage table.",
    stack: ["Shell", "Claude Code", "MiniMax"],
    url: "https://github.com/mikhailfur/claudecodecli-minimax-usage",
    status: "wip",
  },
  {
    name: "morganai",
    description:
      "Telegram bot with AI characters for roleplay chats with unique personalities and context support.",
    stack: ["TypeScript", "Node.js", "AI"],
    url: "https://github.com/mikhailfur/morganai",
    status: "wip",
  },
  {
    name: "alyabot",
    description:
      "Telegram bot AI companion Alya from anime with tsundere character traits.",
    stack: ["TypeScript", "Telegram", "AI"],
    url: "https://github.com/mikhailfur/alyabot",
    status: "wip",
  },
];

const TOPIC_MAP: Record<string, string> = {
  nextjs: "Next.js",
  react: "React",
  typescript: "TypeScript",
  javascript: "JavaScript",
  python: "Python",
  tailwind: "Tailwind",
  gradio: "Gradio",
  sdxl: "SDXL",
  llm: "LLM",
  ai: "AI",
  telegram: "Telegram",
  magisk: "Magisk",
  samsung: "Samsung",
  node: "Node.js",
  nodejs: "Node.js",
  docker: "Docker",
};

export function extractDescriptionFromReadme(readme: string): string | null {
  if (!readme) return null;

  let text = readme
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[\]\(.*?\)/g, "");

  const lines = text.split(/\r?\n/);
  const cleanLines: string[] = [];

  for (let line of lines) {
    line = line.replace(/^[#>\s\-\*\+\d\.]+\s*/, "").trim();
    line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    line = line.replace(/[*_~`]/g, "").trim();

    if (
      line.length > 15 &&
      !line.startsWith("http") &&
      !line.includes("|") &&
      !line.toLowerCase().startsWith("languages:") &&
      !line.toLowerCase().startsWith("language:")
    ) {
      cleanLines.push(line);
    }
  }

  const result = cleanLines.join(" ").replace(/\s+/g, " ").trim();
  if (!result) return null;

  return result.length > 180 ? `${result.slice(0, 177).trim()}...` : result;
}

type GithubRepo = {
  name: string;
  description: string | null;
  html_url: string;
  fork: boolean;
  archived: boolean;
  language: string | null;
  topics?: string[];
  default_branch?: string;
  pushed_at?: string;
};

export async function getGithubProjects(username = GITHUB_USERNAME): Promise<Project[]> {
  try {
    const headers: Record<string, string> = {
      "User-Agent": "mikhailfur-portfolio-app",
      Accept: "application/vnd.github.v3+json",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=30`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API returned status ${res.status}, using fallback projects.`);
      return FALLBACK_PROJECTS;
    }

    const repos: GithubRepo[] = await res.json();
    if (!Array.isArray(repos)) {
      return FALLBACK_PROJECTS;
    }

    const filtered = repos
      .filter((repo) => !repo.fork && repo.name !== username)
      .sort((a, b) => {
        const timeA = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
        const timeB = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 3);

    const projectPromises = filtered.map(async (repo): Promise<Project> => {
      let readmeDescription: string | null = null;
      try {
        const branch = repo.default_branch || "main";
        const readmeRes = await fetch(
          `https://raw.githubusercontent.com/${username}/${repo.name}/${branch}/README.md`,
          { next: { revalidate: 3600 } }
        );
        if (readmeRes.ok) {
          const readmeText = await readmeRes.text();
          readmeDescription = extractDescriptionFromReadme(readmeText);
        }
      } catch {
        // Ignore readme fetch error
      }

      const description =
        readmeDescription ||
        repo.description ||
        `GitHub repository: ${repo.name}`;

      const stackSet = new Set<string>();
      if (repo.language) stackSet.add(repo.language);
      if (Array.isArray(repo.topics)) {
        for (const topic of repo.topics) {
          const lower = topic.toLowerCase();
          stackSet.add(TOPIC_MAP[lower] || topic.charAt(0).toUpperCase() + topic.slice(1));
        }
      }
      if (stackSet.size === 0) {
        stackSet.add("GitHub");
      }

      const now = new Date().getTime();
      const pushedTime = repo.pushed_at ? new Date(repo.pushed_at).getTime() : 0;
      const daysSincePush = (now - pushedTime) / (1000 * 60 * 60 * 24);
      const status: "stable" | "wip" =
        repo.archived || daysSincePush > 90 ? "stable" : "wip";

      return {
        name: repo.name,
        description,
        stack: Array.from(stackSet).slice(0, 4),
        url: repo.html_url,
        status,
      };
    });

    const projects = await Promise.all(projectPromises);
    return projects.length > 0 ? projects : FALLBACK_PROJECTS;
  } catch (error) {
    console.error("Failed to fetch GitHub projects:", error);
    return FALLBACK_PROJECTS;
  }
}

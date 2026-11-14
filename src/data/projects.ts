import type { Project } from "@/types/portfolio";

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "mikhailfur";

const FALLBACK_PROJECTS: Project[] = [
  {
    name: "sd-webui-ai-wdywfm",
    description:
      "AI-помощник для Stable Diffusion WebUI Forge Neo: превращает обычную фразу или картинку в промпт под твои чекпойнты и LoRA.",
    stack: ["Python", "Gradio", "LM Studio", "SDXL"],
    url: "https://github.com/mikhailfur/sd-webui-ai-wdywfm",
    status: "wip",
  },
  {
    name: "claudecodecli-minimax-usage",
    description:
      "Плагин для Claude Code CLI: показывает расход MiniMax Token Plan, живые полосы квот и таблицу токенов.",
    stack: ["Shell", "Claude Code", "MiniMax"],
    url: "https://github.com/mikhailfur/claudecodecli-minimax-usage",
    status: "wip",
  },
  {
    name: "morganai",
    description:
      "Telegram-бот с AI-персонажами для ролевых чатов: характеры, контекст, память.",
    stack: ["TypeScript", "Node.js", "AI"],
    url: "https://github.com/mikhailfur/morganai",
    status: "wip",
  },
  {
    name: "alyabot",
    description:
      "Telegram-бот с Алей из аниме: цундэрэ-характер, русская речь и голосовые ответы.",
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
  protonvpn: "ProtonVPN",
  "ai-agents": "AI Agents",
  "ai-safety": "AI Safety",
  "discord-mod": "Discord",
  "vencord-plugin": "Vencord",
  allicord: "Allicord",
  allidroid: "Allidroid",
  benchmark: "Benchmark",
  mcp: "MCP",
  rich: "Rich",
  terminal: "Terminal",
  textual: "Textual",
  tui: "TUI",
  vpn: "VPN",
  "world-map": "World Map",
  "red-team": "Red Team",
};

function cleanDescription(value: string) {
  return value
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/github\.com\/\S+/g, "")
    .replace(/\binstall:\s*/gi, "")
    .replace(/\s*—\s*/g, ": ")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,:;])/g, "$1")
    .trim();
}

function extractDescriptionFromReadme(readme: string): string | null {
  if (!readme) return null;

  const text = readme
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[\]\(.*?\)/g, "");

  const lines = text.split(/\r?\n/);
  const cleanLines: string[] = [];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (!trimmed) continue;
    if (trimmed.startsWith("#")) continue;
    if (/^[-*+]\s+/.test(trimmed) && cleanLines.length > 0) break;

    let line = trimmed;
    line = line.replace(/^[#>\s\-*+\d.]+\s*/, "").trim();
    line = line.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    line = line.replace(/https?:\/\/\S+/g, "").trim();
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

  return result.length > 190 ? `${result.slice(0, 187).trim()}...` : result;
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
  stargazers_count?: number;
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
      `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=40`,
      { headers, next: { revalidate: 3600 } },
    );

    if (!res.ok) return FALLBACK_PROJECTS;

    const repos: GithubRepo[] = await res.json();
    if (!Array.isArray(repos)) return FALLBACK_PROJECTS;

    const filtered = repos
      .filter((repo) => !repo.fork && repo.name !== username)
      .sort((a, b) => {
        const timeA = a.pushed_at ? new Date(a.pushed_at).getTime() : 0;
        const timeB = b.pushed_at ? new Date(b.pushed_at).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 6);

    const projects = await Promise.all(
      filtered.map(async (repo): Promise<Project> => {
        let readmeDescription: string | null = null;
        try {
          const branch = repo.default_branch || "main";
          const readmeRes = await fetch(
            `https://raw.githubusercontent.com/${username}/${repo.name}/${branch}/README.md`,
            { next: { revalidate: 3600 } },
          );
          if (readmeRes.ok) readmeDescription = extractDescriptionFromReadme(await readmeRes.text());
        } catch {
          // README is optional.
        }

        const stackSet = new Set<string>();
        if (repo.language) stackSet.add(repo.language);
        if (Array.isArray(repo.topics)) {
          for (const topic of repo.topics) {
            const lower = topic.toLowerCase();
            const fallback = lower
              .split("-")
              .map((word) => (word === "ai" ? "AI" : word.charAt(0).toUpperCase() + word.slice(1)))
              .join(" ");
            stackSet.add(TOPIC_MAP[lower] || fallback);
          }
        }
        if (stackSet.size === 0) stackSet.add("GitHub");

        const now = Date.now();
        const pushedTime = repo.pushed_at ? new Date(repo.pushed_at).getTime() : 0;
        const daysSincePush = (now - pushedTime) / (1000 * 60 * 60 * 24);

        const repoDescription = cleanDescription(repo.description ?? "");
        const curated = FALLBACK_PROJECTS.find((project) => project.name === repo.name);
        const description =
          repoDescription && repoDescription.length >= 30
            ? repoDescription
            : curated?.description || readmeDescription || repoDescription || `GitHub repository: ${repo.name}`;

        return {
          name: repo.name,
          description,
          stack: Array.from(stackSet).slice(0, 4),
          url: repo.html_url,
          status: repo.archived ? "archived" : daysSincePush > 90 ? "stable" : "wip",
          stars: repo.stargazers_count,
          pushedAt: repo.pushed_at,
        };
      }),
    );

    return projects.length > 0 ? projects : FALLBACK_PROJECTS;
  } catch {
    return FALLBACK_PROJECTS;
  }
}

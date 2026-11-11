import type { SiteIconName } from "@/components/icons/site-icon";

export type SectionIconKey = "about" | "works" | "stack" | "notes" | "gallery" | "play" | "contact";

export const SECTION_ICONS: Record<SectionIconKey, SiteIconName> = {
  about: "letter",
  works: "briefcase",
  stack: "toolbox",
  notes: "notebook",
  gallery: "camera",
  play: "gamepad",
  contact: "paper-plane",
};

export type ArcadeIconKey = "snake" | "wallz" | "chat";

export const ARCADE_ICONS: Record<ArcadeIconKey, SiteIconName> = {
  snake: "snake",
  wallz: "wall",
  chat: "chat",
};

const TECH_ICONS: Record<string, SiteIconName> = {
  nextjs: "nextjs",
  next: "nextjs",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  react: "react",
  tailwind: "tailwind",
  tailwindcss: "tailwind",
  python: "python",
  nestjs: "nestjs",
  docker: "docker",
  git: "git",
  github: "github",
  linux: "linux",
  wsl: "linux",
  ollama: "ollama",
  lmstudio: "lmstudio",
  openrouter: "openrouter",
  nodejs: "nodejs",
  node: "nodejs",
  gradio: "gradio",
  bash: "bash",
  shell: "bash",
  claudecode: "claudecode",
  claude: "claudecode",
  minimax: "minimax",
  openai: "openai",
  vercel: "vercel",
  ai: "ai",
  llm: "ai",
  sdxl: "ai",
  sdf: "ai",
  telegram: "telegram",
  discord: "discord",
  restapi: "network",
  rest: "network",
  api: "network",
  network: "network",
  promptdesign: "quill",
  prompt: "quill",
  promptengineering: "quill",
  프롬프트설계: "quill",
  dokploy: "gear",
  automation: "gear",
};

export function technologyIcon(name: string): SiteIconName {
  const key = name
    .toLowerCase()
    .replace(/\.js/g, "")
    .replace(/[^a-z0-9가-힣]/g, "");
  return TECH_ICONS[key] ?? "network";
}

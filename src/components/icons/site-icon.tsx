"use client";

import { FontAwesomeIcon, type FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBook,
  faBowlRice,
  faBrain,
  faBriefcase,
  faCamera,
  faCaretUp,
  faChartLine,
  faCode,
  faCoins,
  faComments,
  faCube,
  faEnvelope,
  faFeatherPointed,
  faFileCode,
  faGamepad,
  faGear,
  faHeart,
  faHouse,
  faKey,
  faLock,
  faMicrochip,
  faMobileScreenButton,
  faMusic,
  faNetworkWired,
  faPaperPlane,
  faPalette,
  faPause,
  faRobot,
  faRoute,
  faScaleBalanced,
  faServer,
  faShieldHalved,
  faTableCells,
  faTag,
  faTerminal,
  faToolbox,
  faToriiGate,
  faTrophy,
  faWaveSquare,
  faWind,
  faWorm,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import {
  faDiscord,
  faDocker,
  faGitAlt,
  faGithub,
  faJs,
  faLinux,
  faNodeJs,
  faOpenai,
  faPython,
  faReact,
  faTelegram,
} from "@fortawesome/free-brands-svg-icons";

export type SiteIconName =
  | "snake"
  | "wall"
  | "chat"
  | "letter"
  | "briefcase"
  | "toolbox"
  | "notebook"
  | "camera"
  | "gamepad"
  | "paper-plane"
  | "terminal"
  | "key"
  | "music"
  | "ai"
  | "gear"
  | "meal"
  | "palette"
  | "trophy"
  | "cross"
  | "pause"
  | "shrine"
  | "network"
  | "mobile"
  | "shield"
  | "chart"
  | "tag"
  | "quill"
  | "heart"
  | "scales"
  | "coin"
  | "home"
  | "padlock"
  | "github"
  | "discord"
  | "telegram"
  | "nextjs"
  | "typescript"
  | "react"
  | "tailwind"
  | "python"
  | "nestjs"
  | "docker"
  | "git"
  | "linux"
  | "ollama"
  | "lmstudio"
  | "openrouter"
  | "javascript"
  | "nodejs"
  | "gradio"
  | "bash"
  | "claudecode"
  | "minimax"
  | "openai"
  | "vercel";

const ICONS: Record<SiteIconName, IconDefinition> = {
  snake: faWorm,
  wall: faTableCells,
  chat: faComments,
  letter: faEnvelope,
  briefcase: faBriefcase,
  toolbox: faToolbox,
  notebook: faBook,
  camera: faCamera,
  gamepad: faGamepad,
  "paper-plane": faPaperPlane,
  terminal: faTerminal,
  key: faKey,
  music: faMusic,
  ai: faBrain,
  gear: faGear,
  meal: faBowlRice,
  palette: faPalette,
  trophy: faTrophy,
  cross: faXmark,
  pause: faPause,
  shrine: faToriiGate,
  network: faNetworkWired,
  mobile: faMobileScreenButton,
  shield: faShieldHalved,
  chart: faChartLine,
  tag: faTag,
  quill: faFeatherPointed,
  heart: faHeart,
  scales: faScaleBalanced,
  coin: faCoins,
  home: faHouse,
  padlock: faLock,
  github: faGithub,
  discord: faDiscord,
  telegram: faTelegram,
  nextjs: faCode,
  typescript: faFileCode,
  react: faReact,
  tailwind: faWind,
  python: faPython,
  nestjs: faServer,
  docker: faDocker,
  git: faGitAlt,
  linux: faLinux,
  ollama: faRobot,
  lmstudio: faMicrochip,
  openrouter: faRoute,
  javascript: faJs,
  nodejs: faNodeJs,
  gradio: faCube,
  bash: faTerminal,
  claudecode: faCode,
  minimax: faWaveSquare,
  openai: faOpenai,
  vercel: faCaretUp,
};

export function SiteIcon({
  name,
  ...props
}: { name: SiteIconName } & Omit<FontAwesomeIconProps, "icon">) {
  return <FontAwesomeIcon icon={ICONS[name]} aria-hidden="true" focusable="false" {...props} />;
}

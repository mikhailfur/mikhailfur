export const languages = ["ru", "en", "ko"] as const;
export type Language = (typeof languages)[number];

export type Article = {
  id: string;
  type: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  redacted: string[];
};

export type Project = {
  name: string;
  description: string;
  stack: string[];
  url: string;
  status: "stable" | "wip";
  stars?: number;
  pushedAt?: string;
};

export type StackGroup = {
  name: string;
  items: string[];
};

export type TerminalAction =
  | "about"
  | "arcade"
  | "archive"
  | "clear"
  | "gallery"
  | "github"
  | "help"
  | "hobbies"
  | "music"
  | "message"
  | "miyabi"
  | "projects"
  | "stack"
  | "2fa"
  | "snake"
  | "wallz"
  | "chat"
  | "lang";

export type TerminalCommand = {
  name: string;
  aliases?: string[];
  description: string;
  action: TerminalAction;
  quick?: boolean;
};

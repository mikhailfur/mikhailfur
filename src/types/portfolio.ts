export const languages = ["en", "ru", "ko"] as const;
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

export type TerminalAction =
  | "about"
  | "arcade"
  | "archive"
  | "clear"
  | "gallery"
  | "github"
  | "help"
  | "hobbies"
  | "message"
  | "miyabi"
  | "projects"
  | "stack"
  | "2fa"
  | "snake"
  | "wallz"
  | "chat";

export type TerminalCommand = {
  name: string;
  aliases?: string[];
  description: string;
  action: TerminalAction;
  quick?: boolean;
};

export type Project = {
  name: string;
  description: string;
  stack: string[];
  url: string;
  status: "stable" | "wip";
};

export type StackGroup = {
  name: string;
  items: string[];
};

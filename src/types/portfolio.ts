export const languages = ["ru", "en", "ko"] as const;
export type Language = (typeof languages)[number];

export type Article = {
  id: string;
  type: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
};

export type ConstitutionSection = {
  id: string;
  number: string;
  title: string;
  content: string;
};

export type ConstitutionPart = {
  id: string;
  number: string;
  title: string;
  intro: string;
  sections: ConstitutionSection[];
};

export type ConstitutionPreamble = {
  title: string;
  subtitle: string;
  adopted: string;
  place: string;
  edition: string;
  motto: string;
  content: string;
};

export type Constitution = {
  preamble: ConstitutionPreamble | null;
  parts: ConstitutionPart[];
  localized: boolean;
};

export type Project = {
  name: string;
  description: string;
  stack: string[];
  url: string;
  status: "stable" | "wip" | "archived";
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
  | "constitution"
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

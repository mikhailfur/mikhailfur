"use client";

import type { FormEvent, ReactNode } from "react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getPortfolio, getTerminalCommands, ui } from "@/data/site-content";
import type { Article, Language, Project, TerminalCommand } from "@/types/portfolio";
import { TechBadge } from "./tech-badge";
import { MiyabiChatModal } from "./miyabi-chat-modal";
import { StoreModal, AdminModal } from "@/components/store";
import { CyberMatrixBackground } from "./cyber-matrix-background";
import { CommandPalette } from "./command-palette";
import { GallerySection } from "./gallery-section";
import { isSoundEnabled, playBeepSound, playKeyClickSound, playSuccessSound, toggleSound } from "@/utils/sfx";

type IconName = "archive" | "arrow" | "box" | "clock" | "code" | "command" | "discord" | "file" | "github" | "kakao" | "layers" | "shield" | "store" | "telegram" | "twitch" | "user" | "vk" | "xbox";
type AnsiChunk = { color?: string; text: string };
type MusicPresence = { artist?: string; coverUrl?: string; durationMs?: number; progressMs?: number; receivedAt?: number; state: "idle" | "paused" | "playing" | "unavailable" | "unconfigured"; title?: string; url?: string };

const contacts = [
  { label: "Telegram", value: process.env.NEXT_PUBLIC_TELEGRAM_URL },
  { label: "Discord", value: process.env.NEXT_PUBLIC_DISCORD_URL },
  { label: "KakaoTalk", value: process.env.NEXT_PUBLIC_KAKAOTALK_URL },
  { label: "VK", value: process.env.NEXT_PUBLIC_VK_URL },
  { label: "GitHub", value: process.env.NEXT_PUBLIC_GITHUB_URL },
  { label: "Twitch", value: process.env.NEXT_PUBLIC_TWITCH_URL },
  { label: "Xbox", value: process.env.NEXT_PUBLIC_XBOX_URL },
];

const languageStorageKey = "terminal-blog.language";
let storedLanguage: Language = "en";
const languageListeners = new Set<() => void>();

function readStoredLanguage(): Language {
  try {
    const value = localStorage.getItem(languageStorageKey);
    if (value === "en" || value === "ru" || value === "ko") storedLanguage = value;
  } catch {
    // Keep the in-memory selection when local storage is unavailable.
  }
  return storedLanguage;
}

function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  return () => languageListeners.delete(listener);
}

function saveLanguage(language: Language) {
  storedLanguage = language;
  try {
    localStorage.setItem(languageStorageKey, language);
  } catch {
    // Language selection still works when local storage is unavailable.
  }
  languageListeners.forEach((listener) => listener());
}

const contactIcons: Record<(typeof contacts)[number]["label"], IconName> = { Telegram: "telegram", Discord: "discord", KakaoTalk: "kakao", VK: "vk", GitHub: "github", Twitch: "twitch", Xbox: "xbox" };

function xtermColor(index: number) {
  if (index < 16) {
    const base = ["#5a4b40", "#c05a50", "#57a66b", "#c8a65a", "#5d8ec1", "#aa76a2", "#5ba5a5", "#ded7c8", "#716a61", "#d66f60", "#78bd80", "#e0c16c", "#73a7de", "#c98bbe", "#79c4c4", "#fff7e8"];
    return base[index];
  }
  if (index < 232) {
    const value = index - 16;
    const channel = (part: number) => part === 0 ? 0 : 55 + part * 40;
    return `rgb(${channel(Math.floor(value / 36))}, ${channel(Math.floor(value / 6) % 6)}, ${channel(value % 6)})`;
  }
  const level = 8 + (index - 232) * 10;
  return `rgb(${level}, ${level}, ${level})`;
}

function parseAnsiArt(source: string) {
  const lines: AnsiChunk[][] = [[]];
  const matcher = /\x1b\[(?:38;5;(\d+)|0)m/g;
  let color: string | undefined;
  let start = 0;
  const append = (text: string) => {
    for (const character of text) {
      if (character === "\n") lines.push([]);
      else lines.at(-1)?.push({ color, text: character });
    }
  };
  for (let match = matcher.exec(source); match; match = matcher.exec(source)) {
    const text = source.slice(start, match.index);
    if (text) append(text);
    color = match[1] ? xtermColor(Number(match[1])) : undefined;
    start = matcher.lastIndex;
  }
  const tail = source.slice(start);
  if (tail) append(tail);

  // The source has a large transparent braille canvas; crop it before fitting.
  const visibleColumns = lines.flatMap((line) => line.map((cell, column) => cell.text !== " " && cell.text !== "⠀" ? column : -1)).filter((column) => column >= 0);
  if (!visibleColumns.length) return [];
  const left = Math.min(...visibleColumns);
  const right = Math.max(...visibleColumns);
  const chunks: AnsiChunk[] = [];
  lines.forEach((line, index) => {
    if (index) chunks.push({ text: "\n" });
    line.slice(left, right + 1).forEach((cell) => {
      const previous = chunks.at(-1);
      if (previous && previous.color === cell.color) previous.text += cell.text;
      else chunks.push({ ...cell });
    });
  });
  return chunks;
}

function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    archive: <><path d="M3 5h18v4H3z" /><path d="M5 9v10h14V9M10 13h4" /></>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></>,
    clock: <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>,
    code: <path d="m8 9-3 3 3 3m8-6 3 3-3 3M14 5l-4 14" />,
    command: <><path d="M9 6 6 9l3 3" /><path d="M15 18l3-3-3-3M14 4 10 20" /></>,
    discord: <path fill="currentColor" stroke="none" d="M19.5 5.2a16 16 0 0 0-4-1.2l-.5 1a14 14 0 0 0-6 0l-.5-1a16 16 0 0 0-4 1.2C2 8.8 1.3 12.3 1.6 15.7a16.2 16.2 0 0 0 4.9 2.5l1.2-1.7-1.8-.9.4-.3c3.5 1.6 7.3 1.6 10.8 0l.4.3-1.8.9 1.2 1.7a16.2 16.2 0 0 0 4.9-2.5c.4-4-1-7.4-2.3-10.5ZM8.2 13.5c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Zm7.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2Z" />,
    file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    github: <><path d="M9 19c-5 1.5-5-2.5-7-3m14 5v-3.9c0-1.1.1-1.6-.5-2.2 2.2-.2 4.5-1.1 4.5-5a3.9 3.9 0 0 0-1-2.7A3.6 3.6 0 0 0 19 4.5S18.2 4.3 16 5.8a10.5 10.5 0 0 0-8 0C5.8 4.3 5 4.5 5 4.5a3.6 3.6 0 0 0-.1 2.7A3.9 3.9 0 0 0 4 10c0 3.9 2.3 4.8 4.5 5-.5.5-.5 1.2-.5 2.2V21" /></>,
    kakao: <path fill="currentColor" stroke="none" d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.8 5.2 4.6 6.6L6 21l3.9-2.6c.7.1 1.4.2 2.1.2 5.5 0 10-3.5 10-7.8S17.5 3 12 3Zm-3.3 7.9c-.8 0-1.4-.7-1.4-1.5S7.9 8 8.7 8s1.4.7 1.4 1.4-.6 1.5-1.4 1.5Zm6.6 0c-.8 0-1.4-.7-1.4-1.5S14.5 8 15.3 8s1.4.7 1.4 1.4-.6 1.5-1.4 1.5Z" />,
    layers: <><path d="m12 3 9 5-9 5-9-5z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    store: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></>,
    telegram: <path fill="currentColor" stroke="none" d="M21.5 3.3 2.8 10.5c-1.3.5-1.3 1.3-.2 1.7l4.8 1.5 1.9 5.7c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.3 1.7-.8l3.2-15c.3-1.3-.5-1.9-1.6-1.5ZM8.2 13.3l10.9-6.9c.5-.3 1-.1.6.3l-8.8 7.9-.3 3.4-2.4-4.7Z" />,
    twitch: <path fill="currentColor" stroke="none" d="M4 3h17v11.5L16.5 19H12l-2.4 2.4H6.8V19H4V3Zm2 2v12h2.8v2.2L11 17h4.7l3.3-3.3V5H6Zm4 2.4h2v5h-2v-5Zm4.6 0h2v5h-2v-5Z" />,
    user: <><circle cx="12" cy="8" r="3" /><path d="M5 21c.7-3.4 2.9-5 7-5s6.3 1.6 7 5" /></>,
    vk: <path fill="currentColor" stroke="none" d="M3 5.7C3.1 4.2 4.2 3 5.8 3h12.4c1.6 0 2.7 1.2 2.8 2.7v12.6c-.1 1.5-1.2 2.7-2.8 2.7H5.8C4.2 21 3.1 19.8 3 18.3V5.7Zm10.7 10.6c.7.7 1.5 1.3 2.5 1.7.4.1.8-.1.8-.5v-1.2c0-.3-.2-.5-.5-.6-.8-.2-1.6-.7-2.2-1.5l-.7-.9.5-.7 2.1-3.1c.2-.3 0-.7-.4-.7h-1.4c-.3 0-.5.1-.7.4l-1.7 2.7c-.1.2-.5.1-.5-.2V9.3c0-.3-.2-.5-.5-.5H9.7c-.3 0-.5.2-.5.5 0 .7-.2 1.8-.8 2.8-.3.5-.6.8-.9.8-.2 0-.4-.2-.4-.5V9.3c0-.3-.2-.5-.5-.5H5.3c-.3 0-.5.2-.5.5 0 2.4 1.1 4.7 2.9 6.2 1.5 1.3 3.4 2 5.3 2 .3 0 .5-.2.5-.5v-.7c0-.2.1-.3.2 0Z" />,
    xbox: <path d="M6 18.3C4.6 16.6 4 14.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 2.5-.6 4.6-2 6.3M7 5.8C8.4 6.3 10.2 7.4 12 9c1.8-1.6 3.6-2.7 5-3.2M6.2 18.8c1.1-2.4 3.2-5 5.8-7.1 2.6 2.1 4.7 4.7 5.8 7.1" />,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function Prompt({ children }: { children: ReactNode }) {
  return <span className="prompt"><span>mikhailfur@lab</span><b>:</b><em>~</em><b>$</b> {children}</span>;
}

function TerminalFrame({ children, title, actions }: { children: ReactNode; title: string; actions?: ReactNode }) {
  return <div className="terminal-frame">
    <div className="terminal-frame-bar">
      <span className="terminal-frame-controls" aria-hidden="true"><i /><i /><i /></span>
      <span className="terminal-frame-title">{title}</span>
      <span className="terminal-frame-actions">{actions}</span>
    </div>
    <div className="terminal-frame-content">{children}</div>
  </div>;
}

function MusicStatus({ text }: { text: Record<string, string> }) {
  const [presence, setPresence] = useState<MusicPresence>({ state: "unconfigured" });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const response = await fetch("/api/music", { cache: "no-store" });
        if (response.ok && alive) setPresence({ ...await response.json(), receivedAt: Date.now() });
      } catch {
        if (alive) setPresence({ state: "unavailable" });
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 15_000);
    return () => { alive = false; window.clearInterval(interval); };
  }, []);

  useEffect(() => {
    if (presence.state !== "playing") return;
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [presence.state]);

  if (presence.state !== "playing" && presence.state !== "paused") return null;
  const durationMs = Number(presence.durationMs) || 0;
  const progressMs = Number(presence.progressMs) || 0;
  const elapsed = Math.min(durationMs || Infinity, progressMs + (presence.state === "playing" ? now - (presence.receivedAt ?? now) : 0));
  const formatDuration = (value?: number) => {
    const seconds = Math.floor((value ?? 0) / 1_000);
    return `${Math.floor(seconds / 60)}\u2236${String(seconds % 60).padStart(2, "0")}`;
  };
  const progress = durationMs ? Math.min(100, elapsed / durationMs * 100) : 0;
  const details = <><strong>{presence.title}</strong><span>{presence.artist}</span></>;
  return <aside className="music-presence" aria-live="polite">
    <div className="music-head"><span><i /> YANDEX MUSIC</span><span className={`music-state ${presence.state}`}>{presence.state === "playing" ? text.playing : text.paused}</span></div>
    <div className="music-track">
      {presence.coverUrl ? <Image className="music-cover" src={presence.coverUrl} alt="" width={92} height={92} unoptimized /> : <span className="music-cover">Y</span>}
      <div className="music-details">{presence.url ? <a href={presence.url} target="_blank" rel="noreferrer">{details}</a> : details}<div className="music-progress" aria-label={`${text.progress}: ${formatDuration(elapsed)} / ${formatDuration(durationMs)}`}><i><b style={{ width: `${progress}%` }} /></i><span>{formatDuration(elapsed)} / {formatDuration(durationMs)}</span></div></div>
    </div>
  </aside>;
}

function MarkdownInline({ article, text }: { article: Article; text: string }) {
  const redacted = article.redacted.map((value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const tokens = [redacted.length ? redacted.join("|") : "(?!)", "!\\[[^\]]*\\]\\([^\s)]+(?:\\s+\\\"[^\"]*\\\")?\\)", "\\[[^\]]+\\]\\([^\s)]+\\)", "\\*\\*[^*]+\\*\\*", "~~[^~]+~~", "(?<!\\*)\\*[^*]+\\*(?!\\*)", "(?<!_)_[^_]+_(?!_)", "`[^`]+`"].join("|");
  return <>{text.split(new RegExp(`(${tokens})`, "g")).map((part, index) => {
    const hidden = article.redacted.find((value) => part.includes(value));
    if (hidden) return <mark key={index}>{hidden}</mark>;
    const image = part.match(/^!\[([^\]]*)\]\(([^\s)]+)(?:\s+\"[^\"]*\")?\)$/);
    if (image) return <Image key={index} src={image[2]} alt={image[1]} width={1200} height={675} unoptimized />;
    const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
    if (link) return <a key={index} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    if (part.startsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("~~")) return <del key={index}>{part.slice(2, -2)}</del>;
    if (part.startsWith("*") || part.startsWith("_")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return part;
  })}</>;
}

function MarkdownTable({ article, lines }: { article: Article; lines: string[] }) {
  const cells = (line: string) => line.trim().replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
  const header = cells(lines[0]);
  const rows = lines.slice(2).map(cells);
  return <div className="markdown-table-wrap"><table><thead><tr>{header.map((cell, index) => <th key={index}><MarkdownInline article={article} text={cell} /></th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}><MarkdownInline article={article} text={cell} /></td>)}</tr>)}</tbody></table></div>;
}

function MarkdownBody({ article }: { article: Article }) {
  return <>{article.content.split(/\r?\n\s*\r?\n/).map((block, index) => {
    if (block.startsWith("```")) return <pre key={index}><code>{block.replace(/^```[^\n]*\n?|\n?```$/g, "")}</code></pre>;
    if (/^---+\s*$/.test(block)) return <hr key={index} />;
    const heading = block.match(/^(#{1,6})\s+(.+)$/);
    if (heading) { const Tag = `h${heading[1].length}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"; return <Tag key={index}><MarkdownInline article={article} text={heading[2]} /></Tag>; }
    const list = block.split(/\r?\n/);
    if (list[0]?.startsWith("> ")) return <blockquote key={index}>{list.map((line, lineIndex) => <p key={lineIndex}><MarkdownInline article={article} text={line.replace(/^>\s?/, "")} /></p>)}</blockquote>;
    if (list.length > 1 && /^\|.+\|$/.test(list[0]) && /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(list[1])) return <MarkdownTable key={index} article={article} lines={list} />;
    if (list.every((line) => /^[-*]\s+\[[ xX]\]\s+/.test(line))) return <ul className="task-list" key={index}>{list.map((line, lineIndex) => { const task = line.match(/^[-*]\s+\[([ xX])\]\s+(.+)$/); return <li key={`${index}-${lineIndex}`}><input type="checkbox" checked={task?.[1].toLowerCase() === "x"} readOnly /><MarkdownInline article={article} text={task?.[2] ?? line} /></li>; })}</ul>;
    if (list.every((line) => /^[-*]\s+/.test(line))) return <ul key={index}>{list.map((line, lineIndex) => <li key={`${index}-${lineIndex}`}><MarkdownInline article={article} text={line.replace(/^[-*]\s+/, "")} /></li>)}</ul>;
    if (list.every((line) => /^\d+\.\s+/.test(line))) return <ol key={index}>{list.map((line, lineIndex) => <li key={`${index}-${lineIndex}`}><MarkdownInline article={article} text={line.replace(/^\d+\.\s+/, "")} /></li>)}</ol>;
    return <p key={index}><MarkdownInline article={article} text={block.replace(/\r?\n/g, " ")} /></p>;
  })}</>;
}

function formatClock(date: Date, language: Language) {
  const locales: Record<Language, string> = { en: "en-GB", ru: "ru-RU", ko: "ko-KR" };
  return new Intl.DateTimeFormat(locales[language], {
    timeZone: "Asia/Seoul",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date).replace(" г.", "");
}

export function TerminalBlog({ articlesByLanguage, initialProjects = [] }: { articlesByLanguage: Record<Language, Article[]>; initialProjects?: Project[] }) {
  const language = useSyncExternalStore<Language | null>(subscribeToLanguage, readStoredLanguage, (): null => null);
  const activeLanguage = language ?? "en";
  const [booted, setBooted] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState<string[]>([ui.en.sessionReady]);
  const [activeArticle, setActiveArticle] = useState<string | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [miyabiChatOpen, setMiyabiChatOpen] = useState(false);
  const [fullscreenTerminalOpen, setFullscreenTerminalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [matrixActive, setMatrixActive] = useState(false);
  const [sfxActive, setSfxActive] = useState(() => isSoundEnabled());
  const [projectFilter, setProjectFilter] = useState<"all" | "ai" | "web" | "python" | "ts">("all");
  const [projectSearch, setProjectSearch] = useState("");
  const [selectedTechFilter, setSelectedTechFilter] = useState<string | null>(null);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [readingProgress, setReadingProgress] = useState(0);
  const [terminalMode, setTerminalMode] = useState<"shell" | "miyabi" | "store" | "admin">("shell");
  const [clock, setClock] = useState(() => new Date());
  const [miyabiArt, setMiyabiArt] = useState<AnsiChunk[]>([]);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const reader = useRef<HTMLDivElement>(null);
  const terminalInput = useRef<HTMLInputElement>(null);
  const fullscreenTerminalInput = useRef<HTMLInputElement>(null);
  const artViewport = useRef<HTMLDivElement>(null);
  const artPre = useRef<HTMLPreElement>(null);
  const [artScale, setArtScale] = useState(0);
  const text = ui[activeLanguage];
  const { hobbies, stackGroups } = getPortfolio(activeLanguage);
  const terminalCommands = getTerminalCommands(activeLanguage);
  const articles = articlesByLanguage[activeLanguage];
  const selectedArticle = articles.find((article) => article.id === activeArticle);

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) return;
    let alive = true;
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (alive && Array.isArray(data) && data.length > 0) setProjects(data);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [initialProjects]);


  useEffect(() => {
    if (language) document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!language || booted) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setBooted(true), reducedMotion ? 0 : 950);
    return () => window.clearTimeout(timer);
  }, [booted, language]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/miyabi.txt").then((response) => {
      if (!response.ok) throw new Error(`Unable to load Miyabi art: ${response.status}`);
      return response.text();
    }).then((source) => {
      if (alive) setMiyabiArt(parseAnsiArt(source));
    }).catch(() => { if (alive) setMiyabiArt([{ text: "Miyabi art is unavailable." }]); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const viewport = artViewport.current;
    const art = artPre.current;
    if (!viewport || !art || !miyabiArt.length) return;
    const fitArt = () => {
      const scale = Math.min(viewport.clientWidth / art.offsetWidth, viewport.clientHeight / art.offsetHeight) * 1.5;
      setArtScale(Number(scale.toFixed(3)));
    };
    fitArt();
    const observer = new ResizeObserver(fitArt);
    observer.observe(viewport);
    document.fonts?.ready.then(fitArt);
    return () => observer.disconnect();
  }, [miyabiArt]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && (event.key === "/" || event.code === "Slash")) {
        event.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setFullscreenTerminalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!fullscreenTerminalOpen) return;
    document.body.classList.add("reader-open");
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenTerminalOpen(false);
      }
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.classList.remove("reader-open");
      window.removeEventListener("keydown", escape);
    };
  }, [fullscreenTerminalOpen]);

  useEffect(() => {
    if (fullscreenTerminalOpen && terminalMode === "shell") {
      const timer = setTimeout(() => fullscreenTerminalInput.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [fullscreenTerminalOpen, terminalMode]);

  useEffect(() => {
    if (!activeArticle && !archiveOpen) return;
    document.body.classList.add("reader-open");
    reader.current?.scrollTo({ top: 0 });

    const handleScroll = () => {
      const el = reader.current;
      if (!el) return;
      const total = el.scrollHeight - el.clientHeight;
      if (total > 0) {
        setReadingProgress(Math.min(100, (el.scrollTop / total) * 100));
      }
    };

    const readerEl = reader.current;
    readerEl?.addEventListener("scroll", handleScroll);

    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activeArticle) setActiveArticle(null);
      else setArchiveOpen(false);
    };
    window.addEventListener("keydown", escape);
    return () => {
      document.body.classList.remove("reader-open");
      readerEl?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", escape);
    };
  }, [activeArticle, archiveOpen]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openArticle = (id: string) => {
    playSuccessSound();
    setActiveArticle(id);
  };
  const changeLanguage = (nextLanguage: Language) => {
    playBeepSound(700, 0.04);
    saveLanguage(nextLanguage);
    setLines([ui[nextLanguage].sessionReady]);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    playKeyClickSound();
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIndex < cmdHistory.length - 1 ? historyIndex + 1 : historyIndex;
      setHistoryIndex(nextIdx);
      setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIdx] || "");
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const current = input.trim().toLowerCase();
      if (!current) return;
      const match = terminalCommands.find(
        (c) => c.name.startsWith(current) || c.aliases?.some((a) => a.startsWith(current))
      );
      if (match) {
        setInput(match.name);
        playBeepSound(650, 0.04);
      }
    }
  };

  const execute = async (raw: string) => {
    const inputStr = raw.trim();
    const [commandName = ""] = inputStr.split(/\s+/, 1);
    const command = commandName.toLowerCase();
    const argument = inputStr.slice(commandName.length).trim();
    if (!command) return;

    if (command === "matrix") {
      setMatrixActive((prev) => !prev);
      playSuccessSound();
      setLines((old) => [...old, `> ${command}`, "[OK] Matrix Digital Rain background toggled."]);
      return;
    }
    if (command === "sfx" || command === "sound") {
      const next = toggleSound();
      setSfxActive(next);
      setLines((old) => [...old, `> ${command}`, `[OK] Audio SFX engine ${next ? "enabled" : "disabled"}.`]);
      return;
    }
    if (command === "quote" || command === "motto") {
      const quotes = [
        '"Talk is cheap. Show me the code." — Linus Torvalds',
        '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
        '"The secret of getting ahead is getting started." — Mark Twain',
        '"Make it work, make it right, make it fast." — Kent Beck',
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      setLines((old) => [...old, `> ${command}`, q]);
      playBeepSound(720, 0.05);
      return;
    }
    if (command === "stats") {
      setLines((old) => [
        ...old,
        `> ${command}`,
        "--- MKH_LOG LAB STATUS ---",
        "OS: Web/Linux Self-Hosted",
        "Stack: Next.js 16 · React 19 · TypeScript 5.9",
        "Local AI Engine: Ollama / LM Studio / MiniMax / OpenRouter",
        "Uptime: 99.98% · Status: Active",
      ]);
      playBeepSound(800, 0.05);
      return;
    }

    const definition = terminalCommands.find((item) => item.name === command || item.aliases?.includes(command));
    if (!definition) {
      setLines((old) => [...old, `> ${command}`, text.commandNotFound]);
      playBeepSound(300, 0.08);
      return;
    }

    playSuccessSound();

    if (definition.action === "clear") { setLines([]); return; }
    if (definition.action === "help") {
      setLines((old) => [
        ...old,
        `> ${command}`,
        ...terminalCommands.map(({ name, description }) => `${name.padEnd(12, " ")} ${description}`),
        "matrix       toggle digital rain overlay",
        "sfx          toggle sound effects",
        "quote        random lab developer quote",
        "stats        show system & lab status",
      ]);
      return;
    }
    if (definition.action === "github") { window.open("https://github.com/mikhailfur", "_blank", "noopener,noreferrer"); setLines((old) => [...old, `> ${command}`, text.openingGithub]); return; }
    if (definition.action === "archive") { setArchiveOpen(true); setLines((old) => [...old, `> ${command}`, text.openedArchive]); return; }
    if (definition.action === "miyabi") {
      setTerminalMode("miyabi");
      setLines((old) => [...old, `> ${command}`, "[OK] Switched to Hoshimi Miyabi Terminal AI session."]);
      go("terminal");
      return;
    }
    if (definition.action === "store") {
      setTerminalMode("store");
      setLines((old) => [...old, `> ${command}`, "[OK] Switched to store catalog."]);
      go("terminal");
      return;
    }
    if (definition.action === "admin") {
      setTerminalMode("admin");
      setLines((old) => [...old, `> ${command}`, "[OK] Switched to Admin Panel (Telegram Auth)."]);
      go("terminal");
      return;
    }
    if (definition.action === "message") {
      if (!argument) { setLines((old) => [...old, `> ${command}`, text.messageUsage]); return; }
      setLines((old) => [...old, `> ${inputStr}`, text.messageSending]);
      try {
        const response = await fetch("/api/message", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: argument }) });
        if (!response.ok) throw new Error("Message delivery failed.");
        setLines((old) => [...old, text.messageSent]);
      } catch {
        setLines((old) => [...old, text.messageFailed]);
      }
      return;
    }
    const target = definition.action === "hobbies" ? "about" : definition.action;
    go(target);
    const messages: Partial<Record<TerminalCommand["action"], string>> = { about: text.openedProfile, hobbies: text.openedHobbies, projects: text.openedProjects, stack: text.openedStack, gallery: text.openedGallery };
    setLines((old) => [...old, `> ${command}`, messages[definition.action] ?? text.openedProfile]);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (input.trim()) {
      setCmdHistory((prev) => [...prev, input.trim()]);
      setHistoryIndex(-1);
    }
    void execute(input);
    setInput("");
  };

  const preloader = <div className="boot-loader" role="status" aria-label="Loading portfolio">
      <div className="boot-terminal">
        <div className="boot-terminal-bar"><span className="terminal-frame-controls" aria-hidden="true"><i /><i /><i /></span><span>mikhailfur@lab: ~</span></div>
        <div className="boot-terminal-body">
          <p className="boot-line"><span className="prompt">mikhailfur@lab:<b>~</b>$</span> restore --session</p>
          <p className="boot-line">[ok] preferences loaded</p>
          <p className="boot-line">[ok] locale restored: {language?.toUpperCase() ?? "..."}</p>
          <p className="boot-line boot-cursor">launching portfolio</p>
        </div>
      </div>
    </div>;

  if (!booted) return <main>{preloader}</main>;

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      !projectSearch ||
      project.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      project.description.toLowerCase().includes(projectSearch.toLowerCase()) ||
      project.stack.some((s) => s.toLowerCase().includes(projectSearch.toLowerCase()));

    const matchesTech =
      !selectedTechFilter ||
      project.stack.some((s) => s.toLowerCase() === selectedTechFilter.toLowerCase());

    let matchesCategory = true;
    if (projectFilter === "ai") {
      matchesCategory = project.stack.some((s) =>
        ["ai", "sdxl", "llm", "lm studio", "openrouter", "ollama", "minimax"].includes(s.toLowerCase())
      );
    } else if (projectFilter === "web") {
      matchesCategory = project.stack.some((s) =>
        ["next.js", "react", "typescript", "javascript", "tailwind", "html5"].includes(s.toLowerCase())
      );
    } else if (projectFilter === "python") {
      matchesCategory = project.stack.some((s) => s.toLowerCase() === "python");
    } else if (projectFilter === "ts") {
      matchesCategory = project.stack.some((s) => s.toLowerCase() === "typescript");
    }

    return matchesSearch && matchesTech && matchesCategory;
  });

  return <main style={{ position: "relative" }}>
    <CyberMatrixBackground matrixActive={matrixActive} />

    <nav className="topbar" aria-label={text.mainNavigation}>
      <a href="#home" className="brand"><span className="brand-mark">&gt;_</span> mikhail_fur</a>
      <span className="top-status">
        <Icon name="clock" size={14} /> 
        <span className="full-clock">{formatClock(clock, activeLanguage)}</span>
        <span className="mobile-clock">{clock.toLocaleTimeString([], { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit", hour12: false })}</span>
        <b>KST</b>
      </span>
      <div className="topbar-right">
        <button
          type="button"
          className="cmd-trigger-btn"
          onClick={() => {
            playBeepSound(750, 0.04);
            setCommandPaletteOpen(true);
          }}
          title="Command Palette (Ctrl + /)"
        >
          <span>Ctrl /</span> Palette
        </button>
        <div className="language-switcher" aria-label={text.language}>{(["en", "ru", "ko"] as Language[]).map((item) => <button key={item} type="button" onClick={() => changeLanguage(item)} aria-pressed={activeLanguage === item}>{item.toUpperCase()}</button>)}</div>
      </div>
    </nav>

    <section id="home" className="shell hero">
      <TerminalFrame title="mikhail_fur" actions={<nav className="window-nav" aria-label={text.sectionNavigation}><a href="#projects">{text.projects}</a><a href="#gallery">{text.gallery}</a><a href="#stack">{text.stack}</a><a href="#about">{text.profile}</a></nav>}>
        <div className="hero-grid">
          <div>
            <p className="command-line"><Prompt>whoami</Prompt></p>
            <h1 dangerouslySetInnerHTML={{ __html: text.whoamiTitle }} />
            <p className="hero-copy">{text.heroCopy}</p>
            <div className="hero-actions">
              <a href="#projects" className="button button-primary" onClick={() => playBeepSound()}><Icon name="arrow" size={15} /> {text.viewProjects}</a>
              <a href="https://github.com/mikhailfur" target="_blank" rel="noreferrer" className="button" onClick={() => playBeepSound()}><Icon name="github" size={15} /> GitHub</a>
            </div>
          </div>
          <figure className="miyabi-art" ref={artViewport} aria-label={text.miyabiArt}><pre ref={artPre} style={{ opacity: miyabiArt.length ? 1 : 0, transform: `translate(-5%, -12%) scale(${artScale || 1})` }}>{miyabiArt.map((chunk, index) => <span key={index} style={chunk.color ? { color: chunk.color } : undefined}>{chunk.text}</span>)}</pre></figure>
        </div>
        <div className="hero-utility">
          <div className="hero-contacts">
            <span className="utility-label">{text.contacts}</span>
            <div className="contact-list">{contacts.map((contact) => contact.value ? <a href={contact.value} target="_blank" rel="noreferrer" key={contact.label} onClick={() => playKeyClickSound()}><span><Icon name={contactIcons[contact.label]} size={13} /></span>{contact.label}<Icon name="arrow" size={14} /></a> : <span key={contact.label} className="contact-offline"><span><Icon name={contactIcons[contact.label]} size={13} /></span>{contact.label}<small>{text.offline}</small></span>)}</div>
          </div>
          <MusicStatus text={text} />
        </div>
      </TerminalFrame>
    </section>

    <section id="projects" className="shell">
      <TerminalFrame title={text.projects}>
        <header className="section-head">
          <div><span className="section-icon"><Icon name="box" /></span><h2>{text.projects}</h2></div>
          <p>{text.projectsDescription}</p>
        </header>

        <div className="project-toolbar">
          <div className="project-search-box">
            <Icon name="command" size={12} />
            <input
              type="text"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
              placeholder="Search projects or tech..."
            />
            {projectSearch && (
              <button
                type="button"
                style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer", fontSize: "10px" }}
                onClick={() => setProjectSearch("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="project-filter-pills">
            {(["all", "ai", "web", "python", "ts"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`project-pill ${projectFilter === cat && !selectedTechFilter ? "active" : ""}`}
                onClick={() => {
                  playBeepSound(600, 0.03);
                  setSelectedTechFilter(null);
                  setProjectFilter(cat);
                }}
              >
                {cat === "all" ? "ALL" : cat === "ai" ? "AI & LLM" : cat === "web" ? "WEB" : cat.toUpperCase()}
              </button>
            ))}
            {selectedTechFilter && (
              <button
                type="button"
                className="project-pill active"
                onClick={() => setSelectedTechFilter(null)}
                title="Clear tech filter"
              >
                🏷️ {selectedTechFilter} ✕
              </button>
            )}
          </div>
        </div>

        <div className="project-list">
          {filteredProjects.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
              No projects found matching filter criteria.
            </div>
          ) : (
            filteredProjects.map((project, index) => (
              <a
                className="project-row"
                href={project.url}
                target="_blank"
                rel="noreferrer"
                key={project.name}
                onMouseEnter={() => playKeyClickSound()}
              >
                <span className="project-index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <div className="tag-list">
                    {project.stack.map((tag) => (
                      <small key={tag}>{tag}</small>
                    ))}
                  </div>
                </div>
                <span className={`status ${project.status}`}>{project.status}</span>
                <Icon name="arrow" />
              </a>
            ))
          )}
        </div>
        <a className="all-link" href="https://github.com/mikhailfur?tab=repositories" target="_blank" rel="noreferrer">{text.allRepositories} <Icon name="arrow" size={15} /></a>
      </TerminalFrame>
    </section>

    <GallerySection language={activeLanguage} />

    <section id="stack" className="shell">
      <TerminalFrame title={text.stack}>
        <header className="section-head"><div><span className="section-icon"><Icon name="layers" /></span><h2>{text.stack}</h2></div><p>{text.stackDescription}</p></header>
        <div className="stack-list">
          {stackGroups.map((group) => (
            <div className="stack-row" key={group.name}>
              <h3>{group.name}</h3>
              <div className="stack-items">
                {group.items.map((item) => (
                  <div
                    key={item}
                    onClick={() => {
                      playBeepSound(700, 0.04);
                      setSelectedTechFilter(item);
                      setProjectFilter("all");
                      go("projects");
                    }}
                    style={{ cursor: "pointer" }}
                    title={`Click to filter projects by ${item}`}
                  >
                    <TechBadge name={item} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TerminalFrame>
    </section>

    <section id="notes" className="shell">
      <TerminalFrame title={text.notes}>
        <header className="section-head"><div><span className="section-icon"><Icon name="archive" /></span><h2>{text.notes}</h2></div><p>{text.notesDescription}</p></header>
        <div className="notes-list">{articles.slice(0, 3).map((article) => <button className="note-row" key={article.id} onClick={() => openArticle(article.id)}><span>{article.id}</span><div><small>{article.type} · {article.date}</small><h3>{article.title}</h3><p>{article.excerpt}</p></div><Icon name="arrow" /></button>)}</div>
        {articles.length > 0 && <button type="button" className="all-link archive-link" onClick={() => { playBeepSound(); setArchiveOpen(true); }}>{text.allNotes} <Icon name="arrow" size={15} /></button>}
      </TerminalFrame>
    </section>

    <section id="about" className="shell about-section">
      <TerminalFrame title={text.profile}>
        <header className="section-head"><div><span className="section-icon"><Icon name="user" /></span><h2>{text.profile}</h2></div><p>{text.profileDescription}</p></header>
        <div className="about-grid"><p className="about-copy">{text.profileCopy}</p><div className="interests">{hobbies.map((hobby) => <div key={hobby.number}><span>{hobby.number}</span><h3>{hobby.title}</h3><p>{hobby.description}</p></div>)}</div></div>
      </TerminalFrame>
    </section>

    <section id="terminal" className="shell terminal-section">
      <TerminalFrame title={text.terminal}>
        <header className="section-head">
          <div><span className="section-icon"><Icon name="command" /></span><h2>{text.terminal}</h2></div>
          <p>{text.terminalDescription} <kbd>Ctrl K</kbd> {text.terminalHint}</p>
        </header>

        <div className="terminal">
          <div className="panel-head">
            <div className="terminal-tab-group">
              <button
                type="button"
                className={`terminal-tab-btn ${terminalMode === "shell" ? "active" : ""}`}
                onClick={() => { playBeepSound(); setTerminalMode("shell"); }}
              >
                <i /> SHELL
              </button>
              <button
                type="button"
                className={`terminal-tab-btn ${terminalMode === "miyabi" ? "active" : ""}`}
                onClick={() => { playBeepSound(); setTerminalMode("miyabi"); }}
              >
                &gt;_ MIYABI AI CLI
              </button>
              <button
                type="button"
                className={`terminal-tab-btn ${terminalMode === "store" ? "active" : ""}`}
                onClick={() => { playBeepSound(); setTerminalMode("store"); }}
              >
                <Icon name="store" size={13} /> STORE
              </button>
              {terminalMode === "admin" && (
                <button
                  type="button"
                  className="terminal-tab-btn active"
                  onClick={() => setTerminalMode("admin")}
                >
                  <Icon name="shield" size={13} /> ADMIN
                </button>
              )}
            </div>
            <div className="panel-head-actions">
              <button
                type="button"
                className="terminal-fullscreen-trigger"
                onClick={() => { playBeepSound(); setFullscreenTerminalOpen(true); }}
                title="Ctrl + K"
              >
                <Icon name="command" size={12} />
                <span>{text.terminalFullscreen || "Fullscreen"}</span>
                <kbd>Ctrl K</kbd>
              </button>
              <span className="terminal-status-tag">{text.connected}</span>
            </div>
          </div>

          {terminalMode === "shell" ? (
            <>
              <div className="terminal-log" aria-live="polite">
                {lines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
              </div>
              <form onSubmit={submit}>
                <Prompt>
                  <input
                    ref={terminalInput}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={handleInputKeyDown}
                    aria-label={text.terminalLabel}
                    placeholder={text.terminalPlaceholder}
                    autoComplete="off"
                  />
                </Prompt>
              </form>
              <div className="quick-actions">
                {terminalCommands.filter((command) => command.quick).map((command) => (
                  <button
                    key={command.name}
                    type="button"
                    onClick={() => {
                      playBeepSound();
                      if (command.action === "miyabi") {
                        setTerminalMode("miyabi");
                      } else if (command.action === "store") {
                        setTerminalMode("store");
                      } else if (command.action === "admin") {
                        setTerminalMode("admin");
                      } else {
                        setInput(command.name === "message" ? "message " : command.name);
                        terminalInput.current?.focus();
                      }
                    }}
                  >
                    {command.name}
                  </button>
                ))}
              </div>
            </>
          ) : terminalMode === "miyabi" ? (
            <MiyabiChatModal embedded />
          ) : terminalMode === "store" ? (
            <StoreModal embedded />
          ) : (
            <AdminModal embedded />
          )}
        </div>
      </TerminalFrame>
    </section>

    <footer className="site-footer"><span><span className="brand-mark">&gt;_</span> mikhail_fur</span><span>Next.js · TypeScript · {text.footer}</span><a href="#home" onClick={() => playBeepSound()}>{text.backToTop}</a></footer>

      {archiveOpen && <div className="article-reader" ref={reader} role="dialog" aria-modal="true" aria-label={text.notesArchive} onMouseDown={(event) => { if (event.target === event.currentTarget) setArchiveOpen(false); }}>
        <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
        <button className="reader-close" onClick={() => setArchiveOpen(false)}>{text.close} <span>Esc</span></button>
        <section className="archive-sheet"><header><span>{text.archive.toUpperCase()}</span><span>{articles.length} {text.files.toUpperCase()}</span></header><p className="reader-path">/archive</p><h1>{text.allNotesTitle}</h1><p>{text.archiveDescription}</p><div className="notes-list">{articles.map((article) => <button className="note-row" key={article.id} onClick={() => { setArchiveOpen(false); openArticle(article.id); }}><span>{article.id}</span><div><small>{article.type} · {article.date}</small><h3>{article.title}</h3><p>{article.excerpt}</p></div><Icon name="arrow" /></button>)}</div></section>
      </div>}
       {selectedArticle && <div className="article-reader document-reader" ref={reader} role="dialog" aria-modal="true" aria-label={`${text.note}: ${selectedArticle.title}`} onMouseDown={(event) => { if (event.target === event.currentTarget) setActiveArticle(null); }}>
       <div className="reading-progress-bar" style={{ width: `${readingProgress}%` }} />
       <button className="reader-close" onClick={() => setActiveArticle(null)}>{text.close} <span>Esc</span></button>
         <article className="reader-sheet document-page"><header><span>{selectedArticle.type}</span><span>{selectedArticle.id}</span></header><p className="reader-path">/archive/{selectedArticle.id}</p><h1>{selectedArticle.title}</h1><p className="reader-lead">{selectedArticle.excerpt}</p><div className="reader-meta"><span>{selectedArticle.date}</span><span>{text.publicNote.toUpperCase()}</span></div><div className="reader-body"><MarkdownBody article={selectedArticle} /></div><footer className="document-footer"><span>mikhailfur | {selectedArticle.id}</span></footer></article>
      </div>}
       {miyabiChatOpen && <MiyabiChatModal onClose={() => setMiyabiChatOpen(false)} />}
       {fullscreenTerminalOpen && (
         <div
           className="fullscreen-terminal-overlay"
           role="dialog"
           aria-modal="true"
           aria-label={`${text.terminal} & ${text.miyabiTitle}`}
           onMouseDown={(e) => {
             if (e.target === e.currentTarget) setFullscreenTerminalOpen(false);
           }}
         >
           <div className="fullscreen-terminal-window">
             <header className="fullscreen-terminal-header">
               <div className="fullscreen-terminal-left">
                 <span className="terminal-frame-controls" aria-hidden="true">
                   <i />
                   <i />
                   <i />
                 </span>
                 <div className="fullscreen-terminal-title">
                   <span>mikhail_fur :: terminal</span>
                 </div>
               </div>

               <div className="terminal-tab-group">
                 <button
                   type="button"
                   className={`terminal-tab-btn ${terminalMode === "shell" ? "active" : ""}`}
                   onClick={() => { playBeepSound(); setTerminalMode("shell"); }}
                 >
                   <i /> SHELL
                 </button>
                 <button
                   type="button"
                   className={`terminal-tab-btn ${terminalMode === "miyabi" ? "active" : ""}`}
                   onClick={() => { playBeepSound(); setTerminalMode("miyabi"); }}
                 >
                   &gt;_ MIYABI AI CLI
                 </button>
                 <button
                   type="button"
                   className={`terminal-tab-btn ${terminalMode === "store" ? "active" : ""}`}
                   onClick={() => { playBeepSound(); setTerminalMode("store"); }}
                 >
                   <Icon name="store" size={13} /> STORE
                 </button>
                 {terminalMode === "admin" && (
                   <button
                     type="button"
                     className="terminal-tab-btn active"
                     onClick={() => setTerminalMode("admin")}
                   >
                     <Icon name="shield" size={13} /> ADMIN
                   </button>
                 )}
               </div>

               <div className="fullscreen-terminal-right">
                 <span className="fullscreen-terminal-kbd">
                  <kbd>Ctrl</kbd> + <kbd>K</kbd>
                </span>
                 <button
                   type="button"
                   className="fullscreen-close-btn"
                   onClick={() => setFullscreenTerminalOpen(false)}
                   title="Close (Esc)"
                 >
                   {text.close} <span>Esc</span>
                 </button>
               </div>
             </header>

             <div className="fullscreen-terminal-content">
               {terminalMode === "shell" ? (
                 <div className="fullscreen-shell-body">
                   <div className="fullscreen-terminal-log" aria-live="polite">
                     {lines.map((line, index) => (
                       <p key={`${line}-${index}`}>{line}</p>
                     ))}
                   </div>

                   <form onSubmit={submit} className="fullscreen-terminal-form">
                     <Prompt>
                       <input
                         ref={fullscreenTerminalInput}
                         value={input}
                         onChange={(event) => setInput(event.target.value)}
                         onKeyDown={handleInputKeyDown}
                         aria-label={text.terminalLabel}
                         placeholder={text.terminalPlaceholder}
                         autoComplete="off"
                       />
                     </Prompt>
                   </form>

                   <div className="fullscreen-quick-actions">
                     {terminalCommands
                       .filter((command) => command.quick)
                       .map((command) => (
                         <button
                           key={command.name}
                           type="button"
                           onClick={() => {
                             playBeepSound();
                             if (command.action === "miyabi") {
                               setTerminalMode("miyabi");
                             } else if (command.action === "store") {
                               setTerminalMode("store");
                             } else if (command.action === "admin") {
                               setTerminalMode("admin");
                             } else {
                               setInput(command.name === "message" ? "message " : command.name);
                               fullscreenTerminalInput.current?.focus();
                             }
                           }}
                         >
                           {command.name}
                         </button>
                       ))}
                   </div>
                 </div>
               ) : terminalMode === "miyabi" ? (
                 <MiyabiChatModal embedded />
               ) : terminalMode === "store" ? (
                 <StoreModal embedded />
               ) : (
                 <AdminModal embedded />
               )}
             </div>
           </div>
         </div>
       )}

    <CommandPalette
      isOpen={commandPaletteOpen}
      onClose={() => setCommandPaletteOpen(false)}
      onNavigate={go}
      onToggleMatrix={() => setMatrixActive((prev) => !prev)}
      onToggleSfx={() => {
        const next = toggleSound();
        setSfxActive(next);
      }}
      sfxActive={sfxActive}
      matrixActive={matrixActive}
      onSwitchTerminalMode={(mode) => setTerminalMode(mode)}
      onOpenArchive={() => setArchiveOpen(true)}
    />
  </main>;
}

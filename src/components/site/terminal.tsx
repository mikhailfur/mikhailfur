"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCopy, useLanguage } from "@/lib/i18n";
import { getTerminalCommands } from "@/data/site";
import type { Language, TerminalAction, TerminalCommand } from "@/types/portfolio";
import { playKeyClickSound } from "@/utils/sfx";
import type { ArcadeTab } from "@/components/site/play";

const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";

type Line = {
  id: number;
  text: string;
  tone?: "muted" | "accent" | "error";
  href?: string;
};

let lineId = 0;

function line(text: string, tone?: Line["tone"], href?: string): Line {
  lineId += 1;
  return { id: lineId, text, tone, href };
}

export function Terminal({
  onGoTo,
  onOpenArchive,
  onOpenMiyabi,
  onOpenArcade,
}: {
  onGoTo: (id: string) => void;
  onOpenArchive: () => void;
  onOpenMiyabi: () => void;
  onOpenArcade: (tab: ArcadeTab) => void;
}) {
  const copy = useCopy();
  const { language, setLanguage } = useLanguage();
  const router = useRouter();
  const commands = useMemo(() => getTerminalCommands(language), [language]);
  const [lines, setLines] = useState<Line[]>(() => [
    line(copy.terminal.welcome, "muted"),
    line(`${copy.terminal.help} ${commands.map((command) => command.name).join(" · ")}`, "muted"),
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines]);

  const push = (entries: Line[]) => setLines((current) => [...current, ...entries]);

  const findCommand = (name: string) =>
    commands.find((command) => command.name === name || command.aliases?.includes(name));

  const handleCommand = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const [name, ...rest] = trimmed.split(/\s+/);
    const argument = rest.join(" ");
    const command = findCommand(name.toLowerCase());

    playKeyClickSound();
    setHistory((current) => [trimmed, ...current].slice(0, 30));
    setHistoryIndex(-1);
    push([line(`${copy.terminal.prompt} ~ % ${trimmed}`, "accent")]);

    if (!command) {
      push([line(copy.terminal.notFound, "error")]);
      return;
    }

    const payload = argument;
    const action: TerminalAction = command.action;

    switch (action) {
      case "help":
        push(commandCatalog(commands, copy.terminal.help));
        break;
      case "about":
        onGoTo("about");
        push([line(copy.terminal.openedProfile, "muted")]);
        break;
      case "hobbies":
        onGoTo("about");
        push([line(copy.terminal.openedProfile, "muted")]);
        break;
      case "stack":
        onGoTo("stack");
        push([line(copy.terminal.openedStack, "muted")]);
        break;
      case "projects":
        onGoTo("works");
        push([line(copy.terminal.openedProjects, "muted")]);
        break;
      case "archive":
        onOpenArchive();
        push([line(copy.terminal.openedArchive, "muted")]);
        break;
      case "gallery":
        onGoTo("gallery");
        push([line(copy.terminal.openedGallery, "muted")]);
        break;
      case "github":
        window.open(GITHUB, "_blank", "noopener,noreferrer");
        push([line(copy.terminal.openingGithub, "muted")]);
        break;
      case "miyabi":
        onOpenMiyabi();
        push([line(copy.terminal.openedMiyabi, "muted")]);
        break;
      case "arcade":
        onOpenArcade("snake");
        push([line(copy.terminal.openedArcade, "muted")]);
        break;
      case "snake":
        onOpenArcade("snake");
        push([line(copy.terminal.openedArcade, "muted")]);
        break;
      case "wallz":
        onOpenArcade("wallz");
        push([line(copy.terminal.openedArcade, "muted")]);
        break;
      case "chat":
        onOpenArcade("chat");
        push([line(copy.terminal.openedArcade, "muted")]);
        break;
      case "music":
        onGoTo("contact");
        push([line(copy.terminal.openedMusic, "muted")]);
        break;
      case "2fa":
        router.push("/2fa");
        break;
      case "lang": {
        const next = payload.trim().toLowerCase();
        if (next === "ru" || next === "en" || next === "ko") {
          setLanguage(next as Language);
          push([line(`${copy.terminal.langSwitched} (${next.toUpperCase()})`, "muted")]);
        } else {
          push([line(copy.terminal.langUsage, "muted")]);
        }
        break;
      }
      case "message": {
        if (!payload.trim()) {
          push([line(copy.terminal.messageUsage, "muted")]);
          break;
        }
        setBusy(true);
        push([line(copy.terminal.messageSending, "muted")]);
        try {
          const response = await fetch("/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: payload }),
          });
          push([
            line(
              response.ok ? copy.terminal.messageSent : copy.terminal.messageFailed,
              response.ok ? "accent" : "error",
            ),
          ]);
        } catch {
          push([line(copy.terminal.messageFailed, "error")]);
        } finally {
          setBusy(false);
        }
        break;
      }
      case "clear":
        setLines([line(copy.terminal.clear, "muted")]);
        break;
      default:
        push([line(copy.terminal.notFound, "error")]);
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const command = value;
    setValue("");
    await handleCommand(command);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = Math.min(history.length - 1, historyIndex + 1);
      setHistoryIndex(next);
      setValue(history[next]);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setValue("");
        return;
      }
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setValue(history[next]);
    } else if (event.key === "Tab") {
      const partial = value.trim();
      if (!partial) return;
      const matches = commands.filter((command) => command.name.startsWith(partial));
      if (matches.length === 1) {
        event.preventDefault();
        setValue(matches[0].name);
      }
    }
  };

  const run = (name: string) => {
    setValue("");
    void handleCommand(name);
    inputRef.current?.focus();
  };

  return (
    <section id="terminal" className="section section--tight section--night terminal-section">
      <div className="wrap">
        <div className="section-head">
          <div className="section-head__title">
            <span className="spine" aria-hidden="true">
              <span className="spine__kanji">{copy.terminal.label}</span>
              <span className="spine__reading">{copy.terminal.reading}</span>
            </span>
            <h2 className="section-title">{copy.terminal.title}</h2>
          </div>
          <p className="section-intro">{copy.terminal.intro}</p>
          <span className="section-aside">{copy.terminal.hint}</span>
        </div>

        <div className="terminal-shell" onClick={() => inputRef.current?.focus()}>
          <div className="terminal-bar">
            <span className="terminal-bar__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="terminal-bar__title">
              <span className="jp" aria-hidden="true">端末</span>
              {copy.terminal.prompt}: ~
            </span>
            <span>zsh · 80×24</span>
          </div>

          <div className="terminal-body" ref={logRef} aria-live="polite">
            {lines.map((entry) => (
              <p className={`terminal-line${entry.tone ? ` terminal-line--${entry.tone}` : ""}`} key={entry.id}>
                {entry.href ? (
                  <a href={entry.href} target="_blank" rel="noreferrer">
                    {entry.text}
                  </a>
                ) : (
                  entry.text
                )}
              </p>
            ))}
            {busy ? <p className="terminal-line terminal-line--muted">…</p> : null}
          </div>

          <form className="terminal-form" onSubmit={submit}>
            <label className="sr-only" htmlFor="terminal-input">
              {copy.terminal.title}
            </label>
            <span className="terminal-form__prompt" aria-hidden="true">
              {copy.terminal.prompt} ~ %
            </span>
            <input
              id="terminal-input"
              ref={inputRef}
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder={copy.terminal.placeholder}
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
            />
          </form>

          <div className="terminal-quick">
            {commands
              .filter((command) => command.quick)
              .map((command) => (
                <button key={command.name} type="button" onClick={() => run(command.name)}>
                  {command.name}
                </button>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function commandCatalog(commands: TerminalCommand[], label: string): Line[] {
  return [
    line(label, "muted"),
    ...commands.map((command) =>
      line(
        `  ${command.name.padEnd(10, " ")} ${command.description}`,
        command.quick ? "accent" : undefined,
      ),
    ),
  ];
}

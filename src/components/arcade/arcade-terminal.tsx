"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SnakeGame } from "./snake-game";
import type { ArcadeLanguage } from "./types";
import { WallzGame } from "./wallz-game";

export type ArcadeTab = "wallz" | "snake";

interface ArcadeTerminalProps {
  embedded?: boolean;
  initialTab?: ArcadeTab;
  onTabChange?: (tab: ArcadeTab) => void;
}

const labels = {
  en: { back: "portfolio", title: "MKH_ARCADE", subtitle: "Local retro games inside the terminal.", wallz: "WALLZ", snake: "SNAKE", online: "SYSTEM ONLINE" },
  ru: { back: "портфолио", title: "MKH_ARCADE", subtitle: "Локальные ретро-игры внутри терминала.", wallz: "WALLZ", snake: "ЗМЕЙКА", online: "СИСТЕМА В СЕТИ" },
  ko: { back: "포트폴리오", title: "MKH_ARCADE", subtitle: "터미널 내부의 로컬 레트로 게임입니다.", wallz: "WALLZ", snake: "스네이크", online: "시스템 온라인" },
} satisfies Record<ArcadeLanguage, Record<string, string>>;

const languageEvent = "mkh-arcade-language";

function readLanguage(): ArcadeLanguage {
  try {
    const saved = localStorage.getItem("terminal-blog.language");
    if (saved === "en" || saved === "ru" || saved === "ko") return saved;
  } catch {
    // Default locale fallback
  }
  return "en";
}

function subscribeLanguage(listener: () => void) {
  window.addEventListener(languageEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(languageEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

export function ArcadeTerminal({ embedded = false, initialTab = "wallz", onTabChange }: ArcadeTerminalProps) {
  const language = useSyncExternalStore<ArcadeLanguage>(subscribeLanguage, readLanguage, (): ArcadeLanguage => "en");
  const [tab, setTab] = useState<ArcadeTab>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setTab(initialTab);
  }
  const text = labels[language];

  useEffect(() => {
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  const changeLanguage = (next: ArcadeLanguage) => {
    try {
      localStorage.setItem("terminal-blog.language", next);
      window.dispatchEvent(new Event(languageEvent));
    } catch {
      // Ignore storage failures
    }
  };

  const handleTabSelect = (nextTab: ArcadeTab) => {
    setTab(nextTab);
    onTabChange?.(nextTab);
  };

  const body = (
    <>
      {!embedded && (
        <div className="arcade-intro">
          <div><p className="arcade-command"><span>mikhailfur@lab:~$</span> arcade --list</p><h1>{text.title}</h1></div>
          <p>{text.subtitle}</p>
        </div>
      )}
      <nav className="arcade-tabs" aria-label="Arcade processes">
        {(["wallz", "snake"] as const).map((item) => (
          <button
            type="button"
            key={item}
            className={tab === item ? "is-active" : ""}
            onClick={() => handleTabSelect(item)}
          >
            <span>{item === "wallz" ? "[01]" : "[02]"}</span>
            {text[item]}
          </button>
        ))}
      </nav>
      <div className="arcade-process">
        {tab === "wallz" ? <WallzGame language={language} /> : null}
        {tab === "snake" ? <SnakeGame language={language} /> : null}
      </div>
      <footer className="arcade-window-foot"><span>2 ARCADE PROCESSES</span><span>OFFLINE / LOCAL PLAY</span><span>v1.0.0</span></footer>
    </>
  );

  if (embedded) {
    return <div className="arcade-embedded-container">{body}</div>;
  }

  return (
    <main className="arcade-shell">
      <nav className="arcade-topbar" aria-label="Arcade navigation">
        <Link href="/" className="brand"><span className="brand-mark">&gt;_</span> mikhail_fur</Link>
        <span className="arcade-system-status"><i /> {text.online}</span>
        <div className="arcade-top-actions">
          <Link href="/">← {text.back}</Link>
          <div className="language-switcher">{(["en", "ru", "ko"] as const).map((item) => <button type="button" key={item} aria-pressed={language === item} onClick={() => changeLanguage(item)}>{item.toUpperCase()}</button>)}</div>
        </div>
      </nav>

      <section className="arcade-window">
        <header className="arcade-window-bar">
          <span className="terminal-frame-controls" aria-hidden="true"><i /><i /><i /></span>
          <span>mikhailfur@lab: ~/arcade</span>
          <span>PID {tab === "wallz" ? "2710" : "1987"}</span>
        </header>
        {body}
      </section>
    </main>
  );
}

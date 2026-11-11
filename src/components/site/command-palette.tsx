"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  FileText,
  FolderGit2,
  Gamepad2,
  Images,
  KeyRound,
  Languages,
  Mail,
  MessageCircle,
  NotebookText,
  Search,
  Terminal as TerminalIcon,
  Wrench,
} from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { languageNames, languageShort } from "@/data/site";
import { languages, type Language } from "@/types/portfolio";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { playKeyClickSound } from "@/utils/sfx";
import type { ArcadeTab } from "@/components/site/play";
import { SiteIcon, type SiteIconName } from "@/components/icons";

const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";
const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";
const DISCORD =
  process.env.NEXT_PUBLIC_DISCORD_URL || "https://discordapp.com/users/1029691592845578270";

function brandIcon(name: SiteIconName) {
  return function BrandGlyph(props: { width?: number; height?: number }) {
    return <SiteIcon name={name} {...props} />;
  };
}

const GitHubIcon = brandIcon("github");
const TelegramIcon = brandIcon("telegram");
const DiscordIcon = brandIcon("discord");

type PaletteItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ width?: number; height?: number }>;
  keywords?: string;
  run: () => void;
};

export function CommandPalette({
  open,
  onOpenChange,
  onGoTo,
  onOpenArchive,
  onOpenMiyabi,
  onOpenArcade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoTo: (id: string) => void;
  onOpenArchive: () => void;
  onOpenMiyabi: () => void;
  onOpenArcade: (tab: ArcadeTab) => void;
}) {
  const copy = useCopy();
  const { setLanguage } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const items = useMemo<PaletteItem[]>(() => {
    const sections = [
      { id: "about", label: copy.nav.about, hint: copy.about.title, icon: FileText },
      { id: "works", label: copy.nav.works, hint: copy.works.intro, icon: FolderGit2 },
      { id: "stack", label: copy.nav.stack, hint: copy.stack.intro, icon: Wrench },
      { id: "notes", label: copy.nav.notes, hint: copy.notes.intro, icon: NotebookText },
      { id: "gallery", label: copy.nav.gallery, hint: copy.gallery.intro, icon: Images },
      { id: "play", label: copy.nav.play, hint: copy.play.intro, icon: Gamepad2 },
      { id: "contact", label: copy.nav.contact, hint: copy.contact.copy, icon: Mail },
    ];

    const openers: PaletteItem[] = [
      {
        id: "archive",
        group: copy.notes.title,
        label: copy.notes.all,
        hint: copy.notes.archiveDescription,
        icon: FileText,
        run: onOpenArchive,
      },
      {
        id: "miyabi",
        group: copy.miyabi.title,
        label: copy.miyabi.open,
        hint: copy.miyabi.subtitle,
        icon: MessageCircle,
        run: onOpenMiyabi,
      },
      {
        id: "snake",
        group: copy.play.title,
        label: `${copy.play.open}: ${copy.play.items[0].title}`,
        hint: copy.play.items[0].description,
        icon: Gamepad2,
        run: () => onOpenArcade("snake"),
      },
      {
        id: "wallz",
        group: copy.play.title,
        label: `${copy.play.open}: ${copy.play.items[1].title}`,
        hint: copy.play.items[1].description,
        icon: Gamepad2,
        run: () => onOpenArcade("wallz"),
      },
      {
        id: "chat",
        group: copy.play.title,
        label: `${copy.play.open}: ${copy.play.items[2].title}`,
        hint: copy.play.items[2].description,
        icon: MessageCircle,
        run: () => onOpenArcade("chat"),
      },
      {
        id: "2fa",
        group: copy.play.twofa,
        label: copy.play.twofaOpen,
        hint: copy.play.twofaDescription,
        icon: KeyRound,
        run: () => router.push("/2fa"),
      },
      {
        id: "terminal",
        group: copy.terminal.title,
        label: copy.terminal.title,
        hint: copy.terminal.intro,
        icon: TerminalIcon,
        run: () => onGoTo("terminal"),
      },
    ];

    const links: PaletteItem[] = [
      {
        id: "github",
        group: "GitHub",
        label: "github.com/mikhailfur",
        hint: copy.works.all,
        icon: GitHubIcon,
        run: () => window.open(GITHUB, "_blank", "noopener,noreferrer"),
      },
      {
        id: "telegram",
        group: "Telegram",
        label: "@dataisnotfound",
        hint: copy.contact.telegram,
        icon: TelegramIcon,
        run: () => window.open(TELEGRAM, "_blank", "noopener,noreferrer"),
      },
      {
        id: "discord",
        group: "Discord",
        label: "mikhail_fur",
        hint: copy.contact.discord,
        icon: DiscordIcon,
        run: () => window.open(DISCORD, "_blank", "noopener,noreferrer"),
      },
    ];

    const languagesItems: PaletteItem[] = languages.map((item) => ({
      id: `lang-${item}`,
      group: copy.footer.language,
      label: languageNames[item],
      hint: languageShort[item],
      icon: Languages,
      keywords: `language язык 언어 ${languageShort[item]}`,
      run: () => setLanguage(item as Language),
    }));

    return [
      ...sections.map<PaletteItem>((section) => ({
        id: section.id,
        group: copy.nav.menu,
        label: section.label,
        hint: section.hint,
        icon: section.icon,
        keywords: section.id,
        run: () => onGoTo(section.id),
      })),
      ...openers,
      ...links,
      ...languagesItems,
    ];
  }, [copy, onGoTo, onOpenArchive, onOpenArcade, onOpenMiyabi, router, setLanguage]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((item) =>
      `${item.label} ${item.hint ?? ""} ${item.group} ${item.keywords ?? ""}`.toLowerCase().includes(term),
    );
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const execute = (item: PaletteItem) => {
    playKeyClickSound();
    onOpenChange(false);
    window.setTimeout(() => item.run(), 60);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => (filtered.length ? (index + 1) % filtered.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (filtered.length ? (index - 1 + filtered.length) % filtered.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = filtered[active];
      if (item) execute(item);
    }
  };

  const groups = useMemo(() => {
    const map = new Map<string, { item: PaletteItem; index: number }[]>();
    filtered.forEach((item, index) => {
      const list = map.get(item.group) ?? [];
      list.push({ item, index });
      map.set(item.group, list);
    });
    return [...map.entries()];
  }, [filtered]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="cmdk-overlay" />
        <DialogContent className="cmdk" aria-describedby={undefined} onKeyDown={onKeyDown}>
          <DialogTitle className="sr-only">{copy.palette.title}</DialogTitle>
          <div className="cmdk__top">
            <Search width={16} height={16} aria-hidden="true" />
            <input
              className="cmdk__input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.palette.placeholder}
              aria-label={copy.palette.title}
              autoComplete="off"
              spellCheck={false}
            />
            <span className="cmdk__esc">ESC</span>
          </div>

          <div className="cmdk__list" ref={listRef}>
            {groups.length ? (
              groups.map(([group, entries]) => (
                <div className="cmdk__group" key={group}>
                  <p className="cmdk__label">{group}</p>
                  {entries.map(({ item, index }) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="cmdk__item"
                        data-active={index === active}
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => execute(item)}
                      >
                        <span className="cmdk__item-icon">
                          <Icon width={14} height={14} />
                        </span>
                        <span className="cmdk__item-label">
                          {item.label}
                          {item.hint ? <small>{item.hint}</small> : null}
                        </span>
                        <span className="cmdk__item-key">
                          <ArrowUpRight width={13} height={13} aria-hidden="true" />
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <p className="cmdk__empty">{copy.palette.empty}</p>
            )}
          </div>

          <div className="cmdk__foot">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> {copy.palette.hint}
            </span>
            <span>
              <kbd>↵</kbd> {copy.play.open}
            </span>
            <span>
              <kbd>⌘</kbd>
              <kbd>K</kbd>
            </span>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

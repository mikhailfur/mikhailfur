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
  Scale,
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
  return function BrandGlyph(props: { className?: string }) {
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
  icon: React.ComponentType<{ className?: string }>;
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
      { id: "constitution", label: copy.nav.constitution, hint: copy.constitution.intro, icon: Scale },
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
        <DialogOverlay />
        <DialogContent className="max-w-xl overflow-hidden p-0" aria-describedby={undefined} onKeyDown={onKeyDown} hideClose>
          <DialogTitle className="sr-only">{copy.palette.title}</DialogTitle>
          <div className="flex items-center gap-2.5 border-b border-border px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.palette.placeholder}
              aria-label={copy.palette.title}
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <span className="hidden rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
              ESC
            </span>
          </div>

          <div className="max-h-[60svh] overflow-y-auto p-1.5 sm:max-h-[52svh]" ref={listRef}>
            {groups.length ? (
              groups.map(([group, entries]) => (
                <div className="mb-1" key={group}>
                  <p className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {group}
                  </p>
                  {entries.map(({ item, index }) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left outline-none transition-colors data-[active=true]:bg-muted"
                        data-active={index === active}
                        data-index={index}
                        onMouseEnter={() => setActive(index)}
                        onClick={() => execute(item)}
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-md border border-border bg-card text-muted-foreground">
                          <Icon className="size-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm">{item.label}</span>
                          {item.hint ? (
                            <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                              {item.hint}
                            </span>
                          ) : null}
                        </span>
                        <ArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">{copy.palette.empty}</p>
            )}
          </div>

          <div className="hidden items-center gap-4 border-t border-border bg-muted/35 px-4 py-2.5 font-mono text-[10px] text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1">↑</kbd>
              <kbd className="rounded border border-border bg-card px-1">↓</kbd>
              {copy.palette.hint}
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1">↵</kbd>
              {copy.play.open}
            </span>
            <span className="ml-auto inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-card px-1">⌘</kbd>
              <kbd className="rounded border border-border bg-card px-1">K</kbd>
            </span>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

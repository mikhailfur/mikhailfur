"use client";

import { useEffect, useState } from "react";
import { useCopy } from "@/lib/i18n";
import { SiteIcon } from "@/components/icons";

type Music = {
  artist?: string;
  coverUrl?: string;
  durationMs?: number;
  progressMs?: number;
  state: "idle" | "paused" | "playing";
  title?: string;
  url?: string;
};

export function MusicPresence({ compact = false }: { compact?: boolean }) {
  const copy = useCopy();
  const [music, setMusic] = useState<Music>({ state: "idle" });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch("/api/music", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as Music;
        if (active) setMusic(data);
      } catch {
        // The widget is optional.
      }
    };

    void load();
    const timer = window.setInterval(load, 45_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const label =
    music.state === "playing"
      ? copy.footer.musicPlaying
      : music.state === "paused"
        ? copy.footer.musicPaused
        : copy.footer.musicIdle;

  if (compact) {
    return (
      <span className="inline-flex min-w-0 items-center gap-2">
        <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded border border-border bg-muted/50 text-muted-foreground">
          {music.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={music.coverUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
          ) : (
            <SiteIcon name="music" className="size-3" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 truncate font-mono text-[11px] tracking-[0.02em]">
          <span className="text-muted-foreground">{label}</span>
          {music.title ? <span className="text-foreground"> {music.title}</span> : null}
          {music.artist ? <span className="text-muted-foreground"> · {music.artist}</span> : null}
        </span>
      </span>
    );
  }

  return (
    <a
      className="flex min-w-0 items-center gap-2.5 rounded-md border border-border px-2.5 py-1.5 transition-colors hover:bg-muted/50"
      href={music.url}
      target="_blank"
      rel="noreferrer"
      aria-label={music.title ? `${label}: ${music.title}, ${music.artist}` : label}
    >
      <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded border border-border bg-muted/50 text-muted-foreground">
        {music.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={music.coverUrl} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
        ) : (
          <SiteIcon name="music" className="size-3.5" aria-hidden="true" />
        )}
      </span>
      <span className="grid min-w-0 leading-tight">
        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
          {label}
          {music.state === "playing" ? <span className="size-1 rounded-full bg-rose" aria-hidden="true" /> : null}
        </span>
        {music.title ? <span className="truncate text-xs text-foreground">{music.title}</span> : null}
        {music.artist ? <span className="truncate text-[10px] text-muted-foreground">{music.artist}</span> : null}
      </span>
    </a>
  );
}

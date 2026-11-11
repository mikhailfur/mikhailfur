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
      <span className="music-card">
        <span className="music-card__cover">
          {music.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={music.coverUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <SiteIcon name="music" aria-hidden="true" />
          )}
        </span>
        <span className="music-card__text">
          <span className="music-card__label">{label}</span>
          <span className="music-card__title">{music.title || copy.hero.nothingPlaying}</span>
          {music.artist ? <span className="music-card__artist">{music.artist}</span> : null}
        </span>
      </span>
    );
  }

  return (
    <a
      className="music-card"
      href={music.url}
      target="_blank"
      rel="noreferrer"
      aria-label={music.title ? `${label}: ${music.title} — ${music.artist}` : label}
    >
      <span className="music-card__cover">
        {music.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={music.coverUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <SiteIcon name="music" aria-hidden="true" />
        )}
      </span>
      <span className="music-card__text">
        <span className="music-card__label">
          {label}
          {music.state === "playing" ? <span className="dot dot--live" style={{ marginLeft: 6 }} /> : null}
        </span>
        <span className="music-card__title">{music.title || copy.hero.nothingPlaying}</span>
        {music.artist ? <span className="music-card__artist">{music.artist}</span> : null}
      </span>
    </a>
  );
}

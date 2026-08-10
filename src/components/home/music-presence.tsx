"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MusicPresence = { artist?: string; coverUrl?: string; durationMs?: number; progressMs?: number; receivedAt?: number; state: "idle" | "paused" | "playing" | "unavailable" | "unconfigured"; title?: string; url?: string };

export function MusicPresence({ text }: { text: Record<string, string> }) {
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

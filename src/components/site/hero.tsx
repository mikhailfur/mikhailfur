"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { SeoulTime } from "@/components/site/seoul-time";
import { MusicPresence } from "@/components/site/music-presence";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/site/avatar";

const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";

export function Hero() {
  const copy = useCopy();

  return (
    <section id="top" className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 grid-surface opacity-30" aria-hidden="true" />

      <div className="wrap relative grid gap-12 pb-12 pt-14 md:pt-20 md:pb-16 lg:grid-cols-12 lg:gap-16 lg:pt-24">
        <div className="flex flex-col lg:col-span-7">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="dot-live" aria-hidden="true" />
              {copy.hero.metaLocation}
            </span>
            <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />
            <span>{copy.hero.metaYear}</span>
          </div>

          <h1 className="mt-7 font-display text-[clamp(3.4rem,10.5vw,7.2rem)] font-semibold leading-[0.86] tracking-[-0.07em]">
            <span className="block">{copy.hero.nameTop}</span>
            <span className="block text-rose">{copy.hero.nameBottom}</span>
          </h1>

          <div className="mt-6 flex items-center gap-3">
            <Avatar alt={copy.hero.avatarAlt} className="size-12 rounded-full lg:hidden" priority />
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {copy.hero.role}
            </p>
          </div>

          <p className="mt-4 max-w-[46ch] text-[clamp(1.05rem,1.7vw,1.3rem)] leading-relaxed text-foreground/85">
            {copy.hero.statement}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <a href="#works">
                {copy.hero.primary}
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <a href={TELEGRAM} target="_blank" rel="noreferrer">
                {copy.hero.secondary}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </Button>
          </div>

          <div className="mt-14 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-border pt-5 text-xs text-muted-foreground lg:mt-auto">
            <span className="inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-rose" aria-hidden="true" />
              {copy.hero.availability}
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.04em]">
              <SeoulTime />
            </span>
            <MusicPresence compact />
          </div>
        </div>

        <div className="hidden lg:col-span-5 lg:block">
          <figure className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                PROFILE
              </span>
              <Badge variant="outline">SEOUL · 2026</Badge>
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-blush">
              <Image
                src="/avatar.png"
                alt={copy.hero.avatarAlt}
                fill
                sizes="(min-width: 1024px) 38vw, 1px"
                className="object-cover object-[center_20%]"
              />
            </div>
            <figcaption className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-rose-deep">
                {copy.hero.role}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {copy.hero.caption}
              </span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

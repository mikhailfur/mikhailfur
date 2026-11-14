"use client";

import { ArrowUp, ArrowUpRight, MapPin, Volume2, VolumeX } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { useSettings } from "@/components/site/settings";
import { MusicPresence } from "@/components/site/music-presence";
import { SeoulTime } from "@/components/site/seoul-time";
import { SiteIcon } from "@/components/icons";
import { Avatar } from "@/components/site/avatar";
import { Button } from "@/components/ui/button";

const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";
const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";
const DISCORD =
  process.env.NEXT_PUBLIC_DISCORD_URL || "https://discordapp.com/users/1029691592845578270";

export function Contact() {
  const copy = useCopy();
  const { soundOn, toggleSound } = useSettings();

  return (
    <footer id="contact" className="border-t border-border bg-muted/35 pb-24 pt-[var(--section-y)]">
      <div className="wrap">
        <div className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <SiteIcon name="paper-plane" className="size-3.5 text-rose" aria-hidden="true" />
              {copy.nav.contact} / {copy.contact.reading}
            </div>
            <h2 className="mt-4 font-display text-[clamp(2.3rem,5.4vw,3.8rem)] leading-[0.98] tracking-[-0.05em]">
              {copy.contact.title}
            </h2>
            <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
              {copy.contact.copy}
            </p>
          </div>
          <div className="md:col-span-5 md:pt-7">
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
              {[
                { label: copy.contact.telegram, value: "@dataisnotfound", href: TELEGRAM, icon: "telegram" as const },
                { label: copy.contact.github, value: "@mikhailfur", href: GITHUB, icon: "github" as const },
                { label: copy.contact.discord, value: "mikhail_fur", href: DISCORD, icon: "discord" as const },
              ].map((link) => (
                <a
                  key={link.label}
                  className="group flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5 transition-colors hover:border-rose/25 hover:bg-card"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <SiteIcon name={link.icon} className="size-4 text-rose" aria-hidden="true" />
                  <span className="grid leading-tight">
                    <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                      {link.label}
                    </span>
                    <span className="text-sm">{link.value}</span>
                  </span>
                  <ArrowUpRight
                    className="ml-auto size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </a>
              ))}
              <div className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2.5">
                <MapPin className="size-4 text-rose" aria-hidden="true" />
                <span className="grid leading-tight">
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                    {copy.contact.location} · {copy.contact.time}
                  </span>
                  <span className="text-sm">
                    <SeoulTime compact />
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div className="flex items-center gap-2.5">
            <Avatar className="size-6 rounded" />
            <span className="text-xs text-muted-foreground">{copy.footer.built}</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <MusicPresence />
            <Button variant="ghost" size="xs" type="button" onClick={toggleSound} aria-pressed={soundOn}>
              {soundOn ? <Volume2 className="size-3" /> : <VolumeX className="size-3" />}
              {soundOn ? copy.footer.soundOn : copy.footer.soundOff}
            </Button>
            <Button variant="ghost" size="xs" asChild>
              <a href="#top">
                {copy.footer.backToTop}
                <ArrowUp className="size-3" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>{copy.footer.privacy}</span>
          <a className="transition-colors hover:text-foreground" href="https://fontawesome.com/license/free" target="_blank" rel="noreferrer">
            {copy.footer.icons}
          </a>
          <a className="inline-flex items-center gap-1 transition-colors hover:text-foreground" href={GITHUB} target="_blank" rel="noreferrer">
            {copy.footer.source}
            <ArrowUpRight className="size-3" aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}

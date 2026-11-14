"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Search, Volume2, VolumeX, X } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { useSettings } from "@/components/site/settings";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { SiteIcon } from "@/components/icons";
import { Avatar } from "@/components/site/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_ITEMS = [
  { id: "about", key: "about" },
  { id: "constitution", key: "constitution" },
  { id: "works", key: "works" },
  { id: "stack", key: "stack" },
  { id: "notes", key: "notes" },
  { id: "gallery", key: "gallery" },
  { id: "play", key: "play" },
] as const;

const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";
const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";
const DISCORD =
  process.env.NEXT_PUBLIC_DISCORD_URL || "https://discordapp.com/users/1029691592845578270";

export function Header({ onOpenPalette }: { onOpenPalette: () => void }) {
  const copy = useCopy();
  const { soundOn, toggleSound } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const top = window.scrollY;
      setScrolled(top > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, top / max) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((item) => document.getElementById(item.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navLabel = (key: (typeof NAV_ITEMS)[number]["key"]) => copy.nav[key];

  return (
    <>
      <header
        data-scrolled={scrolled ? "true" : "false"}
        className="sticky top-0 z-50 border-b border-transparent bg-background/85 backdrop-blur-xl transition-colors data-[scrolled=true]:border-border"
      >
        <div className="wrap flex h-16 items-center justify-between gap-4">
          <a className="flex min-w-0 items-center gap-2.5" href="#top" aria-label="Mikhail Fur, home">
            <Avatar className="size-7 rounded-md" />
            <span className="whitespace-nowrap text-[13px] font-semibold leading-none tracking-[-0.02em]">
              {copy.hero.nameTop} {copy.hero.nameBottom}
            </span>
          </a>

          <nav className="hidden items-center gap-0.5 xl:flex" aria-label={copy.nav.menu}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                className="rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground aria-[current=true]:bg-muted/60 aria-[current=true]:text-foreground"
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
              >
                {navLabel(item.key)}
              </a>
            ))}
            <a
              className="rounded-md px-2.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              href="#contact"
            >
              {copy.nav.contact}
            </a>
          </nav>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="hidden gap-2 text-muted-foreground sm:inline-flex"
              type="button"
              onClick={onOpenPalette}
              aria-label={copy.terminal.title}
            >
              <Search className="size-3.5" aria-hidden="true" />
              <span>{copy.terminal.title}</span>
              <kbd className="ml-1 rounded border border-border bg-muted/50 px-1 font-mono text-[10px] leading-4 text-muted-foreground">
                ⌘K
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="sm:hidden"
              type="button"
              onClick={onOpenPalette}
              aria-label={copy.terminal.title}
            >
              <Search className="size-4" />
            </Button>
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? copy.footer.soundOn : copy.footer.soundOff}
              title={soundOn ? copy.footer.soundOn : copy.footer.soundOff}
              aria-pressed={soundOn}
            >
              {soundOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="xl:hidden"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={copy.nav.menu}
            >
              <Menu className="size-4" />
            </Button>
          </div>
        </div>
        <span
          className="absolute inset-x-0 -bottom-px h-px origin-left bg-rose"
          style={{ transform: `scaleX(${progress})` }}
          aria-hidden="true"
        />
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetPortal>
          <SheetOverlay />
          <SheetContent aria-describedby={undefined} hideClose className="overflow-x-hidden">
            <SheetTitle className="sr-only">{copy.nav.menu}</SheetTitle>
            <div className="flex h-10 items-center justify-between">
              <a className="flex items-center gap-2.5" href="#top" onClick={() => setMenuOpen(false)}>
                <Avatar className="size-7 rounded-md" />
                <span className="whitespace-nowrap text-[13px] font-semibold leading-none tracking-[-0.02em]">
                  {copy.hero.nameTop} {copy.hero.nameBottom}
                </span>
              </a>
              <SheetClose asChild>
                <Button variant="ghost" size="icon-sm" type="button" aria-label={copy.nav.close}>
                  <X className="size-4" />
                </Button>
              </SheetClose>
            </div>

            <nav className="mt-4 grid" aria-label={copy.nav.menu}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  className="flex items-center justify-between border-b border-border py-3.5 text-[15px] font-medium"
                  href={`#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {navLabel(item.key)}
                  <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </a>
              ))}
              <a
                className="flex items-center justify-between border-b border-border py-3.5 text-[15px] font-medium"
                href="#contact"
                onClick={() => setMenuOpen(false)}
              >
                {copy.nav.contact}
                <ArrowUpRight className="size-4 text-muted-foreground" aria-hidden="true" />
              </a>
            </nav>

            <div className="mt-5 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{copy.footer.language}</span>
              <LanguageSwitcher />
            </div>

            <div className="mt-auto grid gap-4 pt-8">
              <div className="grid gap-1.5">
                {[
                  { label: "Telegram", href: TELEGRAM, icon: "telegram" as const },
                  { label: "GitHub", href: GITHUB, icon: "github" as const },
                  { label: "Discord", href: DISCORD, icon: "discord" as const },
                ].map((link) => (
                  <Button key={link.label} variant="outline" size="sm" asChild className="justify-between">
                    <a href={link.href} target="_blank" rel="noreferrer">
                      <span className="inline-flex items-center gap-2">
                        <SiteIcon name={link.icon} className="size-3.5" aria-hidden="true" />
                        {link.label}
                      </span>
                      <ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </SheetContent>
        </SheetPortal>
      </Sheet>
    </>
  );
}

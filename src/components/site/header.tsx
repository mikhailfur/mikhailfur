"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Volume2, VolumeX, X } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { useSettings } from "@/components/site/settings";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { SiteIcon } from "@/components/icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";

const NAV_ITEMS = [
  { id: "works", key: "works" },
  { id: "notes", key: "notes" },
  { id: "gallery", key: "gallery" },
  { id: "play", key: "play" },
] as const;

const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";
const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";
const DISCORD =
  process.env.NEXT_PUBLIC_DISCORD_URL || "https://discordapp.com/users/1029691592845578270";

const NAV_ICONS = {
  works: "briefcase",
  notes: "notebook",
  gallery: "camera",
  play: "gamepad",
  contact: "paper-plane",
} as const;

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
      setScrolled(top > 20);
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
      { rootMargin: "-35% 0px -55% 0px", threshold: [0, 0.2, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const navLabel = (key: (typeof NAV_ITEMS)[number]["key"]) => copy.nav[key];

  return (
    <>
      <header className="site-header" data-scrolled={scrolled ? "true" : "false"}>
        <div className="wrap header-inner">
          <a className="brand" href="#top" aria-label="Mikhail Fur, home">
            <span className="hanko hanko--small" aria-hidden="true">
              <SiteIcon name="fox" />
            </span>
            <span className="brand__text">
              <span className="brand__name">{copy.hero.nameTop} {copy.hero.nameBottom}</span>
              <span className="brand__sub">FOX LETTER · SEOUL</span>
            </span>
          </a>

          <nav className="main-nav" aria-label={copy.nav.menu}>
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                className="nav-link"
                href={`#${item.id}`}
                aria-current={active === item.id ? "true" : undefined}
              >
                {navLabel(item.key)}
              </a>
            ))}
            <a className="nav-link" href="#contact">
              {copy.nav.contact}
            </a>
          </nav>

          <div className="header-tools">
            <button
              className="command-trigger"
              type="button"
              onClick={onOpenPalette}
              aria-label={copy.terminal.title}
            >
              <Search width={13} height={13} aria-hidden="true" />
              <span>{copy.terminal.title}</span>
              <kbd>⌘K</kbd>
            </button>
            <LanguageSwitcher />
            <button
              className="icon-btn"
              type="button"
              onClick={toggleSound}
              aria-label={soundOn ? copy.footer.soundOn : copy.footer.soundOff}
              title={soundOn ? copy.footer.soundOn : copy.footer.soundOff}
              aria-pressed={soundOn}
            >
              {soundOn ? <Volume2 width={16} height={16} /> : <VolumeX width={16} height={16} />}
            </button>
            <button
              className="icon-btn mobile-menu-trigger"
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={copy.nav.menu}
            >
              <Menu width={18} height={18} />
            </button>
          </div>
        </div>
        <span className="header-progress" style={{ ["--progress" as string]: progress }} aria-hidden="true" />
      </header>

      <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="mobile-menu" aria-describedby={undefined}>
            <DialogTitle className="sr-only">{copy.nav.menu}</DialogTitle>
            <div className="mobile-menu__top">
              <a className="brand" href="#top" onClick={() => setMenuOpen(false)}>
                <span className="hanko hanko--small" aria-hidden="true"><SiteIcon name="fox" /></span>
                <span className="brand__text">
                  <span className="brand__name">{copy.hero.nameTop} {copy.hero.nameBottom}</span>
                </span>
              </a>
              <DialogClose asChild>
                <button className="icon-btn" type="button" aria-label={copy.nav.close}>
                  <X width={20} height={20} />
                </button>
              </DialogClose>
            </div>
            <nav className="mobile-menu__nav" aria-label={copy.nav.menu}>
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  className="mobile-menu__link"
                  href={`#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {navLabel(item.key)}
                  <span aria-hidden="true"><SiteIcon name={NAV_ICONS[item.id]} /></span>
                </a>
              ))}
              <a className="mobile-menu__link" href="#contact" onClick={() => setMenuOpen(false)}>
                {copy.nav.contact}
                <span aria-hidden="true"><SiteIcon name="paper-plane" /></span>
              </a>
            </nav>
            <div className="mobile-menu__foot">
              <div className="chip-row">
                <a className="text-link" href={TELEGRAM} target="_blank" rel="noreferrer">
                  <SiteIcon name="telegram" />
                  Telegram
                </a>
                <a className="text-link" href={GITHUB} target="_blank" rel="noreferrer">
                  <SiteIcon name="github" />
                  GitHub
                </a>
                <a className="text-link" href={DISCORD} target="_blank" rel="noreferrer">
                  <SiteIcon name="discord" />
                  Discord
                </a>
              </div>
              <LanguageSwitcher />
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}

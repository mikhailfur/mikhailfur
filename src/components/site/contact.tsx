"use client";

import { ArrowUp, ArrowUpRight, Flower2, MapPin, Volume2, VolumeX } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { useSettings } from "@/components/site/settings";
import { MusicPresence } from "@/components/site/music-presence";
import { SeoulTime } from "@/components/site/seoul-time";
import { SiteIcon } from "@/components/icons";

const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";
const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";
const DISCORD =
  process.env.NEXT_PUBLIC_DISCORD_URL || "https://discordapp.com/users/1029691592845578270";

export function Contact() {
  const copy = useCopy();
  const { soundOn, petalsOn, toggleSound, togglePetals } = useSettings();

  return (
    <footer id="contact" className="contact">
      <div className="wrap">
        <div className="contact__kicker" aria-hidden="true">
          <SiteIcon name="paper-plane" />
          <span>{copy.nav.contact} / {copy.contact.reading}</span>
        </div>
        <h2 className="contact__title">{copy.contact.title}</h2>
        <p className="contact__copy">{copy.contact.copy}</p>

        <div className="contact__links">
          <a className="contact__link" href={TELEGRAM} target="_blank" rel="noreferrer">
            <span className="contact__link-label">{copy.contact.telegram}</span>
            <span className="contact__link-value">
              @dataisnotfound
              <SiteIcon name="telegram" />
            </span>
          </a>
          <a className="contact__link" href={GITHUB} target="_blank" rel="noreferrer">
            <span className="contact__link-label">{copy.contact.github}</span>
            <span className="contact__link-value">
              @mikhailfur
              <SiteIcon name="github" />
            </span>
          </a>
          <a className="contact__link" href={DISCORD} target="_blank" rel="noreferrer">
            <span className="contact__link-label">{copy.contact.discord}</span>
            <span className="contact__link-value">
              mikhail_fur
              <SiteIcon name="discord" />
            </span>
          </a>
          <div className="contact__link">
            <span className="contact__link-label">
              {copy.contact.location} · {copy.contact.time}
            </span>
            <span className="contact__link-value">
              Seoul · <SeoulTime compact />
              <MapPin width={16} height={16} aria-hidden="true" />
            </span>
          </div>
        </div>

        <div className="contact__bottom">
          <div className="contact__signature">
            <span className="hanko hanko--small" aria-hidden="true">
              <SiteIcon name="fox" />
            </span>
            <span>{copy.footer.built}</span>
          </div>

          <div className="contact__utilities">
            <MusicPresence />
            <button className="contact__utility" type="button" onClick={togglePetals} aria-pressed={petalsOn}>
              <Flower2 width={13} height={13} aria-hidden="true" />
              {petalsOn ? copy.footer.petalsOn : copy.footer.petalsOff}
            </button>
            <button className="contact__utility" type="button" onClick={toggleSound} aria-pressed={soundOn}>
              {soundOn ? <Volume2 width={13} height={13} /> : <VolumeX width={13} height={13} />}
              {soundOn ? copy.footer.soundOn : copy.footer.soundOff}
            </button>
            <a className="contact__utility" href="#top">
              {copy.footer.backToTop}
              <ArrowUp width={13} height={13} aria-hidden="true" />
            </a>
          </div>
        </div>

        <div className="contact__bottom" style={{ paddingTop: "1rem", borderTop: "1px solid var(--line)", marginTop: "1.5rem" }}>
          <span>{copy.footer.privacy}</span>
          <a className="contact__utility" href={GITHUB} target="_blank" rel="noreferrer">
            {copy.footer.source}
            <ArrowUpRight width={12} height={12} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}

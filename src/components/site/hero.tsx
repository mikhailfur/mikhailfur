"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { useSettings } from "@/components/site/settings";
import { PetalField } from "@/components/site/petal-field";
import { Enso } from "@/components/brand/enso";
import { SeoulTime } from "@/components/site/seoul-time";
import { MusicPresence } from "@/components/site/music-presence";

const TELEGRAM = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/dataisnotfound";

export function Hero() {
  const copy = useCopy();
  const { petalsOn } = useSettings();

  return (
    <section id="top" className="hero">
      <div className="hero__petals" aria-hidden="true">
        <PetalField enabled={petalsOn} />
      </div>

      <div className="wrap hero__grid">
        <div className="hero__copy">
          <div className="hero__meta">
            <span>
              <span className="dot dot--live" aria-hidden="true" />
              {copy.hero.metaLocation}
            </span>
            <span className="jp" aria-hidden="true">
              狐の手紙 · きつねのてがみ
            </span>
            <span>{copy.hero.metaYear}</span>
          </div>

          <h1 className="hero__name">
            <span className="hero__name-top">{copy.hero.nameTop}</span>
            <span className="hero__name-bottom">
              {copy.hero.nameBottom}
              <span className="hanko" aria-hidden="true">
                狐
              </span>
            </span>
          </h1>

          <p className="hero__role">{copy.hero.role}</p>
          <p className="hero__statement">{copy.hero.statement}</p>

          <div className="hero__actions">
            <a className="btn btn--primary" href="#works">
              {copy.hero.primary}
              <ArrowDown width={15} height={15} aria-hidden="true" />
            </a>
            <a className="text-link" href={TELEGRAM} target="_blank" rel="noreferrer">
              {copy.hero.secondary}
              <ArrowUpRight width={14} height={14} aria-hidden="true" />
            </a>
          </div>

          <div className="hero__bottom">
            <span>
              <span className="dot" aria-hidden="true" />
              {copy.hero.availability}
            </span>
            <span className="separator" aria-hidden="true" />
            <span>
              <SeoulTime />
            </span>
            <MusicPresence compact />
          </div>
        </div>

        <div className="hero__portrait">
          <Enso className="portrait__enso" />
          <span className="portrait__backdrop" aria-hidden="true" />
          <figure className="portrait__frame">
            <div className="portrait__image">
              <Image
                src="/avatar.png"
                alt={copy.hero.portraitAlt}
                fill
                priority
                sizes="(max-width: 960px) 340px, 390px"
                style={{ objectFit: "cover", objectPosition: "50% 24%" }}
              />
              <span className="portrait__tint" aria-hidden="true" />
            </div>
            <figcaption className="portrait__caption">
              <span>{copy.hero.caption}</span>
              <span aria-hidden="true">02 / 狐</span>
            </figcaption>
          </figure>
          <span className="hanko portrait__stamp" aria-hidden="true">
            狐
          </span>
          <span className="portrait__tick" aria-hidden="true">
            きつねのてがみ
          </span>
        </div>

        <div className="hero__vertical" aria-hidden="true">
          <span className="vertical-reading">{copy.hero.verticalReading}</span>
          <span className="vertical-title">{copy.hero.vertical}</span>
        </div>
      </div>

      <a className="hero__scroll" href="#about">
        {copy.hero.scroll}
      </a>
    </section>
  );
}

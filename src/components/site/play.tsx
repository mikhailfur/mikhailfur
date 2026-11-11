"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";

export type ArcadeTab = "snake" | "wallz" | "chat";

const KANJI: Record<ArcadeTab, string> = {
  snake: "蛇",
  wallz: "壁",
  chat: "話",
};

export function Play({ onOpenArcade }: { onOpenArcade: (tab: ArcadeTab) => void }) {
  const copy = useCopy();
  const [hover, setHover] = useState<ArcadeTab | null>(null);

  return (
    <section id="play" className="section section--night play">
      <div className="wrap">
        <SectionHead
          label={copy.play.label}
          reading={copy.play.reading}
          title={copy.play.title}
          intro={copy.play.intro}
        />

        <div className="play__grid">
          {copy.play.items.map((item) => {
            const id = item.id as ArcadeTab;
            return (
              <button
                className="play-card"
                key={item.id}
                type="button"
                onClick={() => onOpenArcade(id)}
                onMouseEnter={() => setHover(id)}
                onMouseLeave={() => setHover(null)}
                aria-label={`${copy.play.open}: ${item.title}`}
              >
                <span className={`play-card__kanji${hover === id ? " is-hover" : ""}`} aria-hidden="true">
                  {KANJI[id]}
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <span className="play-card__foot">
                  <span>{item.hint}</span>
                  <ArrowUpRight width={16} height={16} aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="play__utility">
          <span>{copy.play.note}</span>
          <Link className="text-link" href="/2fa">
            {copy.play.twofa}
            <ArrowUpRight width={13} height={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

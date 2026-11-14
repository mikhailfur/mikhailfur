"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { ARCADE_ICONS, SECTION_ICONS, SiteIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export type ArcadeTab = "snake" | "wallz" | "chat";

export function Play({ onOpenArcade }: { onOpenArcade: (tab: ArcadeTab) => void }) {
  const copy = useCopy();

  return (
    <section id="play" className="section-pad">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.play}
          code={copy.play.reading}
          title={copy.play.title}
          intro={copy.play.intro}
        />

        <div className="grid gap-3 md:grid-cols-3">
          {copy.play.items.map((item) => {
            const id = item.id as ArcadeTab;
            return (
              <button
                className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 text-left transition-[border-color,background-color,transform] hover:-translate-y-0.5 hover:border-rose/30 hover:bg-background"
                key={item.id}
                type="button"
                onClick={() => onOpenArcade(id)}
                aria-label={`${copy.play.open}: ${item.title}`}
              >
                <span className="grid size-9 place-items-center rounded-md border border-border bg-background text-rose transition-colors group-hover:border-rose/25 group-hover:bg-blush">
                  <SiteIcon name={ARCADE_ICONS[id]} className="size-4" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-[-0.02em]">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                <span className="mt-6 flex items-center justify-between border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                  {item.hint}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{copy.play.note}</span>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/2fa">
              {copy.play.twofa}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS, SiteIcon, technologyIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";

export function Stack() {
  const copy = useCopy();

  return (
    <section id="stack" className="section-pad border-y border-border bg-muted/35">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.stack}
          code={copy.stack.reading}
          title={copy.stack.title}
          intro={copy.stack.intro}
        />
        <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {copy.stack.groups.map((group) => (
            <div className="bg-background p-5" key={group.name}>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                {group.name}
              </h3>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <Badge variant="outline" key={item} className="normal-case tracking-normal">
                    <SiteIcon name={technologyIcon(item)} className="size-3" aria-hidden="true" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-rose" aria-hidden="true" />
          {copy.stack.note}
        </p>
      </div>
    </section>
  );
}

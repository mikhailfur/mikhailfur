"use client";

import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS, SiteIcon, type SiteIconName } from "@/components/icons";
import { Avatar } from "@/components/site/avatar";
import { Card, CardContent } from "@/components/ui/card";

export function About() {
  const copy = useCopy();
  const about = copy.about;

  return (
    <section id="about" className="section-pad">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.about}
          code={about.reading}
          title={about.title}
          intro={about.lead}
        />

        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-7">
            <div className="grid gap-5 text-[clamp(0.98rem,1.3vw,1.08rem)] leading-[1.8] text-foreground/80">
              {about.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3 border-t border-border pt-4">
              <span className="grid size-7 place-items-center rounded-md bg-blush text-rose">
                <SiteIcon name="quill" className="size-3.5" aria-hidden="true" />
              </span>
              <span className="font-display text-lg italic tracking-[-0.02em] text-rose">
                {about.signature}
              </span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Seoul · 2026
              </span>
            </div>
          </div>

          <aside className="md:col-span-5" aria-label={about.title}>
            <Card>
              <CardContent className="divide-y divide-border p-0">
                <dl>
                  {about.facts.map((fact) => (
                    <div key={fact.label} className="grid grid-cols-[5rem_1fr] gap-3 px-4 py-3">
                      <dt className="pt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {fact.label}
                      </dt>
                      <dd className="text-sm leading-snug text-foreground">{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>

            <Card className="mt-3 border-rose/15 bg-blush/70">
              <CardContent className="flex gap-3 p-4">
                <Avatar className="size-7 rounded-md" />
                <p className="text-[13px] leading-relaxed text-rose-deep">{about.aside}</p>
              </CardContent>
            </Card>
          </aside>
        </div>

        <div className="mt-14 md:mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-4">
            <h3 className="font-display text-xl tracking-[-0.03em]">{about.hobbiesTitle}</h3>
            <p className="text-xs text-muted-foreground">{about.hobbiesNote}</p>
          </div>
          <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-5">
            {about.hobbies.map((hobby) => (
              <article
                key={hobby.icon}
                className="group border-b border-r border-border px-4 py-5 transition-colors hover:bg-card"
              >
                <span className="grid size-8 place-items-center rounded-md border border-border bg-card text-rose transition-colors group-hover:border-rose/25 group-hover:bg-blush">
                  <SiteIcon name={hobby.icon as SiteIconName} className="size-4" aria-hidden="true" />
                </span>
                <h4 className="mt-4 text-sm font-semibold tracking-[-0.01em]">{hobby.title}</h4>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {hobby.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

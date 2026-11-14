"use client";

import { ArrowUpRight } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS, SiteIcon, technologyIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/types/portfolio";

const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";

export function Works({ projects }: { projects: Project[] }) {
  const copy = useCopy();

  return (
    <section id="works" className="section-pad">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.works}
          code={copy.works.reading}
          title={copy.works.title}
          intro={copy.works.intro}
          aside={copy.works.source}
        />

        {projects.length ? (
          <div className="border-t border-border">
            {projects.map((project, index) => (
              <a
                className="group flex flex-col gap-4 border-b border-border px-2 py-5 transition-colors hover:bg-card md:grid md:grid-cols-12 md:items-start md:gap-6 md:px-3"
                key={project.url}
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name}: ${copy.works.view}`}
              >
                <div className="flex items-center justify-between md:contents">
                  <span className="font-mono text-[11px] text-muted-foreground md:order-1 md:col-span-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex items-center justify-end gap-3 md:order-4 md:col-span-2 md:items-start">
                    {project.status === "archived" ? (
                      <Badge variant="secondary">
                        <span className="size-1 rounded-full bg-muted-foreground/50" aria-hidden="true" />
                        {copy.works.statusArchived}
                      </Badge>
                    ) : null}
                    <ArrowUpRight
                      className="size-4 text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rose"
                      aria-hidden="true"
                    />
                  </div>
                </div>
                <div className="min-w-0 md:order-2 md:col-span-5">
                  <h3 className="break-words text-lg font-semibold leading-tight tracking-[-0.02em] transition-colors group-hover:text-rose md:text-xl">
                    {project.name}
                  </h3>
                  <p className="mt-1.5 max-w-[56ch] break-words text-sm leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">
                    {project.status === "archived" ? copy.works.archivedNote : project.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 md:order-3 md:col-span-4">
                  {project.stack.map((item) => (
                    <Badge variant="outline" key={item} className="normal-case tracking-normal">
                      <SiteIcon name={technologyIcon(item)} className="size-2.5" aria-hidden="true" />
                      {item}
                    </Badge>
                  ))}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {copy.works.empty}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <SiteIcon name="github" className="size-3.5" aria-hidden="true" />
            GitHub · @mikhailfur
          </span>
          <Button variant="ghost" size="sm" asChild>
            <a href={GITHUB} target="_blank" rel="noreferrer">
              {copy.works.all}
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

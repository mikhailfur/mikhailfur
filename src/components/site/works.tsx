"use client";

import { ArrowUpRight } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS, SiteIcon, technologyIcon } from "@/components/icons";
import type { Project } from "@/types/portfolio";

const GITHUB = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/mikhailfur";

export function Works({ projects }: { projects: Project[] }) {
  const copy = useCopy();

  return (
    <section id="works" className="section works">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.works}
          code={copy.works.reading}
          title={copy.works.title}
          intro={copy.works.intro}
          aside={copy.works.source}
        />

        {projects.length ? (
          <div className="works__list">
            {projects.map((project, index) => (
              <a
                className="work"
                key={project.url}
                href={project.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${project.name} — ${copy.works.view}`}
              >
                <span className="work__index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="work__title">{project.name}</h3>
                  <p className="work__desc">{project.description}</p>
                </div>
                <div className="work__stack" aria-label={copy.stack.title}>
                  {project.stack.map((item) => (
                    <span className="work__tag" key={item}>
                      <SiteIcon name={technologyIcon(item)} />
                      {item}
                    </span>
                  ))}
                </div>
                <span className="work__status" data-status={project.status}>
                  {project.status === "stable" ? copy.works.statusStable : copy.works.statusWip}
                </span>
                <ArrowUpRight className="work__arrow" width={18} height={18} aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : (
          <p className="notice" style={{ marginTop: "2rem" }}>
            {copy.works.empty}
          </p>
        )}

        <div className="works__foot">
          <span className="works__source">
            <SiteIcon name="github" />
            GitHub · @mikhailfur
          </span>
          <a className="text-link" href={GITHUB} target="_blank" rel="noreferrer">
            {copy.works.all}
            <ArrowUpRight width={14} height={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

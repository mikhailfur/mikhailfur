"use client";

import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS, SiteIcon, technologyIcon } from "@/components/icons";

export function Stack() {
  const copy = useCopy();

  return (
    <section id="stack" className="section section--paper-deep stack">
      <SiteIcon name="toolbox" className="stack__watermark" aria-hidden="true" />
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.stack}
          code={copy.stack.reading}
          title={copy.stack.title}
          intro={copy.stack.intro}
        />
        <div className="stack__grid">
          {copy.stack.groups.map((group) => (
            <div className="stack__group" key={group.name}>
              <h3>{group.name}</h3>
              <div className="stack__items">
                {group.items.map((item) => (
                  <span className="stack__item" key={item}>
                    <SiteIcon name={technologyIcon(item)} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="stack__note">
          <span className="dot" aria-hidden="true" />
          {copy.stack.note}
        </p>
      </div>
    </section>
  );
}

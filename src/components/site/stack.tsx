"use client";

import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";

export function Stack() {
  const copy = useCopy();

  return (
    <section id="stack" className="section section--paper-deep stack">
      <span className="stack__watermark" aria-hidden="true">
        道具
      </span>
      <div className="wrap">
        <SectionHead
          label={copy.stack.label}
          reading={copy.stack.reading}
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

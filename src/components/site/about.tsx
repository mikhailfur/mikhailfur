"use client";

import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";

export function About() {
  const copy = useCopy();
  const about = copy.about;

  return (
    <section id="about" className="section about">
      <div className="wrap">
        <SectionHead
          label={about.label}
          reading={about.reading}
          title={about.title}
          intro={about.lead}
        />

        <div className="about__grid">
          <div className="about__letter">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            <div className="about__signature">
              <span className="hanko hanko--small" aria-hidden="true">
                未
              </span>
              <span className="about__signature-text">{about.signature}</span>
              <span className="muted" style={{ fontSize: "0.7rem" }}>
                · Seoul, 2026
              </span>
            </div>
          </div>

          <aside className="about__facts" aria-label={about.title}>
            <dl>
              {about.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="about__note">
              <span className="hanko hanko--small" aria-hidden="true">
                狐
              </span>
              <p>{about.aside}</p>
            </div>
          </aside>
        </div>

        <div className="hobbies">
          <div className="hobbies__head">
            <h3>{about.hobbiesTitle}</h3>
            <p>{about.hobbiesNote}</p>
          </div>
          <div className="hobbies__rail">
            {about.hobbies.map((hobby) => (
              <article className="hobby" key={hobby.kanji}>
                <span className="hobby__kanji" aria-hidden="true">
                  {hobby.kanji}
                </span>
                <h4>{hobby.title}</h4>
                <p>{hobby.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

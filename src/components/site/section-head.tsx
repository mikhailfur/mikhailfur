import type { ReactNode } from "react";

export function SectionHead({
  label,
  reading,
  title,
  intro,
  aside,
}: {
  label: string;
  reading: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div className="section-head__title">
        <span className="spine" aria-hidden="true">
          <span className="spine__kanji">{label}</span>
          <span className="spine__reading">{reading}</span>
        </span>
        <h2 className="section-title">{title}</h2>
      </div>
      {intro ? <p className="section-intro">{intro}</p> : <span />}
      {aside ? <span className="section-aside">{aside}</span> : <span />}
    </div>
  );
}

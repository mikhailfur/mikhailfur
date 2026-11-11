import type { ReactNode } from "react";
import { SiteIcon, type SiteIconName } from "@/components/icons";

export function SectionHead({
  icon,
  code,
  title,
  intro,
  aside,
}: {
  icon: SiteIconName;
  code: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <div className="section-head">
      <div className="section-head__title">
        <span className="section-head__mark" aria-hidden="true">
          <SiteIcon name={icon} />
          <span className="section-head__code">{code}</span>
        </span>
        <h2 className="section-title">{title}</h2>
      </div>
      {intro ? <p className="section-intro">{intro}</p> : <span />}
      {aside ? <span className="section-aside">{aside}</span> : <span />}
    </div>
  );
}

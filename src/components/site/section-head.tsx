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
    <div className="mb-10 border-t border-border pt-5 md:mb-12">
      <div className="grid items-start gap-4 md:grid-cols-12 md:gap-6">
        <div className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground md:col-span-3">
          <SiteIcon name={icon} className="size-3.5 text-rose" aria-hidden="true" />
          <span>{code}</span>
          {aside ? <span className="hidden text-muted-foreground/60 sm:inline">/ {aside}</span> : null}
        </div>
        <h2 className="font-display text-[clamp(1.65rem,3.2vw,2.35rem)] leading-[1.02] tracking-[-0.045em] md:col-span-5">
          {title}
        </h2>
        {intro ? (
          <p className="max-w-[46ch] text-sm leading-relaxed text-muted-foreground md:col-span-4 md:justify-self-end">
            {intro}
          </p>
        ) : null}
      </div>
    </div>
  );
}

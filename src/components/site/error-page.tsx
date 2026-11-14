"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { SiteIcon, type SiteIconName } from "@/components/icons";
import { Avatar } from "@/components/site/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

type ErrorCode = 404 | 500 | 501 | 502 | 503;

const MARKS: Record<ErrorCode, SiteIconName> = {
  404: "home",
  500: "cross",
  501: "gear",
  502: "shrine",
  503: "pause",
};

export function ErrorPage({ code }: { code: ErrorCode }) {
  const copy = useCopy();
  const text = copy.errors[code];
  const [path, setPath] = useState("");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  const canRetry = code !== 404;

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <Link className="flex items-center gap-2.5" href="/">
            <Avatar className="size-7 rounded-md" />
            <span className="text-[13px] font-semibold leading-none tracking-[-0.02em]">
              {copy.hero.nameTop} {copy.hero.nameBottom}
            </span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              {copy.errors.back}
            </Link>
          </Button>
        </div>

        <div className="mt-16 grid gap-8 border-t border-border pt-10 md:grid-cols-[auto_minmax(0,1fr)] md:gap-12">
          <div className="font-mono text-[clamp(4rem,13vw,7rem)] font-medium leading-none tracking-[-0.06em] text-rose">
            {code}
          </div>

          <div>
            <Badge variant="outline">
              <SiteIcon name={MARKS[code]} className="size-3" aria-hidden="true" />
              {copy.errors.code} {code}
            </Badge>
            <h1 className="mt-4 font-display text-[clamp(1.7rem,4vw,2.4rem)] leading-[1.05] tracking-[-0.045em]">
              {text.title}
            </h1>
            <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-muted-foreground">{text.copy}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href="/">
                  {copy.errors.back}
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
              {canRetry ? (
                <Button variant="outline" size="sm" type="button" onClick={() => window.location.reload()}>
                  {copy.errors.retry}
                  <RefreshCw className="size-3.5" aria-hidden="true" />
                </Button>
              ) : null}
            </div>

            <div className="mt-8 overflow-hidden rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                <span>{copy.errors.terminal}</span>
                <span>code {code}</span>
              </div>
              <div className="grid gap-1 p-3 font-mono text-[11px] text-muted-foreground">
                <p>
                  <span className="text-rose">&gt;</span> request {path || "/"} → {code}
                </p>
                <p>
                  <span className="text-rose">&gt;</span> retry: {canRetry ? "possible" : "not_needed"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

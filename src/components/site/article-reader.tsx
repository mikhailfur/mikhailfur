"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Link2, X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { SiteIcon } from "@/components/icons";
import { formatArticleDate, readingMinutes } from "@/components/site/notes";
import { MarkdownBody } from "@/components/site/article-markdown";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/portfolio";

function readingTimeLabel(
  minutes: number,
  language: string,
  reader: { readingTime: string; readingTimeOne: string; readingTimeFew: string },
) {
  if (language !== "ru") return reader.readingTime;
  const mod10 = minutes % 10;
  const mod100 = minutes % 100;
  if (mod10 === 1 && mod100 !== 11) return reader.readingTimeOne;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return reader.readingTimeFew;
  return reader.readingTime;
}

export function ArticleReader({
  article,
  onClose,
}: {
  article: Article | null;
  onClose: () => void;
}) {
  const copy = useCopy();
  const { language } = useLanguage();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [article?.id]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog open={Boolean(article)} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        {article ? (
          <DialogContent className="max-w-3xl overflow-hidden p-0" aria-describedby={undefined} hideClose>
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-popover/95 px-5 py-3 backdrop-blur">
              <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <SiteIcon name="notebook" className="size-3.5 text-rose" aria-hidden="true" />
                {copy.notes.title}
              </span>
              <div className="flex items-center gap-1.5">
                <Button variant="ghost" size="xs" type="button" onClick={share}>
                  {copied ? <Check className="size-3" /> : <Link2 className="size-3" />}
                  {copied ? copy.reader.copied : copy.reader.share}
                </Button>
                <Button variant="ghost" size="icon-sm" type="button" onClick={onClose} aria-label={copy.reader.close}>
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <article className="px-5 pb-8 pt-6 md:px-10 md:pb-10 md:pt-8">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{article.type}</Badge>
                <span className="font-mono text-[10px] text-muted-foreground">№ {article.id.replace("case-", "")}</span>
              </div>
              <DialogTitle asChild>
                <h1 className="mt-4 font-display text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.04] tracking-[-0.045em]">
                  {article.title}
                </h1>
              </DialogTitle>
              <p className="mt-3 max-w-[58ch] text-base leading-relaxed text-muted-foreground">
                {article.excerpt}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 border-y border-border py-2.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                <span>
                  {copy.reader.published} {formatArticleDate(article.date, language)}
                </span>
                <span>
                  {readingMinutes(article)} {readingTimeLabel(readingMinutes(article), language, copy.reader)}
                </span>
              </div>

              <div className="prose mt-7">
                <MarkdownBody content={article.content} />
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                  <SiteIcon name="notebook" className="size-3.5 text-rose" aria-hidden="true" />
                  Mikhail Fur
                </span>
                <Button variant="ghost" size="sm" type="button" onClick={onClose}>
                  {copy.notes.back}
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </article>
          </DialogContent>
        ) : null}
      </DialogPortal>
    </Dialog>
  );
}

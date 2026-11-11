"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Check, Link2, X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { formatArticleDate, readingMinutes } from "@/components/site/notes";
import { MarkdownBody } from "@/components/site/article-markdown";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
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
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRevealed(new Set());
    setCopied(false);
  }, [article?.id]);

  const reveal = (word: string) => {
    setRevealed((current) => {
      const next = new Set(current);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

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
        <DialogOverlay className="reader-overlay" />
        {article ? (
          <DialogContent className="reader-scroll" aria-describedby={undefined}>
            <div className="reader">
            <div className="reader__bar">
              <span className="reader__bar-label">
                <span aria-hidden="true">記録</span>
                {copy.notes.title}
              </span>
              <div className="chip-row">
                <button className="reader__close" type="button" onClick={share}>
                  {copied ? <Check width={13} height={13} /> : <Link2 width={13} height={13} />}
                  {copied ? copy.reader.copied : copy.reader.share}
                </button>
                <button className="reader__close" type="button" onClick={onClose}>
                  <X width={14} height={14} aria-hidden="true" />
                  {copy.reader.close}
                </button>
              </div>
            </div>

            <header className="reader__head">
              <div className="reader__type">
                <span>{article.type}</span>
                <span>№ {article.id}</span>
              </div>
              <DialogTitle asChild>
                <h1>{article.title}</h1>
              </DialogTitle>
              <p className="reader__lead">{article.excerpt}</p>
              <div className="reader__meta">
                <span>
                  {copy.reader.published} {formatArticleDate(article.date, language)}
                </span>
                <span>
                  {readingMinutes(article)} {readingTimeLabel(readingMinutes(article), language, copy.reader)}
                </span>
                <span>{copy.reader.entry}</span>
              </div>
            </header>

            <div className="reader__body prose">
              <MarkdownBody article={article} revealed={revealed} onReveal={reveal} />
            </div>

            <div className="reader__hint">
              <span className="dot" aria-hidden="true" />
              {copy.notes.redactedHint}
            </div>

            <div className="reader__foot">
              <span className="hanko hanko--small" aria-hidden="true">
                記
              </span>
              <button className="text-link" type="button" onClick={onClose}>
                {copy.notes.back}
                <ArrowUpRight width={14} height={14} aria-hidden="true" />
              </button>
            </div>
            </div>
          </DialogContent>
        ) : null}
      </DialogPortal>
    </Dialog>
  );
}

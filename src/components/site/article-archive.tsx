"use client";

import { ArrowUpRight, X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { formatArticleDate } from "@/components/site/notes";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/portfolio";

export function ArticleArchive({
  open,
  articles,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  articles: Article[];
  onOpenChange: (open: boolean) => void;
  onSelect: (article: Article) => void;
}) {
  const copy = useCopy();
  const { language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="max-w-2xl overflow-hidden p-0" aria-describedby={undefined} hideClose>
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <DialogTitle className="font-display text-lg tracking-[-0.03em]">
                {copy.notes.archiveTitle}
              </DialogTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">{copy.notes.archiveDescription}</p>
            </div>
            <Button
              className="-mr-1 -mt-1"
              variant="ghost"
              size="icon-sm"
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={copy.common.close}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="max-h-[62svh] overflow-y-auto">
            {articles.map((article) => (
              <button
                className="group flex w-full items-start gap-4 border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-card"
                key={article.id}
                type="button"
                onClick={() => onSelect(article)}
              >
                <div className="w-[92px] shrink-0 pt-0.5">
                  <time
                    className="block font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground"
                    dateTime={article.date}
                  >
                    {formatArticleDate(article.date, language)}
                  </time>
                  <Badge variant="outline" className="mt-1.5">
                    {article.type}
                  </Badge>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-snug tracking-[-0.01em] transition-colors group-hover:text-rose">
                    {article.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {article.excerpt}
                  </p>
                </div>
                <ArrowUpRight
                  className="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

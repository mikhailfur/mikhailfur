"use client";

import { X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { formatArticleDate } from "@/components/site/notes";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
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
        <DialogContent className="archive" aria-describedby={undefined}>
          <div className="archive__head">
            <div>
              <DialogTitle asChild>
                <h2>{copy.notes.archiveTitle}</h2>
              </DialogTitle>
              <p className="archive__sub">{copy.notes.archiveDescription}</p>
            </div>
            <button
              className="icon-btn"
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label={copy.common.close}
            >
              <X width={18} height={18} />
            </button>
          </div>

          <div className="archive__list">
            {articles.map((article) => (
              <button
                className="archive__item"
                key={article.id}
                type="button"
                onClick={() => onSelect(article)}
              >
                <time dateTime={article.date}>{formatArticleDate(article.date, language)}</time>
                <div>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </div>
                <X width={14} height={14} style={{ transform: "rotate(45deg)", opacity: 0.5 }} aria-hidden="true" />
              </button>
            ))}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

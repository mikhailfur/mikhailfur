"use client";

import { ArrowUpRight } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS } from "@/components/icons";
import type { Article, Language } from "@/types/portfolio";

const LOCALES: Record<Language, string> = {
  ru: "ru-RU",
  en: "en-GB",
  ko: "ko-KR",
};

export function formatArticleDate(date: string, language: Language) {
  return new Intl.DateTimeFormat(LOCALES[language], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function readingMinutes(article: Article) {
  const words = article.content.trim().split(/\s+/u).length;
  return Math.max(1, Math.ceil(words / 190));
}

export function Notes({
  articles,
  onOpenArticle,
  onOpenArchive,
}: {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onOpenArchive: () => void;
}) {
  const copy = useCopy();
  const { language } = useLanguage();

  return (
    <section id="notes" className="section notes">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.notes}
          code={copy.notes.reading}
          title={copy.notes.title}
          intro={copy.notes.intro}
          aside={`${articles.length} ${copy.notes.files}`}
        />

        {articles.length ? (
          <div className="notes__list">
            {articles.map((article) => (
              <button
                className="note"
                type="button"
                key={article.id}
                onClick={() => onOpenArticle(article)}
              >
                <span className="note__meta">
                  <time className="note__date" dateTime={article.date}>
                    {formatArticleDate(article.date, language)}
                  </time>
                  <span className="note__type">{article.type}</span>
                </span>
                <span>
                  <h3>{article.title}</h3>
                  <p>{article.excerpt}</p>
                </span>
                <ArrowUpRight className="note__arrow" width={18} height={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        ) : (
          <p className="notice" style={{ marginTop: "2rem" }}>
            {copy.notes.empty}
          </p>
        )}

        <div className="notes__foot">
          <span className="muted" style={{ fontSize: "0.68rem" }}>
            {copy.notes.redactedHint}
          </span>
          <button className="text-link" type="button" onClick={onOpenArchive}>
            {copy.notes.all}
            <ArrowUpRight width={14} height={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

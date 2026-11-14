"use client";

import { ArrowUpRight } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Article, Language } from "@/types/portfolio";

const LOCALES: Record<Language, string> = {
  ru: "ru-RU",
  en: "en-GB",
  ko: "ko-KR",
};

export function formatArticleDate(date: string, language: Language) {
  const formatted = new Intl.DateTimeFormat(LOCALES[language], {
    day: language === "ko" ? "numeric" : "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

  return language === "ru" ? formatted.replace(/\s*г\.$/u, "") : formatted;
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
    <section id="notes" className="section-pad">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.notes}
          code={copy.notes.reading}
          title={copy.notes.title}
          intro={copy.notes.intro}
          aside={`${articles.length} ${copy.notes.files}`}
        />

        {articles.length ? (
          <div className="border-t border-border">
            {articles.map((article) => (
              <button
                className="group grid w-full gap-3 border-b border-border px-2 py-5 text-left transition-colors hover:bg-card md:grid-cols-12 md:items-start md:gap-6 md:px-3"
                type="button"
                key={article.id}
                onClick={() => onOpenArticle(article)}
              >
                <span className="flex items-center gap-2 md:col-span-3 md:flex-col md:items-start md:gap-1.5">
                  <time
                    className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground"
                    dateTime={article.date}
                  >
                    {formatArticleDate(article.date, language)}
                  </time>
                  <Badge variant="outline">{article.type}</Badge>
                </span>
                <span className="md:col-span-8">
                  <span className="block text-lg font-semibold leading-tight tracking-[-0.02em] transition-colors group-hover:text-rose md:text-xl">
                    {article.title}
                  </span>
                  <span className="mt-1.5 line-clamp-2 block text-sm leading-relaxed text-muted-foreground">
                    {article.excerpt}
                  </span>
                </span>
                <ArrowUpRight
                  className="hidden size-4 justify-self-end text-muted-foreground transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rose md:col-span-1 md:block"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {copy.notes.empty}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          <Button variant="ghost" size="sm" type="button" onClick={onOpenArchive}>
            {copy.notes.all}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}

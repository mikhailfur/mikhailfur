"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { Header } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Constitution } from "@/components/site/constitution";
import { Works } from "@/components/site/works";
import { Stack } from "@/components/site/stack";
import { Notes } from "@/components/site/notes";
import { Gallery } from "@/components/site/gallery";
import { Play, type ArcadeTab } from "@/components/site/play";
import { Terminal } from "@/components/site/terminal";
import { Contact } from "@/components/site/contact";
import { ArticleReader } from "@/components/site/article-reader";
import { ArticleArchive } from "@/components/site/article-archive";
import { ArcadeModal } from "@/components/site/arcade-modal";
import { CommandPalette } from "@/components/site/command-palette";
import { Miyabi } from "@/components/site/miyabi";
import type { Article, Constitution as ConstitutionData, Language, Project } from "@/types/portfolio";

export function SiteShell({
  projects,
  articlesByLanguage,
  constitutionByLanguage,
}: {
  projects: Project[];
  articlesByLanguage: Record<Language, Article[]>;
  constitutionByLanguage: Record<Language, ConstitutionData>;
}) {
  const { language } = useLanguage();
  const articles = useMemo(() => articlesByLanguage[language] ?? [], [articlesByLanguage, language]);
  const constitution = useMemo(
    () => constitutionByLanguage[language] ?? { preamble: null, parts: [], localized: false },
    [constitutionByLanguage, language],
  );
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [arcadeTab, setArcadeTab] = useState<ArcadeTab | null>(null);
  const [miyabiOpen, setMiyabiOpen] = useState(false);
  const selected = useMemo(
    () => (selectedId ? articles.find((article) => article.id === selectedId) ?? null : null),
    [articles, selectedId],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const noteId = new URLSearchParams(window.location.search).get("note");
    if (!noteId) return;
    for (const items of Object.values(articlesByLanguage)) {
      const article = items.find((item) => item.id === noteId);
      if (article) {
        setSelectedId(article.id);
        break;
      }
    }
  }, [articlesByLanguage]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (selectedId) {
      url.searchParams.set("note", selectedId);
    } else if (url.searchParams.has("note")) {
      url.searchParams.delete("note");
    } else {
      return;
    }
    window.history.replaceState({}, "", url);
  }, [selectedId]);

  const goTo = (id: string) => {
    setPaletteOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const openArchive = () => {
    setSelectedId(null);
    setPaletteOpen(false);
    setArchiveOpen(true);
  };

  const openArticle = (article: Article) => {
    setArchiveOpen(false);
    setSelectedId(null);
    window.setTimeout(() => setSelectedId(article.id), 80);
  };

  const openArcade = (tab: ArcadeTab) => {
    setPaletteOpen(false);
    setArchiveOpen(false);
    setArcadeTab(tab);
  };

  const openMiyabi = () => {
    setPaletteOpen(false);
    setMiyabiOpen(true);
  };

  return (
    <>
      <Header onOpenPalette={() => setPaletteOpen(true)} />
      <main>
        <Hero />
        <About />
        <Constitution constitution={constitution} />
        <Works projects={projects} />
        <Stack />
        <Notes articles={articles} onOpenArticle={openArticle} onOpenArchive={openArchive} />
        <Gallery />
        <Play onOpenArcade={openArcade} />
        <Terminal
          onGoTo={goTo}
          onOpenArchive={openArchive}
          onOpenMiyabi={openMiyabi}
          onOpenArcade={openArcade}
        />
        <Contact />
      </main>

      <ArticleReader article={selected} onClose={() => setSelectedId(null)} />
      <ArticleArchive
        open={archiveOpen}
        articles={articles}
        onOpenChange={setArchiveOpen}
        onSelect={openArticle}
      />
      <ArcadeModal tab={arcadeTab} onTabChange={setArcadeTab} onClose={() => setArcadeTab(null)} />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        onGoTo={goTo}
        onOpenArchive={openArchive}
        onOpenMiyabi={openMiyabi}
        onOpenArcade={openArcade}
      />
      <Miyabi open={miyabiOpen} onOpenChange={setMiyabiOpen} />
    </>
  );
}

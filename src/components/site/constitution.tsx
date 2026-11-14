"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Link2, Shuffle } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS } from "@/components/icons";
import { Avatar } from "@/components/site/avatar";
import { MarkdownBody } from "@/components/site/article-markdown";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { playKeyClickSound, playSuccessSound } from "@/utils/sfx";
import type {
  Article,
  Constitution as ConstitutionData,
  ConstitutionPart,
  ConstitutionSection,
} from "@/types/portfolio";

const READ_KEY = "mikhailfur.constitution.read.v2";
const STAMP_KEY = "mikhailfur.constitution.stamp.v2";
const RING_RADIUS = 46;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;


function asArticle(item: { id: string; title: string; date: string; excerpt?: string; content: string }): Article {
  return {
    id: item.id,
    type: "CONSTITUTION",
    title: item.title,
    date: item.date,
    excerpt: item.excerpt ?? "",
    content: item.content,
  };
}

function dottedDate(date: string) {
  return date ? date.replaceAll("-", ".") : "";
}

function countSections(parts: ConstitutionPart[]) {
  return parts.reduce((sum, part) => sum + part.sections.length, 0);
}

function readInPart(part: ConstitutionPart, readIds: Set<string>) {
  return part.sections.filter((section) => readIds.has(section.id)).length;
}

export function Constitution({ constitution }: { constitution: ConstitutionData }) {
  const copy = useCopy().constitution;
  const { language } = useLanguage();
  const parts = constitution.parts;
  const total = countSections(parts);
  const [activePartId, setActivePartId] = useState(parts[0]?.id ?? "");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    parts[0]?.sections[0]?.id ?? null,
  );
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [stamped, setStamped] = useState(false);
  const [stampKey, setStampKey] = useState(0);
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const sheetRef = useRef<HTMLElement | null>(null);
  const partRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeIndex = Math.max(
    0,
    parts.findIndex((part) => part.id === activePartId),
  );
  const activePart = parts[activeIndex] ?? parts[0] ?? null;
  const progress = total ? readIds.size / total : 0;
  const complete = total > 0 && readIds.size >= total;

  const sectionLabel = (count: number) => {
    if (language === "en") return `${count} ${count === 1 ? copy.sectionsOne : copy.sectionsCount}`;
    if (language === "ko") return `${count}${copy.sectionsCount}`;
    if (language !== "ru") return `${count} ${copy.sectionsCount}`;
    const mod10 = count % 10;
    const mod100 = count % 100;
    const word =
      mod10 === 1 && mod100 !== 11
        ? copy.sectionsOne
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
          ? copy.sectionsFew
          : copy.sectionsCount;
    return `${count} ${word}`;
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(READ_KEY);
      const saved = raw ? (JSON.parse(raw) as unknown) : null;
      const validIds = new Set(parts.flatMap((part) => part.sections.map((section) => section.id)));
      const next = new Set(
        Array.isArray(saved)
          ? saved.filter((id): id is string => typeof id === "string" && validIds.has(id))
          : [],
      );
      setReadIds(next);
      setStamped(total > 0 && next.size >= total && localStorage.getItem(STAMP_KEY) === "1");
    } catch {
      // Storage can be unavailable.
    }
  }, [parts, total]);

  useEffect(() => {
    if (!parts.length) return;
    const params = new URLSearchParams(window.location.search);
    const wantedSection = params.get("section");
    const wantedPart = params.get("constitution");

    setActivePartId((current) => {
      if (wantedSection) {
        const found = parts.find((part) => part.sections.some((section) => section.id === wantedSection));
        if (found) return found.id;
      }
      if (wantedPart && parts.some((part) => part.id === wantedPart)) return wantedPart;
      if (parts.some((part) => part.id === current)) return current;
      return parts[0].id;
    });

    if (wantedSection) {
      const found = parts.find((part) => part.sections.some((section) => section.id === wantedSection));
      if (found) {
        setActiveSectionId(wantedSection);
        setPendingSection(wantedSection);
      }
    }

    if ((wantedPart || wantedSection) && !window.location.hash) {
      requestAnimationFrame(() => {
        document.getElementById("constitution")?.scrollIntoView({ block: "start" });
      });
    }
  }, [parts]);

  useEffect(() => {
    if (!pendingSection) return;
    const node = document.getElementById(pendingSection);
    if (!node) {
      setPendingSection(null);
      return;
    }
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setPendingSection(null);
  }, [activePart, pendingSection]);

  const markRead = useCallback((id: string) => {
    setReadIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      try {
        localStorage.setItem(READ_KEY, JSON.stringify([...next]));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const node = sheetRef.current;
    if (!node || !activePart) return;
    const sections = Array.from(node.querySelectorAll<HTMLElement>("[data-section-id]"));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-section-id");
          if (id) markRead(id);
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0, 0.1, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));

    let frame = 0;
    const updateActive = () => {
      const line = window.innerHeight * 0.28;
      let candidate = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) candidate = section;
        else break;
      }
      const id = candidate?.getAttribute("data-section-id");
      if (id) setActiveSectionId(id);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateActive();
      });
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [activePart, markRead]);

  const updateUrl = (partId: string, sectionId?: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("constitution", partId);
    if (sectionId) url.searchParams.set("section", sectionId);
    else url.searchParams.delete("section");
    url.hash = "constitution";
    window.history.replaceState({}, "", url);
  };

  const selectPart = (id: string, options?: { scroll?: boolean }) => {
    const part = parts.find((item) => item.id === id);
    if (!part) return;
    setActivePartId(id);
    setActiveSectionId(part.sections[0]?.id ?? null);
    updateUrl(id);
    if (options?.scroll) {
      requestAnimationFrame(() => {
        sheetRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const selectSection = (part: ConstitutionPart, section: ConstitutionSection) => {
    setActivePartId(part.id);
    setActiveSectionId(section.id);
    setPendingSection(section.id);
    markRead(section.id);
    updateUrl(part.id, section.id);
  };

  const selectPartIndex = (index: number, focus = false) => {
    if (!parts.length) return;
    const next = parts[(index + parts.length) % parts.length];
    if (!next) return;
    selectPart(next.id, { scroll: focus });
    if (focus) {
      requestAnimationFrame(() => partRefs.current[next.id]?.focus({ preventScroll: true }));
    }
  };

  const onPartKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!parts.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      selectPartIndex(index + 1, true);
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      selectPartIndex(index - 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectPartIndex(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      selectPartIndex(parts.length - 1, true);
    } else if (/^[1-9]$/.test(event.key)) {
      const next = Number(event.key) - 1;
      if (next < parts.length) {
        event.preventDefault();
        selectPartIndex(next, true);
      }
    }
  };

  const randomSection = () => {
    const sections = parts.flatMap((part) => part.sections.map((section) => ({ part, section })));
    if (!sections.length) return;
    setShuffling(true);
    const pick = sections[Math.floor(Math.random() * sections.length)];
    selectSection(pick.part, pick.section);
    playKeyClickSound();
    window.setTimeout(() => setShuffling(false), 440);
  };

  const onSealClick = () => {
    if (!complete) {
      const next = parts
        .flatMap((part) => part.sections.map((section) => ({ part, section })))
        .find((item) => !readIds.has(item.section.id));
      if (next) {
        selectSection(next.part, next.section);
        playKeyClickSound();
      }
      return;
    }

    setStamped(true);
    setStampKey((current) => current + 1);
    try {
      localStorage.setItem(STAMP_KEY, "1");
    } catch {
      // Ignore storage failures.
    }
    playSuccessSound();
  };

  const resetProgress = () => {
    setReadIds(new Set());
    setStamped(false);
    setStampKey((current) => current + 1);
    try {
      localStorage.removeItem(READ_KEY);
      localStorage.removeItem(STAMP_KEY);
    } catch {
      // Ignore storage failures.
    }
  };

  const copySectionLink = async (part: ConstitutionPart, section: ConstitutionSection) => {
    const url = new URL(window.location.href);
    url.searchParams.set("constitution", part.id);
    url.searchParams.set("section", section.id);
    url.hash = "constitution";
    window.history.replaceState({}, "", url);
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedSectionId(section.id);
      window.setTimeout(() => setCopiedSectionId(null), 1800);
    } catch {
      setCopiedSectionId(null);
    }
  };

  const share = async () => {
    if (!activePart) return;
    const section = activeSectionId
      ? activePart.sections.find((item) => item.id === activeSectionId)
      : null;
    if (section) {
      await copySectionLink(activePart, section);
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set("constitution", activePart.id);
    url.searchParams.delete("section");
    url.hash = "constitution";
    try {
      await navigator.clipboard.writeText(url.toString());
      setCopiedSectionId(activePart.id);
      window.setTimeout(() => setCopiedSectionId(null), 1800);
    } catch {
      setCopiedSectionId(null);
    }
  };

  const preamble = constitution.preamble;
  const preambleArticle = useMemo(
    () =>
      preamble
        ? asArticle({
            id: "preamble",
            title: preamble.title,
            date: preamble.adopted,
            content: preamble.content,
          })
        : null,
    [preamble],
  );

  if (!parts.length) {
    return (
      <section id="constitution" className="section-pad border-t border-border">
        <div className="wrap">
          <SectionHead
            icon={SECTION_ICONS.constitution}
            code={copy.reading}
            title={copy.title}
            intro={copy.intro}
          />
          <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {copy.empty}
          </p>
        </div>
      </section>
    );
  }

  const activePartIntro = activePart?.intro
    ? asArticle({
        id: `${activePart.id}-intro`,
        title: activePart.title,
        date: preamble?.adopted ?? "",
        content: activePart.intro,
      })
    : null;

  return (
    <section id="constitution" className="section-pad border-t border-border bg-muted/25">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.constitution}
          code={copy.reading}
          title={copy.title}
          intro={copy.intro}
          aside={sectionLabel(total)}
        />

        <div className="mb-8 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            <span>{copy.document} · MF · CONST · 2026</span>
            <span>{copy.copy} № 001</span>
            <span>{copy.edition} {preamble?.edition ?? "2.0"}</span>
            <span className="inline-flex items-center gap-1.5 text-rose">
              <span className="size-1.5 rounded-full bg-rose" aria-hidden="true" />
              {copy.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative grid size-12 shrink-0 place-items-center rounded-full border border-border bg-background text-rose outline-none transition-colors hover:border-rose/40 focus-visible:ring-2 focus-visible:ring-ring/40 data-[complete=true]:border-rose data-[complete=true]:bg-blush"
              type="button"
              onClick={onSealClick}
              data-complete={complete ? "true" : "false"}
              data-stamped={stamped ? "true" : "false"}
              aria-label={
                complete
                  ? stamped
                    ? copy.stamped
                    : copy.stamp
                  : `${copy.readProgress} ${readIds.size} ${copy.of} ${total}`
              }
              title={complete ? (stamped ? copy.stamped : copy.stamp) : copy.sealHint}
            >
              <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="var(--border)" strokeWidth="3" />
                <circle
                  cx="50"
                  cy="50"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: RING_LENGTH,
                    strokeDashoffset: RING_LENGTH * (1 - progress),
                  }}
                />
              </svg>
              <Avatar key={stampKey} className="size-7 rounded-full" />
            </button>
            <div className="grid leading-tight" aria-live="polite">
              <strong className="text-sm">
                {complete ? (stamped ? copy.stamped : copy.allRead) : copy.sealHint}
              </strong>
              <span className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {copy.readProgress} {readIds.size} / {total}
              </span>
            </div>
            {readIds.size > 0 ? (
              <Button variant="ghost" size="xs" type="button" onClick={resetProgress}>
                {copy.reset}
              </Button>
            ) : null}
          </div>
        </div>

        {!constitution.localized && language !== "ru" && copy.fallbackNote ? (
          <p className="mb-6 rounded-md border border-rose/15 bg-blush px-3 py-2 text-xs text-rose-deep" role="note">
            {copy.fallbackNote}
          </p>
        ) : null}

        {preamble && preambleArticle ? (
          <Card className="mx-auto mb-8 max-w-4xl overflow-hidden">
            <div className="grid md:grid-cols-[minmax(0,1fr)_220px]">
              <div className="p-5 md:p-7">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {copy.preamble}
                </span>
                <p className="mt-3 font-display text-lg italic tracking-[-0.02em] text-rose">
                  «{preamble.motto}»
                </p>
                <div className="prose mt-4">
                  <MarkdownBody content={preambleArticle.content} />
                </div>
              </div>
              <aside className="flex flex-col gap-6 border-t border-border bg-muted/30 p-5 md:border-l md:border-t-0 md:p-6">
                <span className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                  {copy.preambleNote}
                </span>
                <div className="mt-auto">
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6 rounded" />
                    <span className="text-xs font-medium">{copy.signatureName}</span>
                  </div>
                  <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                    {copy.signed} · {preamble.place} · {dottedDate(preamble.adopted)}
                  </p>
                </div>
              </aside>
            </div>
          </Card>
        ) : null}

        <div className="grid gap-6 md:grid-cols-[280px_minmax(0,1fr)] md:gap-8">
          <div className="md:sticky md:top-20 md:self-start">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {copy.parts}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground/70">{copy.keyboard}</span>
            </div>

            <nav className="grid gap-1" aria-label={copy.parts}>
              {parts.map((part, index) => {
                const selected = part.id === activePart?.id;
                const read = readInPart(part, readIds);
                return (
                  <div key={part.id}>
                    <button
                      ref={(node) => {
                        partRefs.current[part.id] = node;
                      }}
                      className="w-full rounded-md border border-transparent px-2.5 py-2 text-left outline-none transition-colors hover:bg-card focus-visible:ring-2 focus-visible:ring-ring/40 aria-[current=true]:border-border aria-[current=true]:bg-card"
                      type="button"
                      aria-current={selected ? "true" : undefined}
                      aria-expanded={selected}
                      aria-controls={`constitution-part-${part.id}`}
                      onClick={() => selectPart(part.id, { scroll: true })}
                      onKeyDown={(event) => onPartKeyDown(event, index)}
                    >
                      <span className="flex items-center gap-2">
                        <span className="grid size-6 shrink-0 place-items-center rounded border border-border bg-background font-mono text-[10px] text-rose">
                          {part.number}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{part.title}</span>
                        <span
                          className="size-1.5 shrink-0 rounded-full bg-rose"
                          data-read={read > 0 ? "true" : "false"}
                          style={{ opacity: read > 0 ? 1 : 0.15 }}
                          aria-hidden="true"
                        />
                      </span>
                      <span className="mt-1 block pl-8 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                        {sectionLabel(part.sections.length)}
                        {read ? ` · ${read}/${part.sections.length}` : ""}
                      </span>
                    </button>

                    {selected ? (
                      <div className="ml-3 mt-1 grid gap-0.5 border-l border-border pl-2" id={`constitution-part-${part.id}`}>
                        {part.sections.map((section) => (
                          <button
                            className="flex items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground aria-[current=true]:bg-card aria-[current=true]:text-foreground"
                            type="button"
                            key={section.id}
                            aria-current={section.id === activeSectionId ? "true" : undefined}
                            onClick={() => selectSection(part, section)}
                          >
                            <span className="font-mono text-[9px] text-rose">{section.number}</span>
                            <span className="min-w-0 flex-1 truncate">{section.title}</span>
                            <span
                              className="size-1 shrink-0 rounded-full bg-rose"
                              data-read={readIds.has(section.id) ? "true" : "false"}
                              style={{ opacity: readIds.has(section.id) ? 0.8 : 0.12 }}
                              aria-hidden="true"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </nav>

            <div className="mt-4 grid gap-2 border-t border-border pt-3">
              <Button variant="outline" size="xs" type="button" onClick={randomSection} className="justify-start" data-shuffling={shuffling ? "true" : "false"}>
                <Shuffle className="size-3" aria-hidden="true" />
                {copy.randomSection}
              </Button>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-muted-foreground">
                  {readIds.size}/{total}
                </span>
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-border" aria-hidden="true">
                  <i
                    className="block h-full origin-left bg-rose transition-transform"
                    style={{ transform: `scaleX(${progress})` }}
                  />
                </span>
              </div>
            </div>
          </div>

          {activePart ? (
            <Card
              className="overflow-hidden"
              key={activePart.id}
            >
              <article ref={sheetRef} aria-label={activePart.title} tabIndex={0} className="outline-none">
                <header className="border-b border-border p-5 md:p-7">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    <span className="text-rose">{copy.part} {activePart.number}</span>
                    <span>{copy.of} {parts.length}</span>
                    <span>{copy.edition} {preamble?.edition ?? "2.0"}</span>
                  </div>
                  <h3 className="mt-3 font-display text-[clamp(1.5rem,3vw,2rem)] leading-[1.05] tracking-[-0.04em]">
                    {activePart.title}
                  </h3>
                  {activePartIntro ? (
                    <div className="prose mt-3">
                      <MarkdownBody content={activePartIntro.content} />
                    </div>
                  ) : null}
                </header>

                <div className="divide-y divide-border">
                  {activePart.sections.map((section) => (
                    <section
                      id={section.id}
                      data-section-id={section.id}
                      key={section.id}
                      aria-labelledby={`${section.id}-title`}
                      className="px-5 py-6 md:px-7"
                    >
                      <header className="flex items-start gap-3">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded border border-border bg-muted/40 font-mono text-[10px] text-rose">
                          {section.number}
                        </span>
                        <h4
                          id={`${section.id}-title`}
                          className="min-w-0 flex-1 text-base font-semibold tracking-[-0.02em]"
                        >
                          {section.title}
                        </h4>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          type="button"
                          onClick={() => copySectionLink(activePart, section)}
                          aria-label={copy.sectionLink}
                          title={copy.sectionLink}
                        >
                          {copiedSectionId === section.id ? (
                            <Check className="size-3.5" aria-hidden="true" />
                          ) : (
                            <Link2 className="size-3.5" aria-hidden="true" />
                          )}
                        </Button>
                      </header>
                      <div className="prose mt-3">
                        <MarkdownBody content={section.content} />
                      </div>
                    </section>
                  ))}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border p-4 md:px-7">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="xs" type="button" onClick={() => selectPartIndex(activeIndex - 1, true)}>
                      <ArrowLeft className="size-3" aria-hidden="true" />
                      {copy.previousPart}
                    </Button>
                    <Button variant="outline" size="xs" type="button" onClick={() => selectPartIndex(activeIndex + 1, true)}>
                      {copy.nextPart}
                      <ArrowRight className="size-3" aria-hidden="true" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="xs" type="button" onClick={share}>
                    {copiedSectionId ? <Check className="size-3" /> : <Link2 className="size-3" />}
                    {copiedSectionId ? copy.copied : copy.share}
                  </Button>
                </footer>
              </article>
            </Card>
          ) : (
            <p className="rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              {copy.empty}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

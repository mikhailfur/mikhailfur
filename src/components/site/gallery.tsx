"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Heart, Lock, Search } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import { SECTION_ICONS } from "@/components/icons";
import {
  getDisplayRatingLabel,
  getNormalizedRating,
  isRatingCensored,
  type CivitaiImage,
} from "@/types/civitai";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { playBeepSound, playSuccessSound } from "@/utils/sfx";

type Filter = "all" | "sfw" | "nsfw";

const AGE_KEY = "mikhailfur.age19";

function readAge() {
  try {
    return localStorage.getItem(AGE_KEY) === "true";
  } catch {
    return false;
  }
}

const FILTERS: Filter[] = ["all", "sfw", "nsfw"];

export function Gallery() {
  const copy = useCopy();
  const [images, setImages] = useState<CivitaiImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [ageVerified, setAgeVerified] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [selected, setSelected] = useState<CivitaiImage | null>(null);
  const [copied, setCopied] = useState(false);
  const requested = useRef(false);
  const specs = selected
    ? [
        { label: copy.gallery.baseModel, value: selected.baseModel },
        { label: copy.gallery.sampler, value: selected.meta?.sampler },
        { label: copy.gallery.steps, value: selected.meta?.steps ? String(selected.meta.steps) : undefined },
        { label: copy.gallery.cfg, value: selected.meta?.cfgScale ? String(selected.meta.cfgScale) : undefined },
        { label: copy.gallery.seed, value: selected.meta?.seed ? String(selected.meta.seed) : undefined },
        { label: copy.gallery.resolution, value: selected.meta?.Size },
      ].filter((item): item is { label: string; value: string } => Boolean(item.value))
    : [];

  useEffect(() => {
    setAgeVerified(readAge());
  }, []);

  const load = useCallback(async (nextCursor?: string) => {
    if (nextCursor) setLoadingMore(true);
    else {
      setLoading(true);
      setError(false);
    }

    try {
      const params = new URLSearchParams({ limit: "24", sort: "Newest" });
      if (nextCursor) params.set("cursor", nextCursor);
      const response = await fetch(`/api/civitai?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Civitai request failed");
      const data = (await response.json()) as {
        items?: CivitaiImage[];
        metadata?: { nextCursor?: string };
      };
      const items = Array.isArray(data.items) ? data.items : [];
      setImages((current) => (nextCursor ? [...current, ...items] : items));
      setCursor(data.metadata?.nextCursor ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    void load();
  }, [load]);

  const nsfwCount = useMemo(() => images.filter(isRatingCensored).length, [images]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return images.filter((image) => {
      const censored = isRatingCensored(image);
      if (filter === "sfw" && censored) return false;
      if (filter === "nsfw" && !censored) return false;
      if (!term) return true;
      return (
        image.meta?.prompt?.toLowerCase().includes(term) ||
        image.baseModel?.toLowerCase().includes(term) ||
        String(image.id).includes(term)
      );
    });
  }, [filter, images, query]);

  const unlock = () => {
    setAgeVerified(true);
    setGateOpen(false);
    try {
      localStorage.setItem(AGE_KEY, "true");
    } catch {
      // Ignore.
    }
    playSuccessSound();
  };

  const lock = () => {
    setAgeVerified(false);
    try {
      localStorage.setItem(AGE_KEY, "false");
    } catch {
      // Ignore.
    }
    setFilter("all");
    playBeepSound();
  };

  const changeFilter = (value: string) => {
    const next = value as Filter;
    if (next === "nsfw" && !ageVerified) {
      setGateOpen(true);
      return;
    }
    setFilter(next);
  };

  const openCard = (image: CivitaiImage) => {
    if (isRatingCensored(image) && !ageVerified) {
      setGateOpen(true);
      return;
    }
    setSelected(image);
  };

  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="gallery" className="section-pad border-y border-border">
      <div className="wrap">
        <SectionHead
          icon={SECTION_ICONS.gallery}
          code={copy.gallery.reading}
          title={copy.gallery.title}
          intro={copy.gallery.intro}
          aside={copy.gallery.source}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value={filter} onValueChange={changeFilter}>
            <TabsList>
              {FILTERS.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {item === "all" ? copy.gallery.all : item === "sfw" ? copy.gallery.sfw : copy.gallery.nsfw}
                  {item === "nsfw" ? ` (${nsfwCount})` : ""}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.gallery.search}
                aria-label={copy.gallery.search}
                className="h-8 w-full pl-8 text-xs"
              />
            </div>
            {ageVerified ? (
              <Button variant="ghost" size="xs" type="button" onClick={lock}>
                {copy.gallery.relock}
              </Button>
            ) : null}
          </div>
        </div>

        {!ageVerified && nsfwCount > 0 ? (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border border-rose/15 bg-blush/60 p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="grid size-7 shrink-0 place-items-center rounded-md bg-card text-rose">
                <Lock className="size-3.5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-rose-deep">{copy.gallery.gateTitle}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-rose-deep/75">{copy.gallery.gateCopy}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="xs" type="button" onClick={() => setGateOpen(false)}>
                {copy.gallery.gateCancel}
              </Button>
              <Button variant="rose" size="xs" type="button" onClick={unlock}>
                {copy.gallery.gateButton}
              </Button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5] animate-pulse rounded-lg border border-border bg-muted/60"
              />
            ))}
          </div>
        ) : error ? (
          <p className="mt-8 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {copy.gallery.error}
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-8 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {copy.gallery.empty}
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((image) => {
              const censored = isRatingCensored(image);
              const blurred = censored && !ageVerified;
              const rating = getNormalizedRating(image);
              return (
                <button
                  className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-night text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  type="button"
                  key={image.id}
                  onClick={() => openCard(image)}
                  aria-label={`${copy.gallery.open}: ${image.meta?.prompt || image.id}`}
                >
                  {image.type === "video" ? (
                    <video
                      src={image.url}
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="metadata"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={image.meta?.prompt || `Civitai artwork ${image.id}`}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  )}
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/60 via-transparent to-transparent"
                    aria-hidden="true"
                  />
                  <Badge
                    variant={censored ? "rose" : "night"}
                    className="absolute left-2 top-2 z-20 border-white/15 bg-night/60 text-[9px] text-white backdrop-blur"
                  >
                    {getDisplayRatingLabel(rating)}
                  </Badge>
                  {blurred ? (
                    <span className="absolute inset-0 grid place-items-center bg-night/15 backdrop-blur-md">
                      <span className="grid size-10 place-items-center rounded-full border border-white/20 bg-night/50 text-white">
                        <Lock className="size-4" aria-hidden="true" />
                      </span>
                    </span>
                  ) : null}
                  <span className="absolute inset-x-0 bottom-0 p-3">
                    {image.meta?.prompt ? (
                      <span className="line-clamp-2 text-[11px] leading-snug text-white/85">
                        {image.meta.prompt}
                      </span>
                    ) : null}
                    <span className="mt-2 flex items-center justify-between font-mono text-[9px] text-white/60">
                      <span>#{image.id}</span>
                      <span className="inline-flex items-center gap-1">
                        <Heart className="size-2.5" aria-hidden="true" />
                        {image.stats?.heartCount || image.stats?.likeCount || 0}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
            {filtered.length} / {images.length}
          </span>
          {cursor ? (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={() => void load(cursor)}
              disabled={loadingMore}
            >
              {loadingMore ? copy.common.loading : copy.gallery.loadMore}
            </Button>
          ) : null}
        </div>
      </div>

      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="max-w-md" aria-describedby={undefined}>
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-md border border-rose/15 bg-blush text-rose">
                <Lock className="size-4" aria-hidden="true" />
              </span>
              <div>
                <DialogTitle className="text-lg font-semibold tracking-[-0.02em]">
                  {copy.gallery.gateTitle}
                </DialogTitle>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {copy.gallery.gateCopy}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setGateOpen(false)}>
                {copy.gallery.gateCancel}
              </Button>
              <Button variant="rose" size="sm" type="button" onClick={unlock}>
                {copy.gallery.gateButton}
              </Button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogPortal>
          <DialogOverlay />
          {selected ? (
            <DialogContent className="max-w-5xl overflow-hidden p-0" aria-describedby={undefined}>
              <div className="grid max-h-[86svh] md:grid-cols-[1.15fr_0.85fr]">
                <div className="flex min-h-[260px] items-center justify-center bg-night p-3 md:p-4">
                  {selected.type === "video" ? (
                    <video src={selected.url} controls loop playsInline autoPlay className="max-h-[80svh] w-full object-contain" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selected.url}
                      alt={selected.meta?.prompt || `Civitai artwork ${selected.id}`}
                      referrerPolicy="no-referrer"
                      className="max-h-[80svh] w-full object-contain"
                    />
                  )}
                </div>
                <div className="overflow-y-auto p-5 md:p-6">
                  <div className="flex items-center gap-2">
                    <Badge variant="accent">{getDisplayRatingLabel(getNormalizedRating(selected))}</Badge>
                    <span className="font-mono text-[10px] text-muted-foreground">#{selected.id}</span>
                  </div>
                  <DialogTitle className="mt-3 text-lg font-semibold tracking-[-0.02em]">
                    {copy.gallery.detail}
                  </DialogTitle>

                  <div className="mt-5 flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {copy.gallery.prompt}
                    </span>
                    {selected.meta?.prompt ? (
                      <Button variant="ghost" size="xs" type="button" onClick={() => void copyPrompt(selected.meta?.prompt || "")}>
                        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                        {copied ? copy.gallery.copied : copy.gallery.copy}
                      </Button>
                    ) : null}
                  </div>
                  <p className="mt-2 rounded-md border border-border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed text-foreground/80">
                    {selected.meta?.prompt || copy.gallery.noPrompt}
                  </p>

                  {selected.meta?.negativePrompt ? (
                    <>
                      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {copy.gallery.negativePrompt}
                      </div>
                      <p className="mt-2 rounded-md border border-border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed text-foreground/80">
                        {selected.meta.negativePrompt}
                      </p>
                    </>
                  ) : null}

                  {specs.length ? (
                    <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border">
                      {specs.map((spec) => (
                        <div className="bg-card p-2.5" key={spec.label}>
                          <dt className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                            {spec.label}
                          </dt>
                          <dd className="mt-0.5 truncate text-xs">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : null}

                  <div className="mt-5">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://civitai.com/images/${selected.id}`} target="_blank" rel="noreferrer">
                        {copy.gallery.viewOn}
                        <ArrowUpRight className="size-3.5" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          ) : null}
        </DialogPortal>
      </Dialog>
    </section>
  );
}

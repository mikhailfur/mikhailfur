"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, Heart, Search, X } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { SectionHead } from "@/components/site/section-head";
import {
  getDisplayRatingLabel,
  getNormalizedRating,
  isRatingCensored,
  type CivitaiImage,
} from "@/types/civitai";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
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
    <section id="gallery" className="section section--night gallery">
      <div className="wrap">
        <SectionHead
          label={copy.gallery.label}
          reading={copy.gallery.reading}
          title={copy.gallery.title}
          intro={copy.gallery.intro}
          aside={copy.gallery.source}
        />

        <div className="gallery__toolbar">
          <div className="gallery__filters" role="group" aria-label={copy.gallery.title}>
            {(["all", "sfw", "nsfw"] as const).map((item) => (
              <button
                key={item}
                type="button"
                className="filter-tab"
                aria-pressed={filter === item}
                onClick={() => {
                  if (item === "nsfw" && !ageVerified) {
                    setGateOpen(true);
                    return;
                  }
                  setFilter(item);
                }}
              >
                {item === "all" ? copy.gallery.all : item === "sfw" ? copy.gallery.sfw : copy.gallery.nsfw}
                {item === "nsfw" ? ` (${nsfwCount})` : ""}
              </button>
            ))}
            {ageVerified ? (
              <button type="button" className="filter-tab" onClick={lock}>
                {copy.gallery.relock}
              </button>
            ) : nsfwCount > 0 ? (
              <button type="button" className="filter-tab" onClick={() => setGateOpen(true)}>
                {copy.gallery.unlock}
              </button>
            ) : null}
          </div>

          <label className="gallery__search">
            <Search width={13} height={13} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.gallery.search}
              aria-label={copy.gallery.search}
            />
          </label>
        </div>

        {!ageVerified && nsfwCount > 0 ? (
          <div className="gallery__gate">
            <div className="gallery__gate-copy">
              <span className="hanko" aria-hidden="true">
                秘
              </span>
              <div>
                <h3>{copy.gallery.gateTitle}</h3>
                <p>{copy.gallery.gateCopy}</p>
              </div>
            </div>
            <div className="gallery__gate-actions">
              <button className="btn btn--night btn--small" type="button" onClick={() => setGateOpen(false)}>
                {copy.gallery.gateCancel}
              </button>
              <button className="btn btn--night-rose btn--small" type="button" onClick={unlock}>
                {copy.gallery.gateButton}
              </button>
            </div>
          </div>
        ) : null}

        {loading ? (
          <p className="gallery__state">{copy.gallery.loading}</p>
        ) : error ? (
          <p className="gallery__state">{copy.gallery.error}</p>
        ) : filtered.length === 0 ? (
          <p className="gallery__state">{copy.gallery.empty}</p>
        ) : (
          <div className="gallery__grid">
            {filtered.map((image) => {
              const censored = isRatingCensored(image);
              const blurred = censored && !ageVerified;
              const rating = getNormalizedRating(image);
              return (
                <button
                  className="gallery-card"
                  type="button"
                  key={image.id}
                  onClick={() => openCard(image)}
                  aria-label={`${copy.gallery.open}: ${image.meta?.prompt || image.id}`}
                >
                  {image.type === "video" ? (
                    <video src={image.url} muted loop playsInline autoPlay preload="metadata" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={image.url} alt={image.meta?.prompt || `Civitai artwork ${image.id}`} loading="lazy" referrerPolicy="no-referrer" />
                  )}
                  <span className="gallery-card__shade" aria-hidden="true" />
                  {blurred ? (
                    <span className="gallery-card__blur">
                      <span className="hanko hanko--small" aria-hidden="true">
                        秘
                      </span>
                    </span>
                  ) : null}
                  <span className={`gallery-card__badge${censored ? " gallery-card__badge--mature" : ""}`}>
                    {getDisplayRatingLabel(rating)}
                  </span>
                  <span className="gallery-card__body">
                    <span className="gallery-card__prompt">
                      {image.meta?.prompt || copy.gallery.noPrompt}
                    </span>
                    <span className="gallery-card__meta">
                      <span>#{image.id}</span>
                      <span>
                        <Heart width={10} height={10} style={{ display: "inline", marginRight: 3 }} aria-hidden="true" />
                        {image.stats?.heartCount || image.stats?.likeCount || 0}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        <div className="gallery__foot">
          <span>
            {filtered.length} / {images.length}
          </span>
          {cursor ? (
            <button
              className="btn btn--night btn--small"
              type="button"
              onClick={() => void load(cursor)}
              disabled={loadingMore}
            >
              {loadingMore ? copy.common.loading : copy.gallery.loadMore}
            </button>
          ) : null}
        </div>
      </div>

      <Dialog open={gateOpen} onOpenChange={setGateOpen}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent className="archive" aria-describedby={undefined} style={{ maxWidth: 460 }}>
            <div className="archive__head">
              <div>
                <DialogTitle asChild>
                  <h2>{copy.gallery.gateTitle}</h2>
                </DialogTitle>
                <p className="archive__sub">{copy.gallery.gateCopy}</p>
              </div>
              <button className="icon-btn" type="button" onClick={() => setGateOpen(false)} aria-label={copy.common.close}>
                <X width={18} height={18} />
              </button>
            </div>
            <div className="gallery__gate-actions" style={{ marginTop: "1.4rem" }}>
              <button className="btn btn--small" type="button" onClick={() => setGateOpen(false)}>
                {copy.gallery.gateCancel}
              </button>
              <button className="btn btn--rose btn--small" type="button" onClick={unlock}>
                {copy.gallery.gateButton}
              </button>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogPortal>
          <DialogOverlay className="lightbox-overlay" />
          {selected ? (
            <DialogContent className="lightbox-scroll" aria-describedby={undefined}>
              <div className="lightbox">
              <div className={`lightbox__media${isRatingCensored(selected) && !ageVerified ? " lightbox__media--blurred" : ""}`}>
                {selected.type === "video" ? (
                  <video src={selected.url} controls loop playsInline autoPlay />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.url} alt={selected.meta?.prompt || `Civitai artwork ${selected.id}`} referrerPolicy="no-referrer" />
                )}
              </div>
              <div className="lightbox__info">
                <div className="lightbox__top">
                  <div>
                    <p className="lightbox__id">#{selected.id}</p>
                    <p className="lightbox__rating">{getDisplayRatingLabel(getNormalizedRating(selected))}</p>
                  </div>
                  <button className="lightbox__close" type="button" onClick={() => setSelected(null)} aria-label={copy.gallery.close}>
                    <X width={16} height={16} />
                  </button>
                </div>
                <DialogTitle asChild>
                  <h3>{copy.gallery.detail}</h3>
                </DialogTitle>

                <div className="lightbox__prompt-label">
                  <span>{copy.gallery.prompt}</span>
                  {selected.meta?.prompt ? (
                    <button className="lightbox__copy" type="button" onClick={() => void copyPrompt(selected.meta?.prompt || "")}>
                      {copied ? <Check width={11} height={11} style={{ display: "inline", marginRight: 3 }} /> : <Copy width={11} height={11} style={{ display: "inline", marginRight: 3 }} />}
                      {copied ? copy.gallery.copied : copy.gallery.copy}
                    </button>
                  ) : null}
                </div>
                <p className="lightbox__prompt">{selected.meta?.prompt || copy.gallery.noPrompt}</p>

                {selected.meta?.negativePrompt ? (
                  <>
                    <div className="lightbox__prompt-label">{copy.gallery.negativePrompt}</div>
                    <p className="lightbox__prompt">{selected.meta.negativePrompt}</p>
                  </>
                ) : null}

                {specs.length ? (
                  <dl className="lightbox__specs">
                    {specs.map((spec) => (
                      <div className="lightbox__spec" key={spec.label}>
                        <dt>{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}

                <div className="lightbox__actions">
                  <a className="btn btn--small" href={`https://civitai.com/images/${selected.id}`} target="_blank" rel="noreferrer">
                    {copy.gallery.viewOn}
                    <ArrowUpRight width={13} height={13} />
                  </a>
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

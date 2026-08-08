"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { CivitaiImage, getNormalizedRating, getDisplayRatingLabel, isRatingCensored } from "@/types/civitai";
import { ui } from "@/data/site-content";
import { Language } from "@/types/portfolio";
import { playBeepSound, playSuccessSound, playKeyClickSound } from "@/utils/sfx";

interface GallerySectionProps {
  language: Language;
}

export function GallerySection({ language }: GallerySectionProps) {
  const t = ui[language] || ui.en;
  const [images, setImages] = useState<CivitaiImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Age verification state
  const [isAgeVerified, setIsAgeVerified] = useState<boolean>(false);

  // Filter & Search states
  const [ratingFilter, setRatingFilter] = useState<"all" | "sfw" | "nsfw">("all");
  const [sort, setSort] = useState<"Newest" | "Most Reactions" | "Oldest">("Newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Modal Lightbox state & Full Archive Drawer state
  const [selectedImage, setSelectedImage] = useState<CivitaiImage | null>(null);
  const [fullArchiveOpen, setFullArchiveOpen] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read initial age verification status
  useEffect(() => {
    try {
      const stored = localStorage.getItem("civitai_age_verified_19");
      if (stored === "true") {
        setIsAgeVerified(true);
      }
    } catch {
      // LocalStorage fallback
    }
  }, []);

  // Close custom dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleVerifyAge = () => {
    playSuccessSound();
    setIsAgeVerified(true);
    try {
      localStorage.setItem("civitai_age_verified_19", "true");
    } catch {
      // LocalStorage fallback
    }
  };

  const handleToggleAge = () => {
    playBeepSound();
    const nextState = !isAgeVerified;
    setIsAgeVerified(nextState);
    try {
      localStorage.setItem("civitai_age_verified_19", String(nextState));
    } catch {
      // LocalStorage fallback
    }
  };

  // Fetch images from API
  const fetchImages = useCallback(async (cursorParam?: string, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const query = new URLSearchParams({
        limit: "40",
        sort: sort,
      });

      if (cursorParam) {
        query.append("cursor", cursorParam);
      }

      const response = await fetch(`/api/civitai?${query.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const newItems: CivitaiImage[] = data.items || [];

      if (isInitial) {
        setImages(newItems);
      } else {
        setImages((prev) => [...prev, ...newItems]);
      }

      setNextCursor(data.metadata?.nextCursor || null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error loading gallery";
      setError(msg);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [sort]);

  useEffect(() => {
    fetchImages(undefined, true);
  }, [fetchImages]);

  // Image counts for tabs
  const sfwCount = images.filter((item) => !isRatingCensored(item)).length;
  const nsfwCount = images.filter((item) => isRatingCensored(item)).length;

  // Filtered & Searched list
  const filteredImages = images.filter((item) => {
    const isCensored = isRatingCensored(item);
    
    // 19+ adult artworks (X/XXX) ONLY appear under the "nsfw" (19+) tab
    if (ratingFilter === "all" && isCensored) return false;
    if (ratingFilter === "sfw" && isCensored) return false;
    if (ratingFilter === "nsfw" && !isCensored) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const promptMatch = item.meta?.prompt?.toLowerCase().includes(q);
      const modelMatch = item.baseModel?.toLowerCase().includes(q);
      const idMatch = String(item.id).includes(q);
      if (!promptMatch && !modelMatch && !idMatch) return false;
    }

    return true;
  });

  // Main page preview slice (6 items max to match other section heights)
  const previewImages = filteredImages.slice(0, 6);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    playSuccessSound();
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const sortOptions = [
    { value: "Newest", label: t.sortNewest || "NEWEST" },
    { value: "Most Reactions", label: t.sortReactions || "REACTIONS" },
    { value: "Oldest", label: t.sortOldest || "OLDEST" },
  ] as const;

  const renderCard = (item: CivitaiImage) => {
    const rating = getNormalizedRating(item);
    const isCensored = isRatingCensored(item);
    const shouldBlur = isCensored && !isAgeVerified;
    const ratingLabel = getDisplayRatingLabel(rating);

    return (
      <div
        key={item.id}
        className={`gallery-card ${shouldBlur ? "is-blurred" : ""}`}
        onMouseEnter={() => playKeyClickSound()}
        onClick={() => {
          if (shouldBlur) {
            handleVerifyAge();
          } else {
            playSuccessSound();
            setSelectedImage(item);
          }
        }}
      >
        <div className="gallery-card-media">
          {item.type === "video" ? (
            <video
              src={item.url}
              autoPlay
              muted
              loop
              playsInline
              className={shouldBlur ? "blurred-media" : ""}
            />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={item.url}
              alt={item.meta?.prompt || `Civitai Artwork ${item.id}`}
              loading="lazy"
              referrerPolicy="no-referrer"
              className={shouldBlur ? "blurred-media" : ""}
            />
          )}

          {/* Terminal Style Censorship Overlay */}
          {shouldBlur && (
            <div className="censored-overlay" onClick={(e) => e.stopPropagation()}>
              <div className="censored-overlay-box">
                <span className="censored-icon">🔞</span>
                <span className="censored-badge">{t.censoredBadge || "19+ RESTRICTED"}</span>
                <h4 className="censored-title">
                  {t.censoredCardTitle || "19+ RESTRICTED ARTWORK"}
                </h4>
                <p className="censored-sub">
                  {t.censoredCardSubtitle || "Confirm age threshold to remove blur filter"}
                </p>
                <button
                  type="button"
                  className="button button-primary age-verify-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVerifyAge();
                  }}
                >
                  [✓] {t.ageButton || "Мне больше 19 лет"}
                </button>
              </div>
            </div>
          )}

          {/* Terminal Rating Badge */}
          <span className={`rating-pill rating-${rating.toLowerCase()}`}>
            [{ratingLabel}]
          </span>

          {item.baseModel && (
            <span className="model-pill">
              {item.baseModel}
            </span>
          )}
        </div>

        <div className="gallery-card-info">
          <div className="gallery-card-meta">
            <span className="gallery-id">#{item.id}</span>
            {item.stats && (
              <span className="gallery-stats">
                ❤️ {item.stats.heartCount || item.stats.likeCount || 0}
              </span>
            )}
          </div>
          {item.meta?.prompt ? (
            <p className="gallery-prompt-preview">{item.meta.prompt}</p>
          ) : (
            <p className="gallery-prompt-preview muted-prompt">{t.noPrompt || "No prompt provided"}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="gallery" className="shell gallery-section">
      <div className="terminal-frame">
        <div className="terminal-frame-bar">
          <span className="terminal-frame-controls" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className="terminal-frame-title">CIVITAI_VAULT :: /gallery</span>
          <span className="terminal-frame-actions">
            <span className="gallery-count-badge">
              {filteredImages.length} {language === "ru" ? "АРТОВ" : language === "ko" ? "작품" : "ARTWORKS"}
            </span>
          </span>
        </div>

        <div className="terminal-frame-content">
          <header className="section-head">
            <div>
              <span className="section-icon">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </span>
              <h2>{t.galleryTitle || "Civitai Works Gallery"}</h2>
            </div>
            <p>{t.galleryDescription || "Automated artwork feed from civitai.red API"}</p>
          </header>

          {/* Terminal Toolbar */}
          <div className="gallery-toolbar">
            <div className="gallery-toolbar-left">
              {/* Search Bar */}
              <div className="project-search-box">
                <span>&gt;_</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    playKeyClickSound();
                    setSearchQuery(e.target.value);
                  }}
                  placeholder={t.searchPlaceholder || "Filter by prompt or model..."}
                />
                {searchQuery && (
                  <button
                    type="button"
                    style={{ background: "none", border: 0, color: "var(--muted)", cursor: "pointer" }}
                    onClick={() => {
                      playBeepSound();
                      setSearchQuery("");
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="project-filter-pills">
                <button
                  type="button"
                  className={`project-pill ${ratingFilter === "all" ? "active" : ""}`}
                  onClick={() => {
                    playBeepSound(600, 0.03);
                    setRatingFilter("all");
                  }}
                >
                  {t.filterAll || "ALL"} ({sfwCount})
                </button>
                <button
                  type="button"
                  className={`project-pill ${ratingFilter === "sfw" ? "active" : ""}`}
                  onClick={() => {
                    playBeepSound(600, 0.03);
                    setRatingFilter("sfw");
                  }}
                >
                  {t.filterSfw || "PG / PG-13 / R"} ({sfwCount})
                </button>
                <button
                  type="button"
                  className={`project-pill ${ratingFilter === "nsfw" ? "active" : ""}`}
                  onClick={() => {
                    playBeepSound(600, 0.03);
                    setRatingFilter("nsfw");
                  }}
                >
                  {t.filterNsfw || "🔞 19+"} ({nsfwCount})
                </button>
              </div>
            </div>

            <div className="gallery-toolbar-right">
              {/* Terminal Sort Dropdown */}
              <div className="custom-dropdown" ref={dropdownRef}>
                <button
                  type="button"
                  className="dropdown-trigger-btn"
                  onClick={() => {
                    playBeepSound();
                    setSortDropdownOpen((prev) => !prev);
                  }}
                >
                  <span>{t.sortLabel || "SORT:"} {sortOptions.find((o) => o.value === sort)?.label}</span>
                  <span className="dropdown-arrow">▼</span>
                </button>

                {sortDropdownOpen && (
                  <div className="dropdown-menu">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`dropdown-menu-item ${sort === opt.value ? "active" : ""}`}
                        onClick={() => {
                          playBeepSound();
                          setSort(opt.value as "Newest" | "Most Reactions" | "Oldest");
                          setSortDropdownOpen(false);
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Age Status Toggle */}
              <button
                type="button"
                className={`age-status-btn ${isAgeVerified ? "verified" : "unverified"}`}
                onClick={handleToggleAge}
              >
                <span className="age-status-dot" />
                {isAgeVerified ? (
                  <span>🔞 {t.ageVerifiedActive || "19+ UNLOCKED"}</span>
                ) : (
                  <span>🔞 {t.ageButton || "Мне больше 19 лет"}</span>
                )}
              </button>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="gallery-skeleton-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="gallery-skeleton-card" />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="gallery-error">
              <p>⚠️ {error}</p>
              <button
                type="button"
                className="button button-primary"
                onClick={() => fetchImages(undefined, true)}
              >
                RETRY
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredImages.length === 0 && (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--muted)", fontSize: "12px" }}>
              {t.noImages || "No artworks match your search query."}
            </div>
          )}

          {/* Preview Grid (6 Items max to match other sections) */}
          {!loading && !error && previewImages.length > 0 && (
            <div className="gallery-grid">
              {previewImages.map(renderCard)}
            </div>
          )}

          {/* Link to Open Full Gallery Modal */}
          {!loading && !error && filteredImages.length > 0 && (
            <button
              type="button"
              className="all-link archive-link"
              onClick={() => {
                playBeepSound();
                setFullArchiveOpen(true);
              }}
              style={{ marginTop: "24px" }}
            >
              {t.openFullGallery || "Open Full Gallery (Civitai Vault)"} →
            </button>
          )}
        </div>
      </div>

      {/* Full Gallery Drawer / Archive Modal */}
      {fullArchiveOpen && (
        <div
          className="article-reader document-reader"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setFullArchiveOpen(false);
          }}
        >
          <button
            type="button"
            className="reader-close"
            onClick={() => {
              playBeepSound();
              setFullArchiveOpen(false);
            }}
          >
            {t.close || "Close"} <span>Esc</span>
          </button>

          <section className="archive-sheet" style={{ maxWidth: "1200px" }}>
            <header>
              <span>{t.fullGalleryTitle || "CIVITAI ARTWORK VAULT"}</span>
              <span>{filteredImages.length} {language === "ru" ? "АРТОВ" : language === "ko" ? "작품" : "ITEMS"}</span>
            </header>

            <p className="reader-path">/gallery/all</p>
            <h1>{t.galleryTitle || "Civitai Works Gallery"}</h1>
            <p>{t.fullGallerySubtitle || "Complete collection of AI artworks fetched via civitai.red API"}</p>

            <div className="gallery-grid" style={{ marginTop: "28px" }}>
              {filteredImages.map(renderCard)}
            </div>

            {nextCursor && (
              <div style={{ marginTop: "36px", textAlign: "center" }}>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={loadingMore}
                  onClick={() => fetchImages(nextCursor, false)}
                >
                  {loadingMore ? "LOADING..." : (t.loadMore || "Загрузить ещё арты")}
                </button>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Artwork Lightbox Modal */}
      {selectedImage && (
        <div
          className="gallery-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="gallery-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="reader-close"
              onClick={() => {
                playBeepSound();
                setSelectedImage(null);
              }}
            >
              {t.close || "Close"} <span>Esc</span>
            </button>

            <div className="gallery-modal-body">
              <div className="gallery-modal-media">
                {selectedImage.type === "video" ? (
                  <video src={selectedImage.url} controls autoPlay loop />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.meta?.prompt || "Artwork"}
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>

              <div className="gallery-modal-details">
                <header className="modal-details-head">
                  <span className={`rating-pill rating-${getNormalizedRating(selectedImage).toLowerCase()}`}>
                    [{getDisplayRatingLabel(getNormalizedRating(selectedImage))}]
                  </span>
                  <span className="modal-date">
                    {new Date(selectedImage.createdAt).toLocaleDateString()}
                  </span>
                </header>

                <h3 className="modal-title">
                  Civitai Artwork #{selectedImage.id}
                </h3>

                <a
                  href={`https://civitai.red/images/${selectedImage.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="button button-primary civitai-link-btn"
                  onClick={() => playKeyClickSound()}
                >
                  🌐 {t.viewOnCivitai || "Открыть на Civitai.red"} ↗
                </a>

                {selectedImage.meta?.prompt && (
                  <div className="modal-prompt-box">
                    <div className="modal-prompt-head">
                      <strong>{t.promptLabel || "PROMPT:"}</strong>
                      <button
                        type="button"
                        className="copy-btn"
                        onClick={() => copyToClipboard(selectedImage.meta?.prompt || "")}
                      >
                        {copiedPrompt ? (t.promptCopied || "COPIED!") : (t.copyPrompt || "COPY")}
                      </button>
                    </div>
                    <p className="modal-prompt-text">{selectedImage.meta.prompt}</p>
                  </div>
                )}

                {selectedImage.meta?.negativePrompt && (
                  <div className="modal-prompt-box negative">
                    <strong>{t.negPromptLabel || "NEGATIVE PROMPT:"}</strong>
                    <p className="modal-prompt-text">{selectedImage.meta.negativePrompt}</p>
                  </div>
                )}

                <div className="modal-params-grid">
                  {selectedImage.baseModel && (
                    <div>
                      <span>{t.baseModel || "BASE MODEL"}</span>
                      <strong>{selectedImage.baseModel}</strong>
                    </div>
                  )}
                  {selectedImage.meta?.sampler && (
                    <div>
                      <span>{t.sampler || "SAMPLER"}</span>
                      <strong>{String(selectedImage.meta.sampler)}</strong>
                    </div>
                  )}
                  {selectedImage.meta?.steps !== undefined && (
                    <div>
                      <span>{t.steps || "STEPS"}</span>
                      <strong>{String(selectedImage.meta.steps)}</strong>
                    </div>
                  )}
                  {selectedImage.meta?.cfgScale !== undefined && (
                    <div>
                      <span>{t.cfgScale || "CFG SCALE"}</span>
                      <strong>{String(selectedImage.meta.cfgScale)}</strong>
                    </div>
                  )}
                  {selectedImage.meta?.seed !== undefined && (
                    <div>
                      <span>{t.seed || "SEED"}</span>
                      <strong>{String(selectedImage.meta.seed)}</strong>
                    </div>
                  )}
                  <div>
                    <span>{t.resolution || "RESOLUTION"}</span>
                    <strong>{selectedImage.width} × {selectedImage.height}</strong>
                  </div>
                </div>

                {selectedImage.stats && (
                  <div className="modal-stats-row">
                    <span>❤️ {selectedImage.stats.heartCount || 0}</span>
                    <span>👍 {selectedImage.stats.likeCount || 0}</span>
                    <span>💬 {selectedImage.stats.commentCount || 0}</span>
                    <span>😂 {selectedImage.stats.laughCount || 0}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

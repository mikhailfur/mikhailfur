"use client";

import type { KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { SnakeGame } from "@/components/arcade/snake-game";
import { WallzGame } from "@/components/arcade/wallz-game";
import { StrangerChat } from "@/components/arcade/stranger-chat";
import type { ArcadeTab } from "@/components/site/play";

const KANJI: Record<ArcadeTab, string> = {
  snake: "蛇",
  wallz: "壁",
  chat: "話",
};

export function ArcadeModal({
  tab,
  onTabChange,
  onClose,
}: {
  tab: ArcadeTab | null;
  onTabChange: (tab: ArcadeTab) => void;
  onClose: () => void;
}) {
  const copy = useCopy();
  const { language } = useLanguage();
  const active = tab ?? "snake";
  const items = copy.play.items;

  const handleTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const current = items.findIndex((item) => item.id === active);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? items.length - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length;
    const nextId = items[nextIndex].id as ArcadeTab;
    onTabChange(nextId);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-tab="${nextId}"]`)?.focus();
  };

  return (
    <Dialog open={Boolean(tab)} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="arcade-overlay" />
        {tab ? (
          <DialogContent className="arcade-scroll" aria-describedby={undefined} hideClose>
            <div className="arcade-modal">
              <div className="arcade-modal__head">
                <div className="arcade-modal__brand">
                  <span className="arcade-modal__kanji" aria-hidden="true">遊</span>
                  <div>
                    <span className="arcade-modal__eyebrow">arcade · 遊び</span>
                    <DialogTitle asChild>
                      <strong className="arcade-modal__title">{copy.play.arcadeTitle}</strong>
                    </DialogTitle>
                  </div>
                </div>

                <div
                  className="arcade-modal__tabs"
                  role="tablist"
                  aria-label={copy.play.arcadeTitle}
                  onKeyDown={handleTabsKeyDown}
                >
                  {items.map((item, index) => {
                    const id = item.id as ArcadeTab;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        id={`arcade-tab-${id}`}
                        data-tab={id}
                        aria-selected={id === active}
                        aria-controls={`arcade-panel-${id}`}
                        tabIndex={id === active ? 0 : -1}
                        className="arcade-tab"
                        onClick={() => onTabChange(id)}
                      >
                        <span className="arcade-tab__kanji" aria-hidden="true">{KANJI[id]}</span>
                        <span className="arcade-tab__label">{item.title}</span>
                        <span className="arcade-tab__index" aria-hidden="true">0{index + 1}</span>
                      </button>
                    );
                  })}
                </div>

                <button
                  className="arcade-modal__close"
                  type="button"
                  onClick={onClose}
                  aria-label={copy.play.close}
                >
                  <X width={16} height={16} />
                </button>
              </div>

              <div
                className="arcade-modal__body"
                id={`arcade-panel-${active}`}
                role="tabpanel"
                aria-labelledby={`arcade-tab-${active}`}
              >
                {active === "snake" ? <SnakeGame language={language} /> : null}
                {active === "wallz" ? <WallzGame language={language} /> : null}
                {active === "chat" ? <StrangerChat language={language} embedded /> : null}
              </div>
            </div>
          </DialogContent>
        ) : null}
      </DialogPortal>
    </Dialog>
  );
}

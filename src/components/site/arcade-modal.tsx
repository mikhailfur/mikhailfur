"use client";

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
  const activeItem = items.find((item) => item.id === active);

  return (
    <Dialog open={Boolean(tab)} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="arcade-overlay" />
        {tab ? (
          <DialogContent className="arcade-scroll" aria-describedby={undefined}>
            <div className="arcade-modal">
              <div className="arcade-modal__head">
                <div className="arcade-modal__title">
                  <span className="jp" aria-hidden="true">
                    {KANJI[active]}
                  </span>
                  <DialogTitle asChild>
                    <strong>{activeItem?.title ?? copy.play.title}</strong>
                  </DialogTitle>
                </div>

                <div className="arcade-modal__tabs" role="tablist" aria-label={copy.play.title}>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      className="arcade-tab"
                      aria-selected={item.id === active}
                      onClick={() => onTabChange(item.id as ArcadeTab)}
                    >
                      {item.title}
                    </button>
                  ))}
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

              <div className="arcade-modal__body">
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

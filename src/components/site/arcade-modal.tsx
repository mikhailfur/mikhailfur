"use client";

import { X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SnakeGame } from "@/components/arcade/snake-game";
import { WallzGame } from "@/components/arcade/wallz-game";
import { StrangerChat } from "@/components/arcade/stranger-chat";
import type { ArcadeTab } from "@/components/site/play";
import { ARCADE_ICONS, SiteIcon } from "@/components/icons";

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

  return (
    <Dialog open={Boolean(tab)} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        {tab ? (
          <DialogContent
            className="flex max-h-[min(90svh,900px)] max-w-5xl flex-col overflow-hidden p-0"
            aria-describedby={undefined}
            hideClose
          >
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-md bg-rose text-white">
                  <SiteIcon name="gamepad" className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                    arcade · play
                  </span>
                  <DialogTitle asChild>
                    <strong className="block text-sm tracking-[-0.01em]">{copy.play.arcadeTitle}</strong>
                  </DialogTitle>
                </div>
              </div>

              <Tabs
                className="order-3 w-full sm:order-none sm:ml-auto sm:w-auto"
                value={active}
                onValueChange={(value) => onTabChange(value as ArcadeTab)}
              >
                <TabsList className="h-8 w-full sm:w-auto">
                  {items.map((item) => {
                    const id = item.id as ArcadeTab;
                    return (
                      <TabsTrigger
                        key={item.id}
                        value={id}
                        className="h-7 flex-1 gap-1.5 sm:flex-none"
                        aria-label={item.title}
                      >
                        <SiteIcon name={ARCADE_ICONS[id]} className="size-3" aria-hidden="true" />
                        <span>{item.title}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-auto sm:ml-0"
                type="button"
                onClick={onClose}
                aria-label={copy.play.close}
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
              {active === "snake" ? <SnakeGame language={language} /> : null}
              {active === "wallz" ? <WallzGame language={language} /> : null}
              {active === "chat" ? <StrangerChat language={language} embedded /> : null}
            </div>
          </DialogContent>
        ) : null}
      </DialogPortal>
    </Dialog>
  );
}

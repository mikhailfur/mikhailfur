"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetPortal = DialogPrimitive.Portal;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

export const SheetOverlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn("fixed inset-0 z-[100] bg-[rgba(21,17,20,0.36)] backdrop-blur-[3px]", className)}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

export const SheetContent = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { hideClose?: boolean }
>(({ className, children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    data-slot="sheet-content"
    className={cn(
      "fixed inset-x-0 top-0 z-[101] flex h-dvh flex-col overflow-y-auto border-b border-border bg-background p-5 outline-none",
      "data-[state=open]:animate-[fade-up_180ms_cubic-bezier(0.16,1,0.3,1)]",
      className,
    )}
    {...props}
  >
    {children}
    {hideClose ? null : (
      <DialogPrimitive.Close
        className="absolute right-4 top-4 inline-grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Close"
      >
        <X className="size-4" />
      </DialogPrimitive.Close>
    )}
  </DialogPrimitive.Content>
));
SheetContent.displayName = "SheetContent";

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ImagePlus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { playBeepSound, playSuccessSound } from "@/utils/sfx";

type Role = "user" | "assistant" | "system";

type Message = {
  role: Role;
  content: string;
  image?: string;
  audioUrl?: string;
  timestamp: string;
  errorCode?: string;
};

const STORAGE_KEY = "mikhailfur.miyabi.history";

function timeLabel() {
  return new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date());
}

export function Miyabi({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const copy = useCopy();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const streamRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      // Start clean.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage can be unavailable.
    }
  }, [messages]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [open]);

  useEffect(() => {
    const node = streamRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loading]);

  const clear = () => {
    setMessages([]);
    setNotice("");
    setImage(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
    playBeepSound();
  };

  const readFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setNotice(copy.miyabi.imageHint);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !image) || loading) return;

    if (text.toLowerCase() === "/clear") {
      setInput("");
      clear();
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: text,
      image: image || undefined,
      timestamp: timeLabel(),
    };

    const next = [...messages, userMessage];
    setMessages(next);
    setInput("");
    setImage(null);
    setNotice("");
    setLoading(true);
    playSuccessSound();

    try {
      const response = await fetch("/api/miyabi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .filter((message) => message.role !== "system")
            .map((message) => ({ role: message.role, content: message.content, image: message.image })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const code = data.code as string | undefined;
        const mapped =
          code === "DAILY_LIMIT_REACHED"
            ? copy.miyabi.limitDaily
            : code === "HOURLY_LIMIT_REACHED"
              ? copy.miyabi.limitHourly
              : code === "TOKEN_LIMIT_REACHED"
                ? copy.miyabi.limitToken
                : data.error || copy.miyabi.errorGeneric;
        setMessages((current) => [
          ...current,
          { role: "system", content: mapped, errorCode: code, timestamp: timeLabel() },
        ]);
        return;
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply || "…",
          audioUrl: data.audioUrl || undefined,
          timestamp: timeLabel(),
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "system", content: copy.miyabi.errorGeneric, timestamp: timeLabel() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-40">
        <Button
          className="size-11 rounded-full border-border bg-background p-0 shadow-[0_12px_30px_-12px_rgba(21,17,20,0.4)] hover:bg-card"
          variant="outline"
          size="icon"
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label={copy.miyabi.open}
          title={copy.miyabi.open}
        >
          <Sparkles className="size-5 text-rose" aria-hidden="true" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent
            className="flex h-[min(82svh,680px)] max-w-md flex-col overflow-hidden p-0"
            aria-describedby={undefined}
            hideClose
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-blush text-rose">
                  <Sparkles className="size-5" aria-hidden="true" />
                </span>
                <span className="grid min-w-0 leading-tight">
                  <DialogTitle asChild>
                    <strong className="truncate text-sm tracking-[-0.01em]">{copy.miyabi.title}</strong>
                  </DialogTitle>
                  <span className="truncate text-[11px] text-muted-foreground">{copy.miyabi.subtitle}</span>
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={clear}
                  title={copy.miyabi.clear}
                  aria-label={copy.miyabi.clear}
                >
                  <RotateCcw className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  title={copy.miyabi.close}
                  aria-label={copy.miyabi.close}
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4" ref={streamRef}>
              {messages.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/25 p-4 text-sm leading-relaxed text-muted-foreground">
                  {copy.miyabi.greeting}
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div
                  className={`flex flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}
                  key={`${message.role}-${index}-${message.timestamp}`}
                >
                  <span className="px-1 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                    {message.role === "assistant" ? "MIYABI" : message.role === "user" ? "you" : "system"}
                    <span className="ml-1.5 opacity-60">{message.timestamp}</span>
                  </span>
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[85%] rounded-lg rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                        : message.role === "system"
                          ? "max-w-[90%] rounded-lg border border-rose/20 bg-blush px-3 py-2 text-sm text-rose-deep"
                          : "max-w-[85%] rounded-lg rounded-tl-sm bg-muted px-3 py-2 text-sm text-foreground"
                    }
                  >
                    {message.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="mb-2 max-h-56 w-full rounded-md object-cover" src={message.image} alt="" />
                    ) : null}
                    <span className="whitespace-pre-wrap">{message.content}</span>
                  </div>
                  {message.audioUrl ? (
                    <audio className="mt-1 w-full max-w-[85%]" src={message.audioUrl} controls preload="metadata" />
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground" aria-live="polite">
                  {copy.miyabi.thinking}
                  <span className="inline-flex gap-0.5">
                    <i className="size-1 animate-bounce rounded-full bg-rose [animation-delay:-0.2s]" />
                    <i className="size-1 animate-bounce rounded-full bg-rose [animation-delay:-0.1s]" />
                    <i className="size-1 animate-bounce rounded-full bg-rose" />
                  </span>
                </div>
              ) : null}
            </div>

            <div className="border-t border-border p-3">
              {notice ? (
                <p className="mb-2 rounded-md border border-rose/20 bg-blush px-2.5 py-1.5 text-[11px] text-rose-deep">
                  {notice}
                </p>
              ) : null}
              {image ? (
                <div className="mb-2 flex items-center gap-2 rounded-md border border-border bg-muted/40 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={copy.miyabi.attached} className="size-10 rounded object-cover" />
                  <span className="text-[11px] text-muted-foreground">{copy.miyabi.attached}</span>
                  <Button
                    className="ml-auto"
                    variant="ghost"
                    size="icon-sm"
                    type="button"
                    onClick={() => setImage(null)}
                    aria-label={copy.miyabi.remove}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ) : null}

              <div className="flex items-end gap-1.5 rounded-lg border border-input bg-background p-1.5 focus-within:border-rose/60 focus-within:ring-2 focus-within:ring-ring/15">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      void send();
                    }
                  }}
                  placeholder={copy.miyabi.placeholder}
                  rows={1}
                  aria-label={copy.miyabi.placeholder}
                  className="max-h-32 min-h-9 flex-1 resize-none bg-transparent px-1 py-2 text-sm outline-none placeholder:text-muted-foreground/70"
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  title={copy.miyabi.attach}
                  aria-label={copy.miyabi.attach}
                >
                  <ImagePlus className="size-4" />
                </Button>
                <Button
                  variant="default"
                  size="icon-sm"
                  type="button"
                  onClick={() => void send()}
                  disabled={loading || (!input.trim() && !image)}
                  aria-label={copy.miyabi.send}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) readFile(file);
                    event.target.value = "";
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground">{copy.miyabi.note}</span>
                <Button variant="ghost" size="xs" type="button" onClick={clear} aria-label={copy.miyabi.reset}>
                  <RotateCcw className="size-3" />
                  {copy.miyabi.reset}
                </Button>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}

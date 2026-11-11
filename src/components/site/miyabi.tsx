"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ImagePlus, RotateCcw, Trash2, X } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { KitsuneMark } from "@/components/brand/kitsune-mark";
import { Dialog, DialogContent, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
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
      <div className="miyabi-dock">
        <span className="miyabi-dock__label">ミヤビ · AI</span>
        <button
          className="miyabi-dock__button"
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label={copy.miyabi.open}
        >
          <span className="miyabi-dock__pulse" aria-hidden="true" />
          <KitsuneMark size={27} />
        </button>
      </div>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogPortal>
          <DialogOverlay className="miyabi-overlay" />
          <DialogContent className="miyabi-drawer" aria-describedby={undefined}>
            <div className="miyabi-head">
              <div className="miyabi-head__identity">
                <span className="miyabi-head__mark" aria-hidden="true">
                  <KitsuneMark size={22} />
                </span>
                <span className="miyabi-head__name">
                  <DialogTitle asChild>
                    <strong>{copy.miyabi.title}</strong>
                  </DialogTitle>
                  <span>{copy.miyabi.subtitle}</span>
                </span>
              </div>
              <div className="miyabi-head__actions">
                <button
                  className="miyabi-tool"
                  type="button"
                  onClick={clear}
                  title={copy.miyabi.clear}
                  aria-label={copy.miyabi.clear}
                >
                  <RotateCcw width={14} height={14} />
                </button>
                <button
                  className="miyabi-tool"
                  type="button"
                  onClick={() => onOpenChange(false)}
                  title={copy.miyabi.close}
                  aria-label={copy.miyabi.close}
                >
                  <X width={16} height={16} />
                </button>
              </div>
            </div>

            <div className="miyabi-stream" ref={streamRef}>
              {messages.length === 0 ? (
                <div className="miyabi-intro">
                  <p>{copy.miyabi.greeting}</p>
                </div>
              ) : null}

              {messages.map((message, index) => (
                <div
                  className={`miyabi-msg miyabi-msg--${message.role}`}
                  key={`${message.role}-${index}-${message.timestamp}`}
                >
                  <span className="miyabi-msg__meta">
                    {message.role === "assistant" ? "ミヤビ" : message.role === "user" ? "you" : "system"}
                    <span>{message.timestamp}</span>
                  </span>
                  <div className="miyabi-msg__bubble">
                    {message.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="miyabi-msg__image" src={message.image} alt="" />
                    ) : null}
                    {message.content}
                  </div>
                  {message.audioUrl ? (
                    <div className="miyabi-voice">
                      <audio src={message.audioUrl} controls preload="metadata" />
                    </div>
                  ) : null}
                </div>
              ))}

              {loading ? (
                <div className="miyabi-typing" aria-live="polite">
                  {copy.miyabi.thinking}
                  <i />
                  <i />
                  <i />
                </div>
              ) : null}
            </div>

            <div className="miyabi-compose">
              {notice ? <p className="notice" style={{ marginBottom: "0.5rem", padding: "0.5rem 0.6rem" }}>{notice}</p> : null}
              {image ? (
                <div className="miyabi-attach">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={copy.miyabi.attached} />
                  <span>{copy.miyabi.attached}</span>
                  <button type="button" onClick={() => setImage(null)} aria-label={copy.miyabi.remove}>
                    <Trash2 width={13} height={13} />
                  </button>
                </div>
              ) : null}

              <div className="miyabi-input-row">
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
                />
                <button
                  type="button"
                  className="miyabi-tool"
                  onClick={() => fileRef.current?.click()}
                  title={copy.miyabi.attach}
                  aria-label={copy.miyabi.attach}
                >
                  <ImagePlus width={16} height={16} />
                </button>
                <button type="submit" onClick={() => void send()} disabled={loading || (!input.trim() && !image)} aria-label={copy.miyabi.send}>
                  <ArrowUp width={17} height={17} />
                </button>
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

              <div className="miyabi-tools">
                <span className="miyabi-tools__left">
                  <span>{copy.miyabi.note}</span>
                </span>
                <button className="miyabi-tool" type="button" onClick={clear} aria-label={copy.miyabi.reset}>
                  <RotateCcw width={13} height={13} />
                </button>
              </div>
            </div>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}

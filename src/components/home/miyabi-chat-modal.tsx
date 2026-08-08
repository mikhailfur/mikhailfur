"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ui } from "@/data/site-content";
import type { Language } from "@/types/portfolio";

type Message = {
  role: "user" | "assistant";
  content: string;
  image?: string;
  audioUrl?: string;
  timestamp: string;
};

const languageStorageKey = "terminal-blog.language";
const chatStorageKey = "miyabi_chat_history";
let storedLanguage: Language = "en";
const languageListeners = new Set<() => void>();

function readStoredLanguage(): Language {
  try {
    const value = localStorage.getItem(languageStorageKey);
    if (value === "en" || value === "ru" || value === "ko") storedLanguage = value;
  } catch {
    // Keep in-memory selection
  }
  return storedLanguage;
}

function subscribeToLanguage(listener: () => void) {
  languageListeners.add(listener);
  return () => languageListeners.delete(listener);
}

// Crisp SVG Icons (No Emojis)
function ImageIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function VolumeIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function SendIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function MicIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function CloseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TerminalPrompt() {
  return (
    <span className="cli-prompt-tag">
      <span className="cli-user">miyabi</span>
      <span className="cli-at">@</span>
      <span className="cli-host">section6</span>
      <span className="cli-colon">:</span>
      <span className="cli-path">~</span>
      <span className="cli-dollar">$</span>
    </span>
  );
}

const DIGITAL_WAVE_HEIGHTS = [
  30, 45, 75, 60, 90, 40, 85, 100, 50, 70, 95, 35, 65, 80, 45, 90, 60, 40, 75, 95,
  55, 30, 65, 85, 40, 70, 90, 50, 80, 60, 35, 75, 95, 45, 65, 85, 55, 40, 70, 90,
  60, 35, 80, 100, 50, 65, 40, 30
];

function TerminalVoicePlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDur = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDur);
    audio.addEventListener("loadeddata", updateDur);
    audio.addEventListener("durationchange", updateDur);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDur);
      audio.removeEventListener("loadeddata", updateDur);
      audio.removeEventListener("durationchange", updateDur);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentTime >= duration && duration > 0) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleWaveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveContainerRef.current || !duration) return;
    const rect = waveContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetTime = ratio * duration;
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const formatTime = (timeSec: number) => {
    if (isNaN(timeSec) || !isFinite(timeSec)) return "00:00";
    const mins = Math.floor(timeSec / 60);
    const secs = Math.floor(timeSec % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const activeIndex = duration > 0 ? Math.floor((currentTime / duration) * DIGITAL_WAVE_HEIGHTS.length) : 0;

  return (
    <div className="cli-digital-voice-box">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <button
        type="button"
        className={`cli-digital-play-btn ${isPlaying ? "playing" : ""}`}
        onClick={togglePlay}
        title={isPlaying ? "Pause" : "Play voice note"}
      >
        {isPlaying ? (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <rect x="5" y="3" width="4" height="18" rx="1" />
            <rect x="15" y="3" width="4" height="18" rx="1" />
          </svg>
        ) : (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      <div
        ref={waveContainerRef}
        className={`cli-digital-wave ${isPlaying ? "is-playing" : ""}`}
        onClick={handleWaveClick}
        title="Click anywhere on soundwave to seek"
      >
        {DIGITAL_WAVE_HEIGHTS.map((heightPercent, idx) => (
          <span
            key={idx}
            className={`cli-digital-bar ${idx <= activeIndex ? "is-active" : ""}`}
            style={{ height: `${heightPercent}%` }}
          />
        ))}
      </div>

      <span className="cli-digital-clock">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
    </div>
  );
}

export function MiyabiTerminalChat({
  onClose,
  embedded = false,
}: {
  onClose?: () => void;
  embedded?: boolean;
}) {
  const language = useSyncExternalStore<Language | null>(subscribeToLanguage, readStoredLanguage, (): null => null);
  const activeLanguage = language ?? "en";
  const t = ui[activeLanguage];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(chatStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load Miyabi chat history:", e);
    }
  }, []);

  // Save chat history to localStorage on message updates
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify(messages));
      } catch (e) {
        console.error("Failed to save Miyabi chat history:", e);
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (!embedded) {
      inputRef.current?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && onClose) onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [embedded, onClose]);

  const handleClearHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem(chatStorageKey);
    } catch {
      // ignore
    }
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const text = input.trim();

    // Check for /clear command in chat
    if (text.toLowerCase() === "/clear") {
      setInput("");
      setSelectedImage(null);
      handleClearHistory();
      const clearNotice: Message = {
        role: "assistant",
        content: t.miyabiCleared || "*fox ears twitch* History and chat context cleared.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([clearNotice]);
      try {
        localStorage.setItem(chatStorageKey, JSON.stringify([clearNotice]));
      } catch {
        // ignore
      }
      return;
    }

    if ((!text && !selectedImage) || loading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      role: "user",
      content: text,
      image: selectedImage || undefined,
      timestamp: timeStr,
    };

    const newMessages: Message[] = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const payloadMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
        image: m.image,
      }));

      const res = await fetch("/api/miyabi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "...",
          audioUrl: data.audioUrl || undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error connecting to AI API.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `*fox ears twitch* Error: ${message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className={`cli-terminal-window ${embedded ? "is-embedded" : "is-modal"}`}>
      {/* CLI Header */}
      <header className="cli-terminal-header">
        <div className="cli-header-left">
          <div className="cli-avatar-wrap">
            <Image
              src="/avatar.png"
              alt="Miyabi Avatar"
              width={26}
              height={26}
              className="cli-avatar-img"
              unoptimized
            />
          </div>
          <div className="cli-header-titles">
            <span className="cli-title">{t.miyabiTitle}</span>
            <span className="cli-badge">CLI AI Agent</span>
          </div>
        </div>

        <div className="cli-header-right">
          <div className="cli-model-indicator" title="Gemma 4 Multimodal Vision active">
            <span className="cli-pulse-dot" />
            <span className="cli-model-name">Gemma 4 Vision</span>
          </div>

          {!embedded && onClose && (
            <button className="cli-close-btn" onClick={onClose} type="button" title="Close CLI window">
              <CloseIcon size={14} />
            </button>
          )}
        </div>
      </header>

      {/* CLI Output Stream */}
      <div className="cli-terminal-stream">
        {messages.length === 0 && (
          <div className="cli-welcome-banner">
            <p className="cli-welcome-line">
              <span className="brand-mark">&gt;_</span> Hoshimi Miyabi AI Terminal Session Initialized.
            </p>
            <p className="cli-hint-line">
              Type your query or attach an image for Vision analysis. Commands: <code>/clear</code> to reset session.
            </p>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`cli-msg-block ${m.role}`}>
            {m.role === "user" ? (
              <div className="cli-user-line">
                <TerminalPrompt />
                <span className="cli-user-text">{m.content}</span>
                {m.image && (
                  <div className="cli-attached-img-box">
                    <span className="cli-img-tag">[Photo Attached]</span>
                    <img src={m.image} alt="User attachment" className="cli-msg-image" />
                  </div>
                )}
              </div>
            ) : (
              <div className="cli-assistant-block">
                <div className="cli-assistant-head">
                  <div className="cli-assistant-avatar">
                    <Image
                      src="/avatar.png"
                      alt="Miyabi"
                      width={20}
                      height={20}
                      className="cli-avatar-mini"
                      unoptimized
                    />
                  </div>
                  <span className="cli-assistant-name">Miyabi AI</span>
                  <small className="cli-msg-time">{m.timestamp}</small>
                </div>

                <div className="cli-assistant-body">{m.content}</div>

                {m.audioUrl && <TerminalVoicePlayer audioUrl={m.audioUrl} />}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="cli-msg-block assistant is-loading">
            <div className="cli-assistant-head">
              <div className="cli-assistant-avatar">
                <Image
                  src="/avatar.png"
                  alt="Miyabi"
                  width={20}
                  height={20}
                  className="cli-avatar-mini"
                  unoptimized
                />
              </div>
              <span className="cli-assistant-name">Miyabi AI</span>
              <span className="cli-status-text">{t.miyabiThinking}</span>
            </div>
            <div className="cli-typing-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Banner */}
      {selectedImage && (
        <div className="cli-image-preview-strip">
          <div className="cli-preview-thumb">
            <img src={selectedImage} alt="Attachment" />
            <button
              type="button"
              className="cli-remove-thumb"
              onClick={() => setSelectedImage(null)}
              title="Remove photo"
            >
              <CloseIcon size={12} />
            </button>
          </div>
          <span className="cli-preview-label">Image attached for Gemma 4 Vision</span>
        </div>
      )}

      {/* CLI Input Bar */}
      <form onSubmit={handleSend} className="cli-input-form">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: "none" }}
        />

        <div className="cli-input-wrapper">
          <button
            type="button"
            className="cli-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach image for vision model"
            disabled={loading}
          >
            <ImageIcon size={17} />
          </button>

          <TerminalPrompt />

          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.miyabiPlaceholder || "Ask Miyabi or type /clear to reset..."}
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <div className="cli-btn-group">
          <button
            type="submit"
            className="button button-primary cli-submit-btn"
            disabled={loading || (!input.trim() && !selectedImage)}
            title="Send (Enter)"
          >
            <SendIcon size={14} />
            <span className="cli-btn-text">{t.miyabiSend}</span>
          </button>
          <button
            type="button"
            className="button cli-clear-btn"
            onClick={handleClearHistory}
            disabled={loading}
            title="Clear history (/clear)"
          >
            <TrashIcon size={14} />
            <span className="cli-btn-text">{t.miyabiReset}</span>
          </button>
        </div>
      </form>
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <div
      className="article-reader miyabi-reader"
      role="dialog"
      aria-modal="true"
      aria-label={t.miyabiTitle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <button className="reader-close" onClick={onClose} type="button">
        {t.close} <span>Esc</span>
      </button>
      {content}
    </div>
  );
}

// Alias export for backward compatibility
export const MiyabiChatModal = MiyabiTerminalChat;

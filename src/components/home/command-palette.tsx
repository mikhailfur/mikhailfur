"use client";

import { useEffect, useRef, useState } from "react";
import { playBeepSound, playSuccessSound } from "@/utils/sfx";

interface PaletteOption {
  id: string;
  category: "Navigation" | "Terminal AI" | "Settings" | "External";
  title: string;
  subtitle?: string;
  icon?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: string) => void;
  onToggleMatrix: () => void;
  onToggleSfx: () => void;
  sfxActive: boolean;
  matrixActive: boolean;
  onSwitchTerminalMode: (mode: "shell" | "miyabi" | "store" | "admin") => void;
  onOpenArchive: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onToggleMatrix,
  onToggleSfx,
  sfxActive,
  matrixActive,
  onSwitchTerminalMode,
  onOpenArchive,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const options: PaletteOption[] = [
    {
      id: "projects",
      category: "Navigation",
      title: "View Projects & Repositories",
      subtitle: "#projects",
      icon: "📦",
      action: () => {
        onNavigate("projects");
        onClose();
      },
    },
    {
      id: "stack",
      category: "Navigation",
      title: "Explore Tech Stack & AI Lab",
      subtitle: "#stack",
      icon: "⚡",
      action: () => {
        onNavigate("stack");
        onClose();
      },
    },
    {
      id: "notes",
      category: "Navigation",
      title: "Read Field Artifacts & Notes",
      subtitle: "#notes",
      icon: "📜",
      action: () => {
        onNavigate("notes");
        onClose();
      },
    },
    {
      id: "archive",
      category: "Navigation",
      title: "Open Artifacts Archive",
      subtitle: "All published articles",
      icon: "📂",
      action: () => {
        onOpenArchive();
        onClose();
      },
    },
    {
      id: "gallery",
      category: "Navigation",
      title: "Civitai Works Gallery (AI Artworks)",
      subtitle: "#gallery",
      icon: "🎨",
      action: () => {
        onNavigate("gallery");
        onClose();
      },
    },
    {
      id: "profile",
      category: "Navigation",
      title: "About Mikhail & Profile Context",
      subtitle: "#about",
      icon: "👤",
      action: () => {
        onNavigate("about");
        onClose();
      },
    },
    {
      id: "miyabi",
      category: "Terminal AI",
      title: "Talk to Hoshimi Miyabi AI CLI",
      subtitle: "HAND Section 6 Chief Agent",
      icon: "🦊",
      action: () => {
        onSwitchTerminalMode("miyabi");
        onNavigate("terminal");
        onClose();
      },
    },
    {
      id: "store",
      category: "Terminal AI",
      title: "Open Digital Store Catalog",
      subtitle: "Merch & Digital items",
      icon: "🛒",
      action: () => {
        onSwitchTerminalMode("store");
        onNavigate("terminal");
        onClose();
      },
    },
    {
      id: "matrix",
      category: "Settings",
      title: matrixActive ? "Disable Matrix Digital Rain" : "Enable Matrix Digital Rain FX",
      subtitle: "Canvas visual effect overlay",
      icon: "🟢",
      action: () => {
        onToggleMatrix();
        onClose();
      },
    },
    {
      id: "sfx",
      category: "Settings",
      title: sfxActive ? "Mute Web Audio SFX" : "Enable Web Audio SFX",
      subtitle: "Interactive keyboard & terminal clicks",
      icon: sfxActive ? "🔊" : "🔇",
      action: () => {
        onToggleSfx();
        onClose();
      },
    },
    {
      id: "github",
      category: "External",
      title: "Open GitHub Profile (@mikhailfur)",
      subtitle: "github.com/mikhailfur",
      icon: "🐙",
      action: () => {
        window.open("https://github.com/mikhailfur", "_blank", "noopener,noreferrer");
        onClose();
      },
    },
  ];

  const filtered = options.filter(
    (opt) =>
      opt.title.toLowerCase().includes(query.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      opt.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setQuery("");
      setSelectedIndex(0);
      inputRef.current?.focus();
    }, 40);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      playBeepSound(400, 0.02);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      playBeepSound(400, 0.02);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        playSuccessSound();
        filtered[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="cmd-palette-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cmd-palette-window" onKeyDown={handleKeyDown}>
        <div className="cmd-palette-search">
          <span className="cmd-prompt-mark">&gt;_</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or section..."
            aria-label="Search command palette"
          />
          <kbd className="cmd-kbd">Esc</kbd>
        </div>

        <div className="cmd-palette-results">
          {filtered.length === 0 ? (
            <div className="cmd-empty">No matching commands found</div>
          ) : (
            filtered.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cmd-item ${isSelected ? "is-selected" : ""}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => {
                    playSuccessSound();
                    item.action();
                  }}
                >
                  <span className="cmd-item-icon">{item.icon}</span>
                  <div className="cmd-item-info">
                    <span className="cmd-item-title">{item.title}</span>
                    {item.subtitle && <span className="cmd-item-sub">{item.subtitle}</span>}
                  </div>
                  <span className="cmd-item-cat">{item.category}</span>
                </button>
              );
            })
          )}
        </div>

        <footer className="cmd-palette-footer">
          <span>
            <kbd>↑↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> select
          </span>
          <span>
            <kbd>Ctrl /</kbd> toggle
          </span>
        </footer>
      </div>
    </div>
  );
}

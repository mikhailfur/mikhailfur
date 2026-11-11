"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { isSoundEnabled, setSoundEnabled } from "@/utils/sfx";

type SettingsContextValue = {
  soundOn: boolean;
  petalsOn: boolean;
  toggleSound: () => void;
  togglePetals: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readBool(key: string, fallback: boolean) {
  try {
    const value = localStorage.getItem(key);
    if (value === "true") return true;
    if (value === "false") return false;
  } catch {
    // Ignore storage failures.
  }
  return fallback;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(false);
  const [petalsOn, setPetalsOn] = useState(true);

  useEffect(() => {
    setSoundOn(readBool("mikhailfur.sound", false));
    setPetalsOn(readBool("mikhailfur.petals", true));
  }, []);

  useEffect(() => {
    setSoundEnabled(soundOn);
    try {
      localStorage.setItem("mikhailfur.sound", String(soundOn));
    } catch {
      // Ignore.
    }
  }, [soundOn]);

  useEffect(() => {
    try {
      localStorage.setItem("mikhailfur.petals", String(petalsOn));
    } catch {
      // Ignore.
    }
  }, [petalsOn]);

  const toggleSound = useCallback(() => {
    setSoundOn((current) => {
      const next = !current;
      setSoundEnabled(next);
      return next;
    });
  }, []);

  const togglePetals = useCallback(() => {
    setPetalsOn((current) => !current);
  }, []);

  const value = useMemo(
    () => ({ soundOn, petalsOn, toggleSound, togglePetals }),
    [petalsOn, soundOn, togglePetals, toggleSound],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}

export function soundsAvailable() {
  return typeof window !== "undefined" && isSoundEnabled();
}

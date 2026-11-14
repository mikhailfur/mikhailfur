"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setSoundEnabled } from "@/utils/sfx";

type SettingsContextValue = {
  soundOn: boolean;
  toggleSound: () => void;
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

  useEffect(() => {
    setSoundOn(readBool("mikhailfur.sound", false));
  }, []);

  useEffect(() => {
    setSoundEnabled(soundOn);
    try {
      localStorage.setItem("mikhailfur.sound", String(soundOn));
    } catch {
      // Ignore.
    }
  }, [soundOn]);

  const toggleSound = useCallback(() => {
    setSoundOn((current) => {
      const next = !current;
      setSoundEnabled(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ soundOn, toggleSound }), [soundOn, toggleSound]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside SettingsProvider");
  return context;
}

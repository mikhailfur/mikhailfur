"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getCopy, type Copy } from "@/data/site";
import { languages, type Language } from "@/types/portfolio";

const STORAGE_KEY = "mikhailfur.language";

type LanguageContextValue = {
  language: Language;
  copy: Copy;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: string | null): value is Language {
  return value !== null && (languages as readonly string[]).includes(value);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ru");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isLanguage(stored)) setLanguageState(stored);
    } catch {
      // Storage can be unavailable in private contexts.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = language;
    document.documentElement.dataset.language = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore storage failures.
    }
  }, [language, ready]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
  }, []);

  const value = useMemo(
    () => ({ language, copy: getCopy(language), setLanguage }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}

export function useCopy() {
  return useLanguage().copy;
}

export function getStoredLanguage(): Language | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : null;
  } catch {
    return null;
  }
}

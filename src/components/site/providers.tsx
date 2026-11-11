"use client";

import { LanguageProvider } from "@/lib/i18n";
import { SettingsProvider } from "@/components/site/settings";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </LanguageProvider>
  );
}

import type { Metadata, Viewport } from "next";
import { Onest, JetBrains_Mono } from "next/font/google";
import "@fontsource/black-han-sans/korean-400.css";
import "@fontsource/gothic-a1/korean-400.css";
import "@fontsource/gothic-a1/korean-700.css";
import "@fontsource/zen-old-mincho/400.css";
import "@fontsource/zen-old-mincho/600.css";
import "./globals.css";
import { Providers } from "@/components/site/providers";
import { SiteAnalytics } from "@/components/site/analytics";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  variable: "--font-onest",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mikhailfur.ru";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mikhail Fur · портфолио",
    template: "%s · Mikhail Fur",
  },
  description:
    "Портфолио Mikhail Fur: AI-инструменты, веб-проекты и заметки из Сеула. Открытый код и локальные модели.",
  keywords: [
    "Mikhail Fur",
    "портфолио",
    "AI-инструменты",
    "Next.js",
    "Сеул",
    "INHA",
    "открытый код",
  ],
  authors: [{ name: "Mikhail Fur", url: "https://github.com/mikhailfur" }],
  creator: "Mikhail Fur",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: ["en_US", "ko_KR"],
    url: siteUrl,
    siteName: "Mikhail Fur",
    title: "Mikhail Fur · портфолио",
    description:
      "AI-инструменты, веб-проекты и заметки из Сеула. Открытый код и локальные модели.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Mikhail Fur, портфолио" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mikhail Fur · портфолио",
    description: "AI-инструменты, веб-проекты и заметки из Сеула.",
    images: ["/og.jpg"],
  },
  alternates: {
    canonical: "https://mikhailfur.ru",
    languages: {
      ru: "https://mikhailfur.ru",
      en: "https://mikhailfur.ru/en",
      ko: "https://mikhailfur.ru/ko",
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f3efee",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={`${onest.variable} ${jetbrains.variable}`}>
        <Providers>{children}</Providers>
        <SiteAnalytics />
      </body>
    </html>
  );
}

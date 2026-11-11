import type { Metadata, Viewport } from "next";
import { Unbounded, Onest, JetBrains_Mono } from "next/font/google";
import "@fontsource/black-han-sans/korean-400.css";
import "@fontsource/gothic-a1/korean-400.css";
import "@fontsource/gothic-a1/korean-700.css";
import "@fontsource/zen-old-mincho/400.css";
import "@fontsource/zen-old-mincho/600.css";
import "./globals.css";
import { Providers } from "@/components/site/providers";
import { SiteAnalytics } from "@/components/site/analytics";

const unbounded = Unbounded({
  subsets: ["latin", "cyrillic"],
  variable: "--font-unbounded",
  display: "swap",
});

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
    default: "Михаил Пак · портфолио",
    template: "%s · Михаил Пак",
  },
  description:
    "Портфолио Михаила Пака: AI-инструменты, веб-проекты и заметки из Сеула. Открытый код, локальные модели, немного лисьей магии.",
  keywords: [
    "Михаил Пак",
    "Mikhail Pak",
    "박미하일",
    "портфолио",
    "AI",
    "Next.js",
    "Сеул",
    "INHA",
  ],
  authors: [{ name: "Mikhail Pak", url: "https://github.com/mikhailfur" }],
  creator: "Mikhail Pak",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    alternateLocale: ["en_US", "ko_KR"],
    url: siteUrl,
    siteName: "Mikhail Pak",
    title: "Михаил Пак · портфолио",
    description:
      "AI-инструменты, веб-проекты и заметки из Сеула. Открытый код, локальные модели, немного лисьей магии.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Михаил Пак, портфолио" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Михаил Пак · портфолио",
    description: "AI-инструменты, веб-проекты и заметки из Сеула.",
    images: ["/og.png"],
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
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/avatar.png",
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
      <body className={`${unbounded.variable} ${onest.variable} ${jetbrains.variable}`}>
        <Providers>{children}</Providers>
        <SiteAnalytics />
      </body>
    </html>
  );
}

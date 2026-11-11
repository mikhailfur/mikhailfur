"use client";

import { Analytics } from "@vercel/analytics/next";
import { usePathname } from "next/navigation";

export function SiteAnalytics() {
  const pathname = usePathname();

  if (process.env.NEXT_PUBLIC_ANALYTICS !== "true") return null;
  if (pathname?.startsWith("/2fa")) return null;

  return <Analytics />;
}

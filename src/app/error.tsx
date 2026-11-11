"use client";

import { ErrorPage } from "@/components/site/error-page";

export default function ErrorBoundary() {
  return <ErrorPage code={500} />;
}

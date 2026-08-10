"use client";

import { ErrorPage } from "@/components/error-pages/error-page";

type ErrorProps = { error: Error & { digest?: string }; reset: () => void };

export default function Error({ reset }: ErrorProps) {
  return (
    <ErrorPage
      code="500"
      title="The process stopped."
      description="Something failed while the server was assembling this page."
      detail="The fault was local. Nothing has been lost."
      primaryLabel="Try again"
      secondaryHref="/"
      secondaryLabel="Return home"
      onRetry={reset}
    />
  );
}

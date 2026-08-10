"use client";

import { ErrorPage } from "@/components/error-pages/error-page";
import "./globals.css";

type GlobalErrorProps = { error: Error & { digest?: string }; reset: () => void };

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
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
      </body>
    </html>
  );
}

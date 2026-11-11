"use client";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html lang="ru">
      <body
        style={{
          display: "grid",
          minHeight: "100vh",
          placeItems: "center",
          margin: 0,
          background: "#f3efee",
          color: "#151114",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main style={{ maxWidth: 560, padding: 32 }}>
          <p style={{ color: "#a92e58", fontSize: 13, letterSpacing: "0.08em" }}>500 · SYSTEM</p>
          <h1 style={{ fontSize: 48, lineHeight: 1, margin: "16px 0", letterSpacing: "-0.04em" }}>
            Что-то сломалось
          </h1>
          <p style={{ color: "#6d6167", lineHeight: 1.7 }}>
            Сервер уронил чашку. Обнови страницу или вернись на главную.
          </p>
          <p style={{ color: "#6d6167", fontSize: 12 }}>
            {error.digest ? `digest: ${error.digest}` : ""}
          </p>
          {/* A hard navigation is intentional: the router may be broken when this renders. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            style={{
              display: "inline-block",
              marginTop: 20,
              padding: "12px 18px",
              background: "#151114",
              color: "#f3efee",
              textDecoration: "none",
            }}
          >
            На главную
          </a>
        </main>
      </body>
    </html>
  );
}

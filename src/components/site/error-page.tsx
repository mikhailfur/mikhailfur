"use client";

import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useCopy } from "@/lib/i18n";
import { useEffect, useState } from "react";

type ErrorCode = 404 | 500 | 501 | 502 | 503;

const KANJI: Record<ErrorCode, string> = {
  404: "迷子",
  500: "故障",
  501: "未実装",
  502: "門番",
  503: "休止",
};

export function ErrorPage({ code }: { code: ErrorCode }) {
  const copy = useCopy();
  const text = copy.errors[code];
  const [path, setPath] = useState("");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  const canRetry = code !== 404;

  return (
    <main className="error-page">
      <div className="wrap" style={{ paddingTop: "1.2rem" }}>
        <div className="utility-head">
          <Link className="brand" href="/">
            <span className="hanko hanko--small" aria-hidden="true">
              狐
            </span>
            <span className="brand__text">
              <span className="brand__name">{copy.hero.nameTop} {copy.hero.nameBottom}</span>
              <span className="brand__sub">error · 迷子</span>
            </span>
          </Link>
          <Link className="utility-head__back" href="/">
            <ArrowLeft width={14} height={14} aria-hidden="true" />
            {copy.errors.back}
          </Link>
        </div>

        <div className="error-page__main">
          <div>
            <p className="error-page__code">{code}</p>
            <p className="error-page__label">
              {copy.errors.code} {code} · {KANJI[code]}
            </p>
          </div>

          <div className="error-page__copy">
            <p className="arcade-command" style={{ color: "var(--rose)", marginBottom: "1rem" }}>
              <span>&gt;</span> cat /var/log/fox.log
            </p>
            <h1>{text.title}</h1>
            <p>{text.copy}</p>
            <div className="error-page__actions">
              <Link className="btn btn--primary" href="/">
                {copy.errors.back}
                <ArrowLeft width={14} height={14} aria-hidden="true" />
              </Link>
              {canRetry ? (
                <button className="btn" type="button" onClick={() => window.location.reload()}>
                  {copy.errors.retry}
                  <RefreshCw width={14} height={14} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="error-page__terminal">
              <div className="error-page__terminal-head">
                <span>{copy.errors.terminal}</span>
                <span>code {code}</span>
              </div>
              <div className="error-page__terminal-body">
                <p>
                  <b>&gt;</b> request {path || "/"} → {code}
                </p>
                <p>
                  <b>&gt;</b> fox::follow(link) → {code === 404 ? "nothing" : "interrupted"}
                </p>
                <p>
                  <b>&gt;</b> retry:{canRetry ? "possible" : "not_needed"} · log_saved:true
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <span className="error-page__vertical" aria-hidden="true">
        {KANJI[code]}
      </span>
    </main>
  );
}

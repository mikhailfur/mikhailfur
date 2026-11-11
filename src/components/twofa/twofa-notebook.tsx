"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, KeyRound, Plus, Trash2, Upload, X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { SiteIcon } from "@/components/icons";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { getTotpCode, normalizeSecret, type TotpEntry } from "@/utils/totp";
import { playBeepSound, playKeyClickSound, playSuccessSound } from "@/utils/sfx";

const STORAGE_KEY = "mikhailfur.twofa.notebook";

function readNotebook(): TotpEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? (parsed as TotpEntry[]) : [];
  } catch {
    return [];
  }
}

function saveNotebook(entries: TotpEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // The notebook is local only; storage can fail in private mode.
  }
}

function Code({
  entry,
  label,
  onCopied,
}: {
  entry: Pick<TotpEntry, "secret" | "digits" | "period" | "algorithm">;
  label: string;
  onCopied: () => void;
}) {
  const copy = useCopy();
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(entry.period);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    const update = () => {
      const now = Date.now();
      setRemaining(entry.period - (Math.floor(now / 1000) % entry.period));
      void getTotpCode(entry, now)
        .then((next) => {
          if (active) setCode(next);
        })
        .catch(() => {
          if (active) setCode("ERROR");
        });
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [entry]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopied();
      playSuccessSound();
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      playBeepSound(280, 0.08);
    }
  };

  return (
    <button
      type="button"
      className="twofa__digits"
      onClick={() => void copyCode()}
      aria-label={`${label}: ${code}. ${copy.twofa.copy}`}
    >
      <span>{code}</span>
      <span className="twofa__countdown">
        {copied ? <Check width={11} height={11} /> : <Copy width={11} height={11} />}
        {copied ? copy.twofa.copied : `${copy.twofa.expires} ${remaining}s`}
      </span>
      <span className="twofa__bar" aria-hidden="true">
        <i style={{ width: `${Math.max(0, Math.min(100, (remaining / entry.period) * 100))}%` }} />
      </span>
    </button>
  );
}

export function TwoFactorNotebook() {
  const copy = useCopy();
  const { language } = useLanguage();
  const [entries, setEntries] = useState<TotpEntry[]>([]);
  const [quickKey, setQuickKey] = useState("");
  const [quickEntry, setQuickEntry] = useState<Pick<TotpEntry, "secret" | "digits" | "period" | "algorithm"> | null>(null);
  const [form, setForm] = useState({ issuer: "", account: "", secret: "" });
  const [notice, setNotice] = useState("");
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setEntries(readNotebook());
      setLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const setNotebook = (next: TotpEntry[]) => {
    setEntries(next);
    saveNotebook(next);
  };

  const calculate = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setQuickEntry({ secret: normalizeSecret(quickKey), digits: 6, period: 30, algorithm: "SHA-1" });
      setNotice("");
      playSuccessSound();
    } catch {
      setQuickEntry(null);
      setNotice(copy.twofa.errorSecret);
      playBeepSound(280, 0.08);
    }
  };

  const add = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (!form.issuer.trim() || !form.secret.trim()) throw new Error("fields");
      const entry: TotpEntry = {
        id: crypto.randomUUID(),
        issuer: form.issuer.trim(),
        account: form.account.trim(),
        secret: normalizeSecret(form.secret),
        digits: 6,
        period: 30,
        algorithm: "SHA-1",
        createdAt: new Date().toISOString(),
      };
      setNotebook([...entries, entry]);
      setForm({ issuer: "", account: "", secret: "" });
      setNotice("");
      playSuccessSound();
    } catch (error) {
      setNotice(error instanceof Error && error.message === "fields" ? copy.twofa.errorFields : copy.twofa.errorSecret);
      playBeepSound(280, 0.08);
    }
  };

  const remove = (id: string) => {
    setNotebook(entries.filter((entry) => entry.id !== id));
    playKeyClickSound();
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "mikhailfur-2fa-notebook.json";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (!Array.isArray(parsed)) throw new Error("not an array");
      const valid = parsed.filter(
        (entry): entry is TotpEntry =>
          entry &&
          typeof entry.id === "string" &&
          typeof entry.issuer === "string" &&
          typeof entry.secret === "string" &&
          typeof entry.digits === "number" &&
          typeof entry.period === "number" &&
          typeof entry.algorithm === "string",
      );
      const existing = new Set(entries.map((entry) => entry.id));
      setNotebook([...entries, ...valid.filter((entry) => !existing.has(entry.id))]);
      setNotice("");
      playSuccessSound();
    } catch {
      setNotice(copy.twofa.importError);
      playBeepSound(280, 0.08);
    }
  };

  return (
    <main className="utility-page">
      <div className="wrap">
        <div className="utility-head">
          <Link className="brand" href="/">
            <span className="hanko hanko--small" aria-hidden="true">
              <SiteIcon name="fox" />
            </span>
            <span className="brand__text">
              <span className="brand__name">{copy.hero.nameTop} {copy.hero.nameBottom}</span>
              <span className="brand__sub">2FA · KEY</span>
            </span>
          </Link>
          <div className="header-tools">
            <LanguageSwitcher />
            <Link className="utility-head__back" href="/">
              <ArrowLeft width={14} height={14} aria-hidden="true" />
              {copy.twofa.back}
            </Link>
          </div>
        </div>

        <div className="twofa__intro" style={{ paddingTop: "clamp(2.4rem, 5vw, 4rem)" }}>
          <span className="section-head__mark twofa__mark" aria-hidden="true" style={{ marginBottom: "1rem" }}>
            <SiteIcon name="key" />
            <span className="section-head__code">2FA</span>
          </span>
          <h1>{copy.twofa.title}</h1>
          <p>{copy.twofa.intro}</p>
          <div className="twofa__warning">
            <KeyRound width={15} height={15} aria-hidden="true" />
            <span>{copy.twofa.security}</span>
          </div>
        </div>

        <div className="twofa">
          <section aria-label={copy.twofa.title}>
            <div className="twofa__form" style={{ marginBottom: "1rem" }}>
              <h2>{copy.twofa.quick}</h2>
              <form onSubmit={calculate} className="twofa__form-row" style={{ alignItems: "end" }}>
                <label className="field" style={{ flex: 1 }}>
                  <span>{copy.twofa.secret}</span>
                  <input
                    value={quickKey}
                    onChange={(event) => setQuickKey(event.target.value)}
                    placeholder="JBSWY3DPEHPK3PXP"
                    spellCheck={false}
                    autoComplete="off"
                  />
                </label>
                <button className="btn btn--primary" type="submit">
                  {copy.twofa.quickAction}
                </button>
              </form>
              {quickEntry ? (
                <div className="twofa__entry" style={{ marginTop: "0.8rem" }}>
                  <div className="twofa__issuer">
                    <strong>{copy.twofa.code}</strong>
                    <span>{language.toUpperCase()} · TOTP</span>
                  </div>
                  <Code entry={quickEntry} label={copy.twofa.code} onCopied={() => {}} />
                </div>
              ) : null}
              {notice ? <p className="notice" role="alert">{notice}</p> : null}
            </div>

            <div className="twofa__list" style={{ marginTop: "1.6rem" }}>
              <div className="hobbies__head" style={{ paddingBottom: "0.8rem" }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem" }}>{copy.twofa.saved}</h3>
                <span className="mono" style={{ color: "var(--muted)" }}>{entries.length} · {copy.twofa.local}</span>
              </div>

              {!loaded ? null : entries.length ? (
                entries.map((entry) => (
                  <article className="twofa__entry" key={entry.id}>
                    <div className="twofa__issuer">
                      <strong>{entry.issuer}</strong>
                      <span>{entry.account || "—"} · {entry.algorithm} · {entry.digits}D · {entry.period}S</span>
                    </div>
                    <Code entry={entry} label={entry.issuer} onCopied={() => {}} />
                    <div className="twofa__actions">
                      <button
                        className="icon-btn"
                        type="button"
                        onClick={() => remove(entry.id)}
                        aria-label={`${copy.twofa.delete}: ${entry.issuer}`}
                      >
                        <Trash2 width={14} height={14} />
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="twofa__empty">{copy.twofa.empty}</p>
              )}

              <div className="twofa__tools">
                <button className="btn btn--small" type="button" onClick={exportJson} disabled={!entries.length}>
                  <Download width={13} height={13} />
                  {copy.twofa.export}
                </button>
                <button className="btn btn--small" type="button" onClick={() => fileRef.current?.click()}>
                  <Upload width={13} height={13} />
                  {copy.twofa.import}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void importJson(file);
                    event.target.value = "";
                  }}
                />
              </div>
            </div>
          </section>

          <form className="twofa__form" onSubmit={add}>
            <h2>{copy.twofa.add}</h2>
            <label className="field">
              <span>{copy.twofa.issuer}</span>
              <input
                required
                value={form.issuer}
                onChange={(event) => setForm({ ...form, issuer: event.target.value })}
                autoComplete="organization"
              />
            </label>
            <label className="field">
              <span>{copy.twofa.account}</span>
              <input
                value={form.account}
                onChange={(event) => setForm({ ...form, account: event.target.value })}
                autoComplete="username"
              />
            </label>
            <label className="field">
              <span>{copy.twofa.secret}</span>
              <input
                required
                value={form.secret}
                onChange={(event) => setForm({ ...form, secret: event.target.value })}
                spellCheck={false}
                autoComplete="off"
              />
            </label>
            <div className="twofa__form-actions">
              <button className="btn btn--primary" type="submit">
                <Plus width={14} height={14} />
                {copy.twofa.add}
              </button>
              {notice ? (
                <button className="btn btn--ghost btn--small" type="button" onClick={() => setNotice("")}>
                  <X width={13} height={13} />
                  {copy.twofa.cancel}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

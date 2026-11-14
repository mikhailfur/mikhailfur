"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, Download, KeyRound, Plus, Trash2, Upload, X } from "lucide-react";
import { useCopy, useLanguage } from "@/lib/i18n";
import { Avatar } from "@/components/site/avatar";
import { LanguageSwitcher } from "@/components/site/language-switcher";
import { getTotpCode, normalizeSecret, type TotpEntry } from "@/utils/totp";
import { playBeepSound, playKeyClickSound, playSuccessSound } from "@/utils/sfx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      className="group w-full rounded-md border border-border bg-background p-2.5 text-left transition-colors hover:border-rose/25 hover:bg-card"
      onClick={() => void copyCode()}
      aria-label={`${label}: ${code}. ${copy.twofa.copy}`}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-mono text-xl tracking-[0.18em] tabular-nums">{code}</span>
        <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
          {copied ? <Check className="size-3 text-rose" /> : <Copy className="size-3" />}
          {copied ? copy.twofa.copied : `${copy.twofa.expires} ${remaining}s`}
        </span>
      </span>
      <span className="mt-2 block h-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
        <i
          className="block h-full rounded-full bg-rose transition-[width] duration-1000 ease-linear"
          style={{ width: `${Math.max(0, Math.min(100, (remaining / entry.period) * 100))}%` }}
        />
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
    <main className="min-h-dvh">
      <div className="wrap py-4">
        <div className="flex h-12 items-center justify-between gap-3 border-b border-border">
          <Link className="flex items-center gap-2.5" href="/">
            <Avatar className="size-7 rounded-md" />
            <span className="text-[13px] font-semibold leading-none tracking-[-0.02em]">
              {copy.hero.nameTop} {copy.hero.nameBottom}
            </span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground sm:inline">
              2FA · KEY
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                {copy.twofa.back}
              </Link>
            </Button>
          </div>
        </div>

        <div className="max-w-2xl py-10 md:py-14">
          <Badge variant="outline">2FA · LOCAL ONLY</Badge>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3rem)] leading-[1.02] tracking-[-0.05em]">
            {copy.twofa.title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy.twofa.intro}</p>
          <div className="mt-4 flex items-start gap-2 rounded-md border border-rose/15 bg-blush px-3 py-2.5 text-xs leading-relaxed text-rose-deep">
            <KeyRound className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>{copy.twofa.security}</span>
          </div>
        </div>

        <div className="grid gap-4 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid content-start gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>{copy.twofa.quick}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={calculate} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <div className="grid flex-1 gap-1.5">
                    <Label htmlFor="quick-secret">{copy.twofa.secret}</Label>
                    <Input
                      id="quick-secret"
                      value={quickKey}
                      onChange={(event) => setQuickKey(event.target.value)}
                      placeholder="JBSWY3DPEHPK3PXP"
                      spellCheck={false}
                      autoComplete="off"
                      className="font-mono text-xs"
                    />
                  </div>
                  <Button variant="default" size="sm" type="submit">
                    {copy.twofa.quickAction}
                  </Button>
                </form>
                {quickEntry ? (
                  <div className="mt-4 grid gap-2 rounded-md border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm">{copy.twofa.code}</strong>
                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">
                        {language.toUpperCase()} · TOTP
                      </span>
                    </div>
                    <Code entry={quickEntry} label={copy.twofa.code} onCopied={() => {}} />
                  </div>
                ) : null}
                {notice ? (
                  <p className="mt-3 rounded-md border border-rose/20 bg-blush px-2.5 py-1.5 text-xs text-rose-deep" role="alert">
                    {notice}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
                <CardTitle>{copy.twofa.saved}</CardTitle>
                <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                  {entries.length} · {copy.twofa.local}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                {!loaded ? (
                  <div className="h-16 animate-pulse border-t border-border bg-muted/40" />
                ) : entries.length ? (
                  <div className="divide-y divide-border border-t border-border">
                    {entries.map((entry) => (
                      <article className="flex items-start gap-3 p-3" key={entry.id}>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">{entry.issuer}</strong>
                          <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
                            {entry.account || "-"} · {entry.algorithm} · {entry.digits}D · {entry.period}S
                          </span>
                        </div>
                        <div className="w-[170px] shrink-0">
                          <Code entry={entry} label={entry.issuer} onCopied={() => {}} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          type="button"
                          onClick={() => remove(entry.id)}
                          aria-label={`${copy.twofa.delete}: ${entry.issuer}`}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </Button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
                    {copy.twofa.empty}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 border-t border-border pt-3">
                <Button variant="outline" size="xs" type="button" onClick={exportJson} disabled={!entries.length}>
                  <Download className="size-3" />
                  {copy.twofa.export}
                </Button>
                <Button variant="outline" size="xs" type="button" onClick={() => fileRef.current?.click()}>
                  <Upload className="size-3" />
                  {copy.twofa.import}
                </Button>
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
              </CardFooter>
            </Card>
          </div>

          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle>{copy.twofa.add}</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3" onSubmit={add}>
                <div className="grid gap-1.5">
                  <Label htmlFor="issuer">{copy.twofa.issuer}</Label>
                  <Input
                    id="issuer"
                    required
                    value={form.issuer}
                    onChange={(event) => setForm({ ...form, issuer: event.target.value })}
                    autoComplete="organization"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="account">{copy.twofa.account}</Label>
                  <Input
                    id="account"
                    value={form.account}
                    onChange={(event) => setForm({ ...form, account: event.target.value })}
                    autoComplete="username"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="secret">{copy.twofa.secret}</Label>
                  <Input
                    id="secret"
                    required
                    value={form.secret}
                    onChange={(event) => setForm({ ...form, secret: event.target.value })}
                    spellCheck={false}
                    autoComplete="off"
                    className="font-mono text-xs"
                  />
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Button variant="default" size="sm" type="submit">
                    <Plus className="size-3.5" aria-hidden="true" />
                    {copy.twofa.add}
                  </Button>
                  {notice ? (
                    <Button variant="ghost" size="sm" type="button" onClick={() => setNotice("")}>
                      <X className="size-3.5" aria-hidden="true" />
                      {copy.twofa.cancel}
                    </Button>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

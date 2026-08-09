"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { getTotpCode, normalizeSecret, type TotpEntry } from "@/utils/totp";
import { playBeepSound, playKeyClickSound, playSuccessSound } from "@/utils/sfx";

type Language = "en" | "ru" | "ko";
type Copy = Record<string, string>;
const storageKey = "mikhailfur.twofa.notebook";

const copy: Record<Language, Copy> = {
  en: { title: "MFA / TOTP", lead: "Paste a Base32 authenticator key to get a current code instantly. Save frequently used keys in this browser-only notebook.", key: "MFA TOTP KEY", getCode: "GET CODE", code: "CURRENT CODE", refresh: "REFRESH", notebook: "LOCAL NOTEBOOK", saved: "SAVED KEYS", add: "SAVE KEY", name: "NAME", secret: "KEY", remove: "REMOVE", empty: "No keys are saved in this browser.", local: "LOCAL ONLY", back: "BACK TO SITE", invalid: "Enter a valid Base32 TOTP key.", copied: "Code copied", note: "Keys are stored as plain text in this browser's localStorage. Do not use a shared device.", expires: "NEXT CODE" },
  ru: { title: "MFA / TOTP", lead: "Вставьте Base32-ключ аутентификатора, чтобы сразу получить текущий код. Часто используемые ключи можно сохранить в локальном блокноте браузера.", key: "MFA TOTP КЛЮЧ", getCode: "ПОЛУЧИТЬ КОД", code: "ТЕКУЩИЙ КОД", refresh: "ОБНОВЛЕНИЕ", notebook: "ЛОКАЛЬНЫЙ БЛОКНОТ", saved: "СОХРАНЁННЫЕ КЛЮЧИ", add: "СОХРАНИТЬ КЛЮЧ", name: "ИМЯ", secret: "КЛЮЧ", remove: "УДАЛИТЬ", empty: "В этом браузере ещё нет сохранённых ключей.", local: "ТОЛЬКО ЛОКАЛЬНО", back: "НАЗАД НА САЙТ", invalid: "Введите корректный Base32 TOTP-ключ.", copied: "Код скопирован", note: "Ключи сохраняются открытым текстом в localStorage браузера. Не используйте общий компьютер.", expires: "СЛЕДУЮЩИЙ КОД" },
  ko: { title: "MFA / TOTP", lead: "Base32 인증기 키를 붙여 넣어 현재 코드를 즉시 확인하세요. 자주 쓰는 키는 이 브라우저 전용 노트에 저장할 수 있습니다.", key: "MFA TOTP 키", getCode: "코드 보기", code: "현재 코드", refresh: "새로고침", notebook: "로컬 노트", saved: "저장된 키", add: "키 저장", name: "이름", secret: "키", remove: "제거", empty: "이 브라우저에 저장된 키가 없습니다.", local: "로컬 전용", back: "사이트로 돌아가기", invalid: "유효한 Base32 TOTP 키를 입력하세요.", copied: "코드가 복사됨", note: "키는 이 브라우저의 localStorage에 일반 텍스트로 저장됩니다. 공용 기기에서는 사용하지 마세요.", expires: "다음 코드" },
};

function readLanguage(): Language {
  const stored = typeof window === "undefined" ? null : localStorage.getItem("terminal-blog.language");
  return stored === "ru" || stored === "ko" ? stored : "en";
}

function readNotebook() {
  try {
    const stored = localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed as TotpEntry[] : [];
  } catch { return []; }
}

function saveNotebook(entries: TotpEntry[]) {
  localStorage.setItem(storageKey, JSON.stringify(entries));
}

function Code({ entry, text }: { entry: Pick<TotpEntry, "secret" | "digits" | "period" | "algorithm">; text: Copy }) {
  const [code, setCode] = useState("------");
  const [remaining, setRemaining] = useState(entry.period);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let active = true;
    const update = () => {
      const now = Date.now();
      setRemaining(entry.period - Math.floor(now / 1000) % entry.period);
      void getTotpCode(entry, now).then((next) => { if (active) setCode(next); }).catch(() => { if (active) setCode("ERROR"); });
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => { active = false; window.clearInterval(timer); };
  }, [entry]);
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); playSuccessSound(); window.setTimeout(() => setCopied(false), 1400); } catch { playBeepSound(280, .08); }
  };
  return <button type="button" className="twofa-code" onClick={() => void copyCode()}><span>{code}</span><small>{copied ? text.copied : text.code} · {text.expires}: {remaining}s</small></button>;
}

export function TwoFactorNotebook() {
  const [language] = useState(readLanguage);
  const text = copy[language];
  const [quickKey, setQuickKey] = useState("");
  const [quickEntry, setQuickEntry] = useState<Pick<TotpEntry, "secret" | "digits" | "period" | "algorithm"> | null>(null);
  const [entries, setEntries] = useState<TotpEntry[]>([]);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ name: "", secret: "" });

  useEffect(() => {
    const timer = window.setTimeout(() => setEntries(readNotebook()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  const setNotebook = (next: TotpEntry[]) => { setEntries(next); saveNotebook(next); };
  const calculate = (event: FormEvent) => {
    event.preventDefault();
    try { setQuickEntry({ secret: normalizeSecret(quickKey), digits: 6, period: 30, algorithm: "SHA-1" }); setNotice(""); playSuccessSound(); }
    catch { setQuickEntry(null); setNotice(text.invalid); playBeepSound(280, .08); }
  };
  const add = (event: FormEvent) => {
    event.preventDefault();
    try {
      const entry: TotpEntry = { id: crypto.randomUUID(), issuer: form.name.trim(), account: "", secret: normalizeSecret(form.secret), digits: 6, period: 30, algorithm: "SHA-1", createdAt: new Date().toISOString() };
      if (!entry.issuer) throw new Error();
      setNotebook([...entries, entry]); setForm({ name: "", secret: "" }); setNotice(""); playSuccessSound();
    } catch { setNotice(text.invalid); playBeepSound(280, .08); }
  };
  const remove = (id: string) => { setNotebook(entries.filter((entry) => entry.id !== id)); playKeyClickSound(); };

  return <main className="twofa-shell">
    <nav className="twofa-topbar"><Link href="/" className="brand"><span className="brand-mark">&gt;_</span> mikhail_fur</Link><span>/2fa</span><Link href="/" className="twofa-text-button">{text.back}</Link></nav>
    <section className="twofa-window" aria-labelledby="twofa-title"><header className="twofa-window-bar"><span className="terminal-frame-controls" aria-hidden="true"><i /><i /><i /></span><span>mikhailfur@lab: /2fa</span><span className="twofa-status">{text.local}</span></header><div className="twofa-content">
      <header className="twofa-intro"><p className="command-line"><span className="prompt"><span>mikhailfur@lab</span><b>:</b><em>~/2fa</em><b>$</b> totp --code</span></p><h1 id="twofa-title">{text.title}</h1><p>{text.lead}</p></header>
      <section className="twofa-quick"><form onSubmit={calculate}><label>{text.key}<input value={quickKey} onChange={(event) => setQuickKey(event.target.value)} placeholder="JBSWY3DPEHPK3PXP" spellCheck={false} autoComplete="off" autoFocus /></label><button className="button button-primary">{text.getCode}</button></form>{quickEntry && <Code entry={quickEntry} text={text} />}{notice && <p className="twofa-error" role="alert">{notice}</p>}</section>
      <section className="twofa-vault"><div className="twofa-toolbar"><span>{text.notebook}</span><span>{entries.length} {text.saved}</span></div><p className="twofa-note">{text.note}</p><div className="twofa-grid">{entries.length ? entries.map((entry) => <article className="twofa-card" key={entry.id}><div className="twofa-card-head"><div><strong>{entry.issuer}</strong><span>{entry.account || "-"}</span></div><button type="button" className="twofa-text-button" onClick={() => remove(entry.id)}>{text.remove}</button></div><Code entry={entry} text={text} /><footer><span>{entry.algorithm} · {entry.digits}D · {entry.period}S</span></footer></article>) : <p className="twofa-empty">{text.empty}</p>}</div>
      <form className="twofa-add" onSubmit={add}><h2>{text.add}</h2><div className="twofa-form-grid twofa-simple-form"><label>{text.secret}<input required value={form.secret} onChange={(event) => setForm({ ...form, secret: event.target.value })} spellCheck={false} autoComplete="off" /></label><label>{text.name}<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label></div><button className="button button-primary">{text.add}</button></form></section>
    </div></section>
  </main>;
}

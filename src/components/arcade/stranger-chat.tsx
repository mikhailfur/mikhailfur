"use client";

import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { ArcadeLanguage } from "./types";

type ChatStatus = "idle" | "joining" | "waiting" | "connected" | "disconnected";
type Session = { sessionId: string; token: string; nickname: string; partnerNickname?: string };
type Message = { id: string; senderId: string; nickname: string; text: string; createdAt: number };

const copy = {
  en: { title: "STRANGER_CHAT", intro: "Text roulette without profiles or registration. Pick a nickname and meet one random visitor.", nickname: "nickname", find: "find stranger", waiting: "SCANNING FOR AN AVAILABLE STRANGER", connected: "CONNECTED", disconnected: "STRANGER DISCONNECTED", next: "next", leave: "leave", report: "report", placeholder: "write a message...", send: "send", safety: "Do not share private information. Messages expire after one hour; a reported transcript is retained for seven days.", idle: "Channel closed. Start a new search when you are ready.", invalid: "Use 2-20 letters, numbers, spaces, dots, dashes, or underscores.", reported: "Report saved. The channel was closed.", error: "Connection failed. Try again." },
  ru: { title: "ЧАТ_РУЛЕТКА", intro: "Текстовая рулетка без профилей и регистрации. Выбери никнейм и познакомься со случайным посетителем.", nickname: "никнейм", find: "найти собеседника", waiting: "ПОИСК СВОБОДНОГО СОБЕСЕДНИКА", connected: "СОЕДИНЕНИЕ УСТАНОВЛЕНО", disconnected: "СОБЕСЕДНИК ОТКЛЮЧИЛСЯ", next: "следующий", leave: "выйти", report: "пожаловаться", placeholder: "напиши сообщение...", send: "отправить", safety: "Не сообщай личные данные. Сообщения удаляются через час; при жалобе переписка хранится семь дней.", idle: "Канал закрыт. Начни новый поиск, когда будешь готов.", invalid: "Используй 2-20 букв, цифр, пробелов, точек, дефисов или подчёркиваний.", reported: "Жалоба сохранена. Канал закрыт.", error: "Не удалось подключиться. Попробуй ещё раз." },
  ko: { title: "랜덤_채팅", intro: "프로필과 가입 없이 이용하는 텍스트 룰렛입니다. 닉네임을 정하고 무작위 방문자를 만나세요.", nickname: "닉네임", find: "대화 상대 찾기", waiting: "대화 상대 검색 중", connected: "연결됨", disconnected: "상대방 연결 끊김", next: "다음", leave: "나가기", report: "신고", placeholder: "메시지를 입력하세요...", send: "전송", safety: "개인정보를 공유하지 마세요. 메시지는 한 시간 후 삭제되며 신고된 대화는 7일간 보관됩니다.", idle: "채널이 닫혔습니다. 준비되면 새 검색을 시작하세요.", invalid: "2-20자의 문자, 숫자, 공백, 점, 대시 또는 밑줄을 사용하세요.", reported: "신고가 저장되고 채널이 닫혔습니다.", error: "연결하지 못했습니다. 다시 시도하세요." },
} satisfies Record<ArcadeLanguage, Record<string, string>>;

async function chatRequest(body: Record<string, unknown>, keepalive = false) {
  const response = await fetch("/api/stranger-chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
    keepalive,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Chat request failed");
  return data;
}

export function StrangerChat({ language, embedded = false }: { language: ArcadeLanguage; embedded?: boolean }) {
  const text = copy[language];
  const [nickname, setNickname] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [notice, setNotice] = useState("");
  const logRef = useRef<HTMLDivElement>(null);
  const leaveSessionRef = useRef<{ sessionId: string; token: string } | null>(null);
  const mountedRef = useRef(true);
  const joinGenerationRef = useRef(0);
  const stickToBottomRef = useRef(true);
  const sessionId = session?.sessionId;
  const sessionToken = session?.token;

  useEffect(() => {
    leaveSessionRef.current = sessionId && sessionToken ? { sessionId, token: sessionToken } : null;
  }, [sessionId, sessionToken]);

  useEffect(() => {
    if (!sessionId || !sessionToken || (status !== "waiting" && status !== "connected")) return;
    let active = true;
    let failures = 0;
    let timer = 0;
    const poll = async () => {
      try {
        const data = await chatRequest({ action: "status", sessionId, token: sessionToken });
        if (!active) return;
        if (failures >= 3) setNotice("");
        failures = 0;
        setSession((current) => current && current.partnerNickname !== data.partnerNickname ? { ...current, partnerNickname: data.partnerNickname } : current);
        setStatus(data.status === "connected" ? "connected" : data.status === "waiting" ? "waiting" : "disconnected");
        if (Array.isArray(data.messages)) {
          setMessages((current) => current.length === data.messages.length && current.every((item, index) => item.id === data.messages[index]?.id) ? current : data.messages);
        }
      } catch {
        failures += 1;
        if (active && failures >= 3) setNotice(text.error);
      } finally {
        if (active) timer = window.setTimeout(poll, Math.min(10_000, 1_300 * 2 ** Math.max(0, failures - 1)));
      }
    };
    void poll();
    return () => { active = false; window.clearTimeout(timer); };
  }, [sessionId, sessionToken, status, text.error]);

  useEffect(() => {
    if (!stickToBottomRef.current) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, status]);

  useEffect(() => {
    mountedRef.current = true;
    const leave = () => {
      const current = leaveSessionRef.current;
      if (current) navigator.sendBeacon("/api/stranger-chat", new Blob([JSON.stringify({ action: "leave", ...current })], { type: "application/json" }));
    };
    window.addEventListener("pagehide", leave);
    return () => {
      mountedRef.current = false;
      joinGenerationRef.current += 1;
      window.removeEventListener("pagehide", leave);
      leave();
    };
  }, []);

  const start = async (event?: FormEvent) => {
    event?.preventDefault();
    const clean = nickname.trim();
    if (!/^[\p{L}\p{N}_.\- ]{2,20}$/u.test(clean)) {
      setNotice(text.invalid);
      return;
    }
    setStatus("joining");
    setNotice("");
    setMessages([]);
    const generation = ++joinGenerationRef.current;
    try {
      const data = await chatRequest({ action: "join", nickname: clean });
      leaveSessionRef.current = { sessionId: data.sessionId, token: data.token };
      if (!mountedRef.current || generation !== joinGenerationRef.current) {
        await chatRequest({ action: "leave", sessionId: data.sessionId, token: data.token }, true).catch(() => {});
        return;
      }
      const activated = await chatRequest({ action: "activate", sessionId: data.sessionId, token: data.token });
      if (!mountedRef.current || generation !== joinGenerationRef.current) {
        await chatRequest({ action: "leave", sessionId: data.sessionId, token: data.token }, true).catch(() => {});
        return;
      }
      setSession({ sessionId: activated.sessionId, token: activated.token, nickname: activated.nickname, partnerNickname: activated.partnerNickname });
      setStatus(activated.status);
    } catch {
      const current = leaveSessionRef.current;
      if (current) await chatRequest({ action: "leave", ...current }, true).catch(() => {});
      leaveSessionRef.current = null;
      if (mountedRef.current && generation === joinGenerationRef.current) {
        setStatus("idle");
        setNotice(text.error);
      }
    }
  };

  const leave = async () => {
    joinGenerationRef.current += 1;
    if (session) {
      try {
        await chatRequest({ action: "leave", sessionId: session.sessionId, token: session.token }, true);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : text.error);
        return false;
      }
    }
    leaveSessionRef.current = null;
    setSession(null);
    setStatus("idle");
    setMessages([]);
    return true;
  };

  const next = async () => {
    if (await leave()) await start();
  };

  const report = async () => {
    if (!session || status !== "connected") return;
    try {
      await chatRequest({ action: "report", sessionId: session.sessionId, token: session.token });
      setSession(null);
      setStatus("idle");
      setMessages([]);
      setNotice(text.reported);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : text.error);
    }
  };

  const send = async (event: FormEvent) => {
    event.preventDefault();
    const message = input.trim();
    if (!session || status !== "connected" || !message) return;
    setInput("");
    try {
      const data = await chatRequest({ action: "message", sessionId: session.sessionId, token: session.token, text: message });
      setMessages((current) => current.some((item) => item.id === data.message.id) ? current : [...current, data.message]);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : text.error);
    }
  };

  const body = (
    <div className="stranger-layout">
      <aside className="stranger-intro">
        <p className="arcade-command"><span>&gt;</span> connect /dev/stranger</p>
        <h2>{text.title}</h2>
        <p>{text.intro}</p>
        <div className="stranger-safety"><span>!</span><p>{text.safety}</p></div>
        {status === "idle" || status === "joining" ? (
          <form className="stranger-login" onSubmit={start}>
            <label>{text.nickname}<input value={nickname} onChange={(event) => setNickname(event.target.value)} maxLength={20} autoComplete="nickname" /></label>
            <button type="submit" className="arcade-button is-primary" disabled={status === "joining"}>./{text.find}</button>
          </form>
        ) : (
          <div className="stranger-controls">
            <button type="button" className="arcade-button is-primary" onClick={next}>./{text.next}</button>
            <button type="button" className="arcade-button" onClick={leave}>./{text.leave}</button>
            {status === "connected" ? <button type="button" className="stranger-report" onClick={report}>{text.report}</button> : null}
          </div>
        )}
        {notice ? <p className="game-notice">{notice}</p> : null}
      </aside>

      <section className="stranger-terminal" aria-label="Anonymous stranger chat">
        <header><span><i className={`is-${status}`} /> {status === "waiting" || status === "joining" ? text.waiting : status === "connected" ? text.connected : status === "disconnected" ? text.disconnected : "CHANNEL OFFLINE"}</span><span>{session?.partnerNickname ? `peer: ${session.partnerNickname}` : "peer: --"}</span></header>
        <div className="stranger-log" ref={logRef} aria-live="polite" onScroll={(event) => { const element = event.currentTarget; stickToBottomRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 36; }}>
          {status === "idle" ? <p className="stranger-system">[system] {text.idle}</p> : null}
          {status === "waiting" || status === "joining" ? <p className="stranger-system stranger-scanning">[system] {text.waiting}<span>...</span></p> : null}
          {status === "connected" && messages.length === 0 ? <p className="stranger-system">[system] {text.connected}: {session?.partnerNickname}</p> : null}
          {messages.map((message) => <p key={message.id} className={message.senderId === session?.sessionId ? "is-own" : ""}><time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time><b>&lt;{message.nickname}&gt;</b><span>{message.text}</span></p>)}
          {status === "disconnected" ? <p className="stranger-system">[system] {text.disconnected}</p> : null}
        </div>
        <form className="stranger-message-form" onSubmit={send}>
          <span>&gt;</span><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={text.placeholder} aria-label={text.placeholder} disabled={status !== "connected"} maxLength={500} autoComplete="off" /><button type="submit" disabled={status !== "connected" || !input.trim()}>{text.send}</button>
        </form>
      </section>
    </div>
  );

  if (embedded) {
    return <div className="stranger-embedded-container">{body}</div>;
  }

  return body;
}

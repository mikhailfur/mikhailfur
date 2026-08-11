"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ArcadeLanguage } from "./types";

type Point = { x: number; y: number };
type Direction = Point;

const BOARD_SIZE = 20;
const START_SNAKE = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const START_DIRECTION = { x: 1, y: 0 };
const bestScoreEvent = "mkh-snake-best";

const copy = {
  en: { title: "SNAKE.EXE", hint: "Swipe, use D-pad or Arrow keys / WASD. Eat pixels, avoid borders and self.", start: "start", pause: "pause", resume: "resume", reset: "reset", ready: "READY", paused: "PAUSED", lost: "SEGMENTATION FAULT", score: "SCORE", best: "BEST" },
  ru: { title: "SNAKE.EXE", hint: "Свайпайте, нажимайте D-pad или стрелки / WASD. Ешьте пиксели.", start: "старт", pause: "пауза", resume: "продолжить", reset: "сброс", ready: "ГОТОВО", paused: "ПАУЗА", lost: "ОШИБКА СЕГМЕНТАЦИИ", score: "СЧЁТ", best: "РЕКОРД" },
  ko: { title: "SNAKE.EXE", hint: "스와이프, D-pad 또는 방향키 / WASD로 조종하세요.", start: "시작", pause: "일시정지", resume: "계속", reset: "초기화", ready: "준비", paused: "일시정지", lost: "세그먼트 오류", score: "점수", best: "최고" },
} satisfies Record<ArcadeLanguage, Record<string, string>>;

function randomFood(snake: Point[]) {
  const free: Point[] = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 4, y: 4 };
}

function readBestScore() {
  try { return Number(localStorage.getItem("mkh-arcade.snake-best")) || 0; } catch { return 0; }
}

function subscribeBestScore(listener: () => void) {
  window.addEventListener(bestScoreEvent, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(bestScoreEvent, listener);
    window.removeEventListener("storage", listener);
  };
}

function saveBestScore(score: number) {
  try {
    localStorage.setItem("mkh-arcade.snake-best", String(score));
    window.dispatchEvent(new Event(bestScoreEvent));
  } catch {
    // Restricted browser context fallback
  }
}

export function SnakeGame({ language }: { language: ArcadeLanguage }) {
  const text = copy[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directionRef = useRef<Direction>(START_DIRECTION);
  const nextDirectionRef = useRef<Direction>(START_DIRECTION);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [snake, setSnake] = useState<Point[]>(START_SNAKE);
  const [food, setFood] = useState(() => randomFood(START_SNAKE));
  const [status, setStatus] = useState<"ready" | "running" | "paused" | "lost">("ready");
  const [score, setScore] = useState(0);
  const pendingBestRef = useRef<number | null>(null);
  const best = useSyncExternalStore(subscribeBestScore, readBestScore, () => 0);

  useEffect(() => {
    if (pendingBestRef.current !== null) {
      saveBestScore(pendingBestRef.current);
      pendingBestRef.current = null;
    }
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const scale = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    canvas.width = size * scale;
    canvas.height = size * scale;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.imageSmoothingEnabled = false;

    const cell = size / BOARD_SIZE;
    context.fillStyle = "#080604";
    context.fillRect(0, 0, size, size);
    context.strokeStyle = "rgba(81, 64, 47, .22)";
    context.lineWidth = 1;
    for (let index = 1; index < BOARD_SIZE; index += 1) {
      context.beginPath();
      context.moveTo(index * cell, 0);
      context.lineTo(index * cell, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, index * cell);
      context.lineTo(size, index * cell);
      context.stroke();
    }
    snake.forEach((part, index) => {
      context.fillStyle = index === 0 ? "#ffc98b" : index % 2 ? "#f29a47" : "#c77738";
      context.fillRect(part.x * cell + 1, part.y * cell + 1, cell - 2, cell - 2);
    });
    context.fillStyle = "#f6eee4";
    context.fillRect(food.x * cell + cell * 0.22, food.y * cell + cell * 0.22, cell * 0.56, cell * 0.56);
  }, [food, snake]);

  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      setSnake((current) => {
        directionRef.current = nextDirectionRef.current;
        const head = {
          x: current[0].x + directionRef.current.x,
          y: current[0].y + directionRef.current.y,
        };
        const ate = head.x === food.x && head.y === food.y;
        const body = ate ? current : current.slice(0, -1);
        const collision = head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE
          || body.some((part) => part.x === head.x && part.y === head.y);
        if (collision) {
          setStatus("lost");
          return current;
        }
        const next = [head, ...body];
        if (ate) {
          const nextScore = score + 1;
          setScore(nextScore);
          setFood(randomFood(next));
          if (nextScore > readBestScore()) pendingBestRef.current = nextScore;
        }
        return next;
      });
    }, Math.max(68, 125 - score * 2));
    return () => window.clearInterval(timer);
  }, [food, score, status]);

  const steer = (next: Direction) => {
    const current = directionRef.current;
    if (next.x + current.x === 0 && next.y + current.y === 0) return;
    nextDirectionRef.current = next;
  };

  const handleKey = (event: React.KeyboardEvent<HTMLCanvasElement>) => {
    const directions: Record<string, Direction> = {
      ArrowUp: { x: 0, y: -1 }, w: { x: 0, y: -1 }, W: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 }, s: { x: 0, y: 1 }, S: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, a: { x: -1, y: 0 }, A: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 }, d: { x: 1, y: 0 }, D: { x: 1, y: 0 },
    };
    const next = directions[event.key];
    if (!next) return;
    event.preventDefault();
    steer(next);
    if (status === "ready") setStatus("running");
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      steer({ x: dx > 0 ? 1 : -1, y: 0 });
    } else {
      steer({ x: 0, y: dy > 0 ? 1 : -1 });
    }
    if (status === "ready") setStatus("running");
  };

  const reset = () => {
    directionRef.current = START_DIRECTION;
    nextDirectionRef.current = START_DIRECTION;
    setSnake(START_SNAKE);
    setFood(randomFood(START_SNAKE));
    setScore(0);
    setStatus("ready");
  };

  return (
    <div className="snake-layout">
      <div className="snake-screen">
        <canvas
          ref={canvasRef}
          className="snake-canvas"
          aria-label={`Snake. ${text.score}: ${score}`}
          tabIndex={0}
          onKeyDown={handleKey}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
        {status !== "running" ? <div className="snake-overlay"><strong>{status === "lost" ? text.lost : status === "paused" ? text.paused : text.ready}</strong><span>TOUCH SWIPE / TAP D-PAD</span></div> : null}
      </div>
      <aside className="game-side-panel">
        <p className="arcade-command"><span>&gt;</span> run snake.exe</p>
        <h2>{text.title}</h2>
        <p>{text.hint}</p>
        <div className="snake-score"><span>{text.score}<b>{String(score).padStart(3, "0")}</b></span><span>{text.best}<b>{String(best).padStart(3, "0")}</b></span></div>
        <div className="snake-actions">
          {status === "ready" || status === "lost" ? <button type="button" className="arcade-button is-primary" onClick={() => { if (status === "lost") reset(); setStatus("running"); window.setTimeout(() => canvasRef.current?.focus(), 0); }}>./{text.start}</button> : <button type="button" className="arcade-button is-primary" onClick={() => { setStatus(status === "paused" ? "running" : "paused"); if (status === "paused") window.setTimeout(() => canvasRef.current?.focus(), 0); }}>./{status === "paused" ? text.resume : text.pause}</button>}
          <button type="button" className="arcade-button" onClick={reset}>./{text.reset}</button>
        </div>
        <div className="snake-dpad" aria-label="Snake direction controls">
          <button type="button" onClick={() => { steer({ x: 0, y: -1 }); if (status === "ready") setStatus("running"); }}>↑</button>
          <button type="button" onClick={() => { steer({ x: -1, y: 0 }); if (status === "ready") setStatus("running"); }}>←</button>
          <button type="button" onClick={() => { steer({ x: 0, y: 1 }); if (status === "ready") setStatus("running"); }}>↓</button>
          <button type="button" onClick={() => { steer({ x: 1, y: 0 }); if (status === "ready") setStatus("running"); }}>→</button>
        </div>
      </aside>
    </div>
  );
}

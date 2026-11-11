"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ArcadeLanguage } from "./types";

type Point = { x: number; y: number };
type Direction = Point;
type Status = "ready" | "running" | "paused" | "lost";

type GameState = {
  snake: Point[];
  food: Point;
  score: number;
  status: Status;
  direction: Direction;
  queued: Direction;
};

type GameAction =
  | { type: "tick" }
  | { type: "start" }
  | { type: "toggle" }
  | { type: "reset" }
  | { type: "steer"; direction: Direction };

const BOARD_SIZE = 20;
const START_SNAKE: Point[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
const START_DIRECTION: Direction = { x: 1, y: 0 };
const bestScoreEvent = "mkh-snake-best";

const copy = {
  en: {
    title: "SNAKE.EXE",
    hint: "Eat pixels, grow, and keep off the walls and your own tail.",
    keys: "Arrows / WASD steer. Space pauses. R starts a new run.",
    ready: "READY",
    running: "LIVE",
    paused: "PAUSED",
    lost: "SEGFAULT",
    start: "start",
    pause: "pause",
    resume: "resume",
    reset: "reset",
    readyHint: "Swipe the board, tap the D-pad or press an arrow key.",
    pausedHint: "Space or resume to get back in.",
    lostHint: "Start again when you are ready.",
    dpad: "Direction pad",
    up: "Up",
    down: "Down",
    left: "Left",
    right: "Right",
    score: "SCORE",
    best: "BEST",
    food: "pixel",
    self: "you",
  },
  ru: {
    title: "SNAKE.EXE",
    hint: "Ешь пиксели, расти и не врезайся в стены или собственный хвост.",
    keys: "Стрелки / WASD — руль. Пробел — пауза. R — новый забег.",
    ready: "ГОТОВО",
    running: "В ИГРЕ",
    paused: "ПАУЗА",
    lost: "СБОЙ",
    start: "старт",
    pause: "пауза",
    resume: "продолжить",
    reset: "сброс",
    readyHint: "Свайп по полю, D-pad или стрелки.",
    pausedHint: "Пробел или «продолжить».",
    lostHint: "Старт — ещё один забег.",
    dpad: "Крестовина",
    up: "Вверх",
    down: "Вниз",
    left: "Влево",
    right: "Вправо",
    score: "СЧЁТ",
    best: "РЕКОРД",
    food: "пиксель",
    self: "ты",
  },
  ko: {
    title: "SNAKE.EXE",
    hint: "픽셀을 먹고 성장하세요. 벽과 자신의 꼬리에 부딪히지 마세요.",
    keys: "방향키 / WASD로 조종하고, 스페이스로 일시정지, R로 새 게임.",
    ready: "준비",
    running: "진행 중",
    paused: "일시정지",
    lost: "오류",
    start: "시작",
    pause: "일시정지",
    resume: "계속",
    reset: "초기화",
    readyHint: "보드를 스와이프하거나 D-pad, 방향키를 사용하세요.",
    pausedHint: "스페이스 또는 계속을 누르세요.",
    lostHint: "준비되면 다시 시작하세요.",
    dpad: "방향 패드",
    up: "위",
    down: "아래",
    left: "왼쪽",
    right: "오른쪽",
    score: "점수",
    best: "최고",
    food: "픽셀",
    self: "나",
  },
} satisfies Record<ArcadeLanguage, Record<string, string>>;

const KEY_DIRECTIONS: Record<string, Direction> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

function randomFood(snake: Point[]) {
  const free: Point[] = [];
  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!snake.some((part) => part.x === x && part.y === y)) free.push({ x, y });
    }
  }
  return free[Math.floor(Math.random() * free.length)] ?? { x: 4, y: 4 };
}

function createGame(): GameState {
  return {
    snake: START_SNAKE,
    food: randomFood(START_SNAKE),
    score: 0,
    status: "ready",
    direction: START_DIRECTION,
    queued: START_DIRECTION,
  };
}

function reducer(state: GameState, action: GameAction): GameState {
  if (action.type === "reset") return createGame();
  if (action.type === "start") return state.status === "running" ? state : { ...state, status: "running" };
  if (action.type === "toggle") {
    if (state.status === "running") return { ...state, status: "paused" };
    if (state.status === "paused" || state.status === "ready") return { ...state, status: "running" };
    return state;
  }
  if (action.type === "steer") {
    if (state.status === "lost") return state;
    if (action.direction.x + state.queued.x === 0 && action.direction.y + state.queued.y === 0) return state;
    return {
      ...state,
      queued: action.direction,
      status: state.status === "ready" || state.status === "paused" ? "running" : state.status,
    };
  }
  if (state.status !== "running") return state;

  const direction = state.queued;
  const head = {
    x: state.snake[0].x + direction.x,
    y: state.snake[0].y + direction.y,
  };
  const ate = head.x === state.food.x && head.y === state.food.y;
  const body = ate ? state.snake : state.snake.slice(0, -1);
  const collision = head.x < 0
    || head.x >= BOARD_SIZE
    || head.y < 0
    || head.y >= BOARD_SIZE
    || body.some((part) => part.x === head.x && part.y === head.y);

  if (collision) return { ...state, direction, status: "lost" };

  const snake = [head, ...body];
  if (!ate) return { ...state, snake, direction };
  return {
    ...state,
    snake,
    direction,
    score: state.score + 1,
    food: randomFood(snake),
  };
}

function readBestScore() {
  try {
    return Number(localStorage.getItem("mkh-arcade.snake-best")) || 0;
  } catch {
    return 0;
  }
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
    // Restricted browser context fallback.
  }
}

function scoreLabel(value: number) {
  return String(value).padStart(3, "0");
}

export function SnakeGame({ language }: { language: ArcadeLanguage }) {
  const text = copy[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [game, dispatch] = useReducer(reducer, undefined, createGame);
  const [resizeVersion, setResizeVersion] = useState(0);
  const best = useSyncExternalStore(subscribeBestScore, readBestScore, () => 0);

  useEffect(() => {
    if (game.score > readBestScore()) saveBestScore(game.score);
  }, [game.score]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setResizeVersion((version) => version + 1));
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (game.status !== "running") return;
    const delay = Math.max(68, 125 - game.score * 2);
    const timer = window.setTimeout(() => dispatch({ type: "tick" }), delay);
    return () => window.clearTimeout(timer);
  }, [game.score, game.snake, game.status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = canvas.clientWidth;
    if (!size) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelSize = Math.round(size * dpr);
    if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
      canvas.width = pixelSize;
      canvas.height = pixelSize;
    }
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = false;
    context.clearRect(0, 0, size, size);

    const cell = size / BOARD_SIZE;
    context.fillStyle = "#0b090c";
    context.fillRect(0, 0, size, size);

    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        if ((x + y) % 2 === 0) {
          context.fillStyle = "rgba(243, 239, 238, 0.018)";
          context.fillRect(x * cell, y * cell, cell, cell);
        }
      }
    }

    context.strokeStyle = "rgba(243, 239, 238, 0.075)";
    context.lineWidth = 1;
    for (let index = 1; index < BOARD_SIZE; index += 1) {
      const offset = Math.round(index * cell) + 0.5;
      context.beginPath();
      context.moveTo(offset, 0);
      context.lineTo(offset, size);
      context.stroke();
      context.beginPath();
      context.moveTo(0, offset);
      context.lineTo(size, offset);
      context.stroke();
    }

    const head = game.snake[0];
    [...game.snake].reverse().forEach((part, reversedIndex) => {
      const originalIndex = game.snake.length - 1 - reversedIndex;
      const isHead = part.x === head.x && part.y === head.y;
      const inset = Math.max(1, cell * 0.055);
      const x = part.x * cell + inset;
      const y = part.y * cell + inset;
      const segment = cell - inset * 2;

      context.fillStyle = isHead
        ? "#f3b7c7"
        : originalIndex % 2 === 0
          ? "#a92e58"
          : "#cf4b77";
      context.fillRect(x, y, segment, segment);

      if (!isHead && cell > 11) {
        context.fillStyle = "rgba(255, 255, 255, 0.09)";
        context.fillRect(x + segment * 0.18, y + segment * 0.18, segment * 0.22, segment * 0.22);
      }
    });

    if (head) {
      const direction = game.direction;
      const eye = Math.max(2, cell * 0.13);
      const x = head.x * cell;
      const y = head.y * cell;
      const frontX = x + cell / 2 + direction.x * cell * 0.23;
      const frontY = y + cell / 2 + direction.y * cell * 0.23;
      context.fillStyle = "#151114";
      if (direction.x !== 0) {
        context.fillRect(frontX - eye / 2, y + cell * 0.27 - eye / 2, eye, eye);
        context.fillRect(frontX - eye / 2, y + cell * 0.73 - eye / 2, eye, eye);
      } else {
        context.fillRect(x + cell * 0.27 - eye / 2, frontY - eye / 2, eye, eye);
        context.fillRect(x + cell * 0.73 - eye / 2, frontY - eye / 2, eye, eye);
      }
    }

    const foodX = (game.food.x + 0.5) * cell;
    const foodY = (game.food.y + 0.5) * cell;
    context.save();
    context.translate(foodX, foodY);
    context.rotate(Math.PI / 4);
    context.shadowColor = "#f3b7c7";
    context.shadowBlur = cell * 0.7;
    context.fillStyle = "#f3efee";
    context.fillRect(-cell * 0.22, -cell * 0.22, cell * 0.44, cell * 0.44);
    context.shadowBlur = 0;
    context.fillStyle = "#f3b7c7";
    context.fillRect(-cell * 0.09, -cell * 0.09, cell * 0.18, cell * 0.18);
    context.restore();
  }, [game, resizeVersion]);

  const steer = useCallback((direction: Direction) => {
    dispatch({ type: "steer", direction });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const direction = KEY_DIRECTIONS[key];
      if (direction) {
        event.preventDefault();
        steer(direction);
        return;
      }

      if (key === " " || key === "p") {
        if (key === " " && target?.closest("button")) return;
        event.preventDefault();
        dispatch({ type: "toggle" });
        return;
      }

      if (key === "r") {
        event.preventDefault();
        dispatch({ type: "reset" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [steer]);

  const startGame = () => {
    if (game.status === "lost") {
      dispatch({ type: "reset" });
      dispatch({ type: "start" });
    } else {
      dispatch({ type: "start" });
    }
    window.requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }));
  };

  const resetGame = () => {
    dispatch({ type: "reset" });
    window.requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }));
  };

  const togglePause = () => {
    dispatch({ type: "toggle" });
    window.requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }));
  };

  const handleCanvasClick = () => {
    if (game.status === "ready" || game.status === "paused") dispatch({ type: "start" });
    canvasRef.current?.focus({ preventScroll: true });
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = event.touches[0];
    if (touch) touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current) return;
    const touch = event.changedTouches[0];
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
  };

  const statusLabel = text[game.status];
  const overlayHint = game.status === "ready"
    ? text.readyHint
    : game.status === "paused"
      ? text.pausedHint
      : text.lostHint;
  const overlayKanji = game.status === "ready" ? "蛇" : game.status === "paused" ? "休" : "断";
  const PrimaryIcon = game.status === "running" ? Pause : Play;
  const primaryLabel = game.status === "running" ? text.pause : game.status === "paused" ? text.resume : text.start;

  return (
    <div className="snake-layout">
      <div className="snake-stage">
        <div className="game-chrome">
          <span className="game-chrome__dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="game-chrome__file">snake.exe</span>
          <span className={`game-chrome__status is-${game.status}`} aria-live="polite">
            <i /> {statusLabel}
          </span>
        </div>

        <div className="game-hud">
          <span className="game-hud__item"><small>{text.score}</small><b>{scoreLabel(game.score)}</b></span>
          <span className="game-hud__item"><small>{text.best}</small><b>{scoreLabel(best)}</b></span>
          <span className="game-hud__meta">20 × 20</span>
        </div>

        <div className="snake-screen">
          <canvas
            ref={canvasRef}
            className="snake-canvas"
            aria-label={`${text.title}. ${statusLabel}. ${text.score}: ${game.score}.`}
            tabIndex={0}
            onClick={handleCanvasClick}
            onTouchStart={handleTouchStart}
            onTouchMove={(event) => event.preventDefault()}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={() => { touchStartRef.current = null; }}
          />
          {game.status !== "running" ? (
            <div className={`snake-overlay is-${game.status}`} aria-hidden="true">
              <span className="snake-overlay__kanji">{overlayKanji}</span>
              <strong>{statusLabel}</strong>
              {game.status === "lost" ? (
                <span className="snake-overlay__score">{text.score} <b>{scoreLabel(game.score)}</b></span>
              ) : null}
              <span className="snake-overlay__hint">{overlayHint}</span>
            </div>
          ) : null}
        </div>

        <div className="snake-controls">
          <div className="snake-actions">
            <button type="button" className="arcade-button is-primary" onClick={game.status === "running" ? togglePause : startGame}>
              <PrimaryIcon width={14} height={14} aria-hidden="true" />
              {primaryLabel}
            </button>
            <button type="button" className="arcade-button" onClick={resetGame}>
              <RotateCcw width={14} height={14} aria-hidden="true" />
              {text.reset}
            </button>
          </div>

          <div className="snake-dpad" role="group" aria-label={text.dpad}>
            <button type="button" className="is-up" aria-label={text.up} onClick={() => steer({ x: 0, y: -1 })}>
              <ArrowUp width={16} height={16} aria-hidden="true" />
            </button>
            <button type="button" className="is-left" aria-label={text.left} onClick={() => steer({ x: -1, y: 0 })}>
              <ArrowLeft width={16} height={16} aria-hidden="true" />
            </button>
            <span className="snake-dpad__core" aria-hidden="true" />
            <button type="button" className="is-right" aria-label={text.right} onClick={() => steer({ x: 1, y: 0 })}>
              <ArrowRight width={16} height={16} aria-hidden="true" />
            </button>
            <button type="button" className="is-down" aria-label={text.down} onClick={() => steer({ x: 0, y: 1 })}>
              <ArrowDown width={16} height={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <aside className="game-side-panel snake-panel">
        <p className="arcade-command"><span>&gt;</span> run snake.exe</p>
        <h2>{text.title}</h2>
        <p>{text.hint}</p>
        <div className="snake-legend" aria-hidden="true">
          <span><i className="is-food" />{text.food}</span>
          <span><i className="is-self" />{text.self}</span>
        </div>
        <p className="game-help">{text.keys}</p>
      </aside>
    </div>
  );
}

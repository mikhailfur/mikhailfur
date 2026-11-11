"use client";

import { RotateCcw } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from "react";
import type { ArcadeLanguage } from "./types";

type Position = { row: number; col: number };
type Wall = { row: number; col: number; orientation: "h" | "v" };
type Turn = "player" | "bot";
type Mode = "move" | "h" | "v";
type LastMove = { position: Position; side: Turn };

const SIZE = 9;
const START_PLAYER = { row: 8, col: 4 };
const START_BOT = { row: 0, col: 4 };
const DIRECTIONS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
] as const;

const copy = {
  en: {
    goal: "Reach the top pink edge before the bot reaches yours.",
    yourTurn: "YOUR TURN",
    botTurn: "BOT CALCULATING",
    won: "ROUTE COMPLETE. YOU WIN.",
    lost: "BOT REACHED YOUR EDGE.",
    invalid: "That wall overlaps another wall or seals off a route.",
    you: "YOU",
    bot: "BOT",
    move: "move",
    wallH: "wall ↔",
    wallV: "wall ↕",
    wallsLeft: "walls",
    mode: "Board mode",
    moveHelp: "Tap a highlighted cell to step toward the top.",
    wallHelp: "Tap a pink gap to place a wall. Every route must stay open.",
    reset: "new match",
    playerTarget: "YOUR FINISH",
    botTarget: "BOT FINISH",
    row: "ROW",
    top: "01",
    bottom: "09",
    board: "Wallz 9 by 9 board",
    rowLabel: "row",
    colLabel: "col",
    legal: "legal move",
  },
  ru: {
    goal: "Доберись до верхнего розового края раньше, чем бот дойдёт до твоего.",
    yourTurn: "ТВОЙ ХОД",
    botTurn: "БОТ СЧИТАЕТ",
    won: "МАРШРУТ ЗАВЕРШЁН. ПОБЕДА.",
    lost: "БОТ ДОШЁЛ ДО ТВОЕГО КРАЯ.",
    invalid: "Стена перекрывает путь или накладывается на другую.",
    you: "ТЫ",
    bot: "БОТ",
    move: "движение",
    wallH: "стена ↔",
    wallV: "стена ↕",
    wallsLeft: "стен",
    mode: "Режим доски",
    moveHelp: "Нажми на подсвеченную клетку, чтобы шагнуть вверх.",
    wallHelp: "Нажми на розовый разрыв между клетками. Маршрут должен остаться открытым.",
    reset: "новый матч",
    playerTarget: "ТВОЙ ФИНИШ",
    botTarget: "ФИНИШ БОТА",
    row: "РЯД",
    top: "01",
    bottom: "09",
    board: "Доска Wallz 9 на 9",
    rowLabel: "ряд",
    colLabel: "колонка",
    legal: "можно ходить",
  },
  ko: {
    goal: "봇이 내 가장자리에 도달하기 전에 위쪽 분홍색 가장자리에 먼저 도착하세요.",
    yourTurn: "내 차례",
    botTurn: "봇 계산 중",
    won: "경로 완료. 승리했습니다.",
    lost: "봇이 내 가장자리에 도달했습니다.",
    invalid: "경로를 막거나 다른 벽과 겹치는 벽입니다.",
    you: "나",
    bot: "봇",
    move: "이동",
    wallH: "벽 ↔",
    wallV: "벽 ↕",
    wallsLeft: "벽",
    mode: "보드 모드",
    moveHelp: "강조된 칸을 눌러 위쪽으로 이동하세요.",
    wallHelp: "분홍색 틈을 눌러 벽을 세우세요. 모든 경로는 열려 있어야 합니다.",
    reset: "새 게임",
    playerTarget: "내 결승선",
    botTarget: "봇 결승선",
    row: "행",
    top: "01",
    bottom: "09",
    board: "Wallz 9x9 보드",
    rowLabel: "행",
    colLabel: "열",
    legal: "이동 가능",
  },
} satisfies Record<ArcadeLanguage, Record<string, string>>;

function samePosition(a: Position, b: Position) {
  return a.row === b.row && a.col === b.col;
}

function isInside(position: Position) {
  return position.row >= 0 && position.row < SIZE && position.col >= 0 && position.col < SIZE;
}

function isBlocked(from: Position, to: Position, walls: Wall[]) {
  if (from.row === to.row) {
    const col = Math.min(from.col, to.col);
    return walls.some((wall) =>
      wall.orientation === "v" && wall.col === col && (wall.row === from.row || wall.row === from.row - 1),
    );
  }

  const row = Math.min(from.row, to.row);
  return walls.some((wall) =>
    wall.orientation === "h" && wall.row === row && (wall.col === from.col || wall.col === from.col - 1),
  );
}

function legalMoves(pawn: Position, opponent: Position, walls: Wall[]) {
  const moves = new Map<string, Position>();

  for (const direction of DIRECTIONS) {
    const adjacent = { row: pawn.row + direction.row, col: pawn.col + direction.col };
    if (!isInside(adjacent) || isBlocked(pawn, adjacent, walls)) continue;

    if (!samePosition(adjacent, opponent)) {
      moves.set(`${adjacent.row}:${adjacent.col}`, adjacent);
      continue;
    }

    const beyond = { row: adjacent.row + direction.row, col: adjacent.col + direction.col };
    if (isInside(beyond) && !isBlocked(adjacent, beyond, walls)) {
      moves.set(`${beyond.row}:${beyond.col}`, beyond);
      continue;
    }

    const sides = direction.row === 0
      ? [{ row: adjacent.row - 1, col: adjacent.col }, { row: adjacent.row + 1, col: adjacent.col }]
      : [{ row: adjacent.row, col: adjacent.col - 1 }, { row: adjacent.row, col: adjacent.col + 1 }];
    sides.forEach((side) => {
      if (isInside(side) && !isBlocked(adjacent, side, walls)) moves.set(`${side.row}:${side.col}`, side);
    });
  }

  return [...moves.values()];
}

function shortestPath(start: Position, goalRow: number, walls: Wall[]) {
  const queue: Array<{ position: Position; distance: number }> = [{ position: start, distance: 0 }];
  const visited = new Set([`${start.row}:${start.col}`]);

  for (let index = 0; index < queue.length; index += 1) {
    const current = queue[index];
    if (current.position.row === goalRow) return current.distance;

    for (const direction of DIRECTIONS) {
      const next = {
        row: current.position.row + direction.row,
        col: current.position.col + direction.col,
      };
      const key = `${next.row}:${next.col}`;
      if (!isInside(next) || visited.has(key) || isBlocked(current.position, next, walls)) continue;
      visited.add(key);
      queue.push({ position: next, distance: current.distance + 1 });
    }
  }

  return Number.POSITIVE_INFINITY;
}

function canPlaceWall(candidate: Wall, walls: Wall[], player: Position, bot: Position) {
  const conflicts = walls.some((wall) => {
    if (wall.orientation === candidate.orientation) {
      return candidate.orientation === "h"
        ? wall.row === candidate.row && Math.abs(wall.col - candidate.col) <= 1
        : wall.col === candidate.col && Math.abs(wall.row - candidate.row) <= 1;
    }
    return wall.row === candidate.row && wall.col === candidate.col;
  });
  if (conflicts) return false;

  const nextWalls = [...walls, candidate];
  return Number.isFinite(shortestPath(player, 0, nextWalls)) && Number.isFinite(shortestPath(bot, 8, nextWalls));
}

function chooseBotWall(walls: Wall[], player: Position, bot: Position) {
  const playerDistance = shortestPath(player, 0, walls);
  const botDistance = shortestPath(bot, 8, walls);
  if (playerDistance > botDistance + 2) return null;

  let best: { wall: Wall; score: number } | null = null;
  for (let row = 0; row < SIZE - 1; row += 1) {
    for (let col = 0; col < SIZE - 1; col += 1) {
      for (const orientation of ["h", "v"] as const) {
        const wall = { row, col, orientation };
        if (!canPlaceWall(wall, walls, player, bot)) continue;
        const nextWalls = [...walls, wall];
        const score = shortestPath(player, 0, nextWalls) - playerDistance
          - (shortestPath(bot, 8, nextWalls) - botDistance) * 0.8;
        if (!best || score > best.score) best = { wall, score };
      }
    }
  }
  return best && best.score > 0.2 ? best.wall : null;
}

export function WallzGame({ language }: { language: ArcadeLanguage }) {
  const text = copy[language];
  const [player, setPlayer] = useState(START_PLAYER);
  const [bot, setBot] = useState(START_BOT);
  const [walls, setWalls] = useState<Wall[]>([]);
  const [playerWalls, setPlayerWalls] = useState(10);
  const [botWalls, setBotWalls] = useState(10);
  const [turn, setTurn] = useState<Turn>("player");
  const [mode, setMode] = useState<Mode>("move");
  const [winner, setWinner] = useState<Turn | null>(null);
  const [notice, setNotice] = useState("");
  const [lastWall, setLastWall] = useState<Wall | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [hoverWall, setHoverWall] = useState<Wall | null>(null);

  const canAct = turn === "player" && !winner;
  const moves = canAct && mode === "move" ? legalMoves(player, bot, walls) : [];

  const wallFromPoint = (clientX: number, clientY: number, board: DOMRect): Wall | null => {
    if (mode !== "h" && mode !== "v") return null;
    const track = board.width / 17;
    const col = Math.max(0, Math.min(7, Math.round(((clientX - board.left) / track - 1.5) / 2)));
    const row = Math.max(0, Math.min(7, Math.round(((clientY - board.top) / track - 1.5) / 2)));
    return { row, col, orientation: mode };
  };

  const handleBoardClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!canAct || mode === "move") return;
    const wall = wallFromPoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    if (wall && playerWalls > 0) placePlayerWall(wall);
  };

  const handleBoardMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!canAct || mode === "move") {
      setHoverWall(null);
      return;
    }
    const wall = wallFromPoint(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect());
    if (wall && playerWalls > 0 && canPlaceWall(wall, walls, player, bot)) setHoverWall(wall);
    else setHoverWall(null);
  };

  useEffect(() => {
    if (turn !== "bot" || winner) return;
    const timer = window.setTimeout(() => {
      setNotice("");
      const wall = botWalls > 0 ? chooseBotWall(walls, player, bot) : null;
      if (wall) {
        setWalls((current) => [...current, wall]);
        setBotWalls((count) => count - 1);
        setLastWall(wall);
        setTurn("player");
        return;
      }

      const options = legalMoves(bot, player, walls);
      if (!options.length) {
        setTurn("player");
        return;
      }
      const next = options.reduce((best, option) => {
        const distance = shortestPath(option, 8, walls);
        const bestDistance = shortestPath(best, 8, walls);
        if (distance !== bestDistance) return distance < bestDistance ? option : best;
        return Math.abs(option.col - 4) < Math.abs(best.col - 4) ? option : best;
      }, options[0]);
      setBot(next);
      setLastMove({ position: next, side: "bot" });
      if (next.row === 8) setWinner("bot");
      else setTurn("player");
    }, 520);
    return () => window.clearTimeout(timer);
  }, [bot, botWalls, player, turn, walls, winner]);

  const reset = () => {
    setPlayer(START_PLAYER);
    setBot(START_BOT);
    setWalls([]);
    setPlayerWalls(10);
    setBotWalls(10);
    setTurn("player");
    setMode("move");
    setWinner(null);
    setNotice("");
    setLastWall(null);
    setLastMove(null);
    setHoverWall(null);
  };

  const movePlayer = (position: Position) => {
    if (!canAct || mode !== "move" || !moves.some((move) => samePosition(move, position))) return;
    setNotice("");
    setPlayer(position);
    setLastMove({ position, side: "player" });
    if (position.row === 0) setWinner("player");
    else setTurn("bot");
  };

  const placePlayerWall = (wall: Wall) => {
    if (!canAct || mode === "move" || playerWalls <= 0) return;
    if (wall.orientation !== mode || !canPlaceWall(wall, walls, player, bot)) {
      setNotice(text.invalid);
      return;
    }
    setNotice("");
    setWalls((current) => [...current, wall]);
    setPlayerWalls((count) => count - 1);
    setLastWall(wall);
    setTurn("bot");
  };

  const stateLabel = winner === "player"
    ? text.won
    : winner === "bot"
      ? text.lost
      : turn === "player"
        ? text.yourTurn
        : text.botTurn;
  const isLastMove = (position: Position) => Boolean(lastMove && samePosition(lastMove.position, position));
  const turnClass = winner ? "is-finished" : turn === "bot" ? "is-thinking" : "is-player";

  return (
    <div className="wallz-layout">
      <div className="wallz-stage">
        <div className="wallz-toolbar">
          <div className="wallz-mode" role="group" aria-label={text.mode}>
            <button
              type="button"
              aria-pressed={mode === "move"}
              disabled={!canAct}
              onClick={() => { setMode("move"); setNotice(""); }}
            >
              {text.move}
            </button>
            <button
              type="button"
              aria-pressed={mode === "h"}
              disabled={!canAct || playerWalls <= 0}
              onClick={() => { setMode("h"); setNotice(""); }}
            >
              {text.wallH}
            </button>
            <button
              type="button"
              aria-pressed={mode === "v"}
              disabled={!canAct || playerWalls <= 0}
              onClick={() => { setMode("v"); setNotice(""); }}
            >
              {text.wallV}
            </button>
            <span className="wallz-mode__count" aria-label={`${playerWalls} ${text.wallsLeft}`}>
              {playerWalls}<small>{text.wallsLeft}</small>
            </span>
          </div>
          <div className={`wallz-toolbar__right`}>
            <span className={`wallz-turn ${turnClass}`} aria-live="polite"><i />{stateLabel}</span>
            <button type="button" className="wallz-reset" onClick={reset} aria-label={text.reset} title={text.reset}>
              <RotateCcw width={14} height={14} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="wallz-goal wallz-goal--top">
          <span>{text.playerTarget}</span>
          <b>{text.row} {text.top}</b>
        </div>

        <div
          className={`wallz-board ${mode !== "move" && canAct ? "is-wall-mode" : ""}`}
          role="group"
          aria-label={text.board}
          onClick={handleBoardClick}
          onPointerMove={handleBoardMove}
          onPointerLeave={() => setHoverWall(null)}
        >
          {Array.from({ length: SIZE * SIZE }, (_, index) => {
            const position = { row: Math.floor(index / SIZE), col: index % SIZE };
            const isPlayer = samePosition(position, player);
            const isBot = samePosition(position, bot);
            const isMove = moves.some((move) => samePosition(move, position));
            return (
              <button
                key={`cell-${position.row}-${position.col}`}
                type="button"
                className={`wallz-cell ${position.row === 0 ? "is-player-goal" : ""} ${position.row === 8 ? "is-bot-goal" : ""} ${isMove ? "is-move" : ""} ${isLastMove(position) ? "is-last" : ""}`}
                style={{ gridRow: position.row * 2 + 1, gridColumn: position.col * 2 + 1 }}
                onClick={() => movePlayer(position)}
                disabled={!isMove}
                aria-label={`${text.rowLabel} ${position.row + 1}, ${text.colLabel} ${position.col + 1}${isMove ? `, ${text.legal}` : ""}`}
              >
                {isPlayer ? <span className="wallz-pawn is-player" aria-hidden="true">P</span> : null}
                {isBot ? <span className="wallz-pawn is-bot" aria-hidden="true">B</span> : null}
              </button>
            );
          })}

          {Array.from({ length: 64 }, (_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            return (["h", "v"] as const).map((orientation) => {
              const wall: Wall = { row, col, orientation };
              const placed = walls.some((item) => item.row === row && item.col === col && item.orientation === orientation);
              const valid = mode === orientation && canAct && playerWalls > 0 && !placed && canPlaceWall(wall, walls, player, bot);
              if (!placed && !valid) return null;

              const lineStyle = orientation === "h"
                ? { gridRow: row * 2 + 2, gridColumn: `${col * 2 + 1} / span 3` }
                : { gridRow: `${row * 2 + 1} / span 3`, gridColumn: col * 2 + 2 };
              const targetStyle = { gridRow: row * 2 + 2, gridColumn: col * 2 + 2 };
              const isLast = Boolean(lastWall && lastWall.row === row && lastWall.col === col && lastWall.orientation === orientation);
              const isHover = Boolean(hoverWall && hoverWall.row === row && hoverWall.col === col && hoverWall.orientation === orientation);

              if (placed) {
                return (
                  <span
                    key={`${orientation}-${row}-${col}`}
                    className={`wallz-wall-line is-${orientation} is-placed ${isLast ? "is-last" : ""}`}
                    style={lineStyle}
                    aria-hidden="true"
                  />
                );
              }

              return (
                <Fragment key={`${orientation}-${row}-${col}`}>
                  <span
                    className={`wallz-wall-line is-${orientation} is-valid ${isHover ? "is-hover" : ""}`}
                    style={lineStyle}
                    aria-hidden="true"
                  />
                  <button
                    type="button"
                    className={`wallz-wall-target is-${orientation}`}
                    style={targetStyle}
                    onClick={(event) => {
                      event.stopPropagation();
                      placePlayerWall(wall);
                    }}
                    onMouseEnter={() => setHoverWall(wall)}
                    onMouseLeave={() => setHoverWall(null)}
                    onFocus={() => setHoverWall(wall)}
                    onBlur={() => setHoverWall(null)}
                    title={orientation === "h" ? text.wallH : text.wallV}
                    aria-label={`${orientation === "h" ? text.wallH : text.wallV}, ${text.rowLabel} ${row + 1}, ${text.colLabel} ${col + 1}`}
                  />
                </Fragment>
              );
            });
          })}

          {winner ? (
            <div className={`wallz-result is-${winner}`} role="status">
              <span className="wallz-result__kanji" aria-hidden="true">{winner === "player" ? "勝" : "負"}</span>
              <strong>{winner === "player" ? text.won : text.lost}</strong>
              <button type="button" className="arcade-button is-primary" onClick={reset}>
                <RotateCcw width={14} height={14} aria-hidden="true" />
                {text.reset}
              </button>
            </div>
          ) : null}
        </div>

        <div className="wallz-goal wallz-goal--bottom">
          <span>{text.botTarget}</span>
          <b>{text.row} {text.bottom}</b>
        </div>
      </div>

      <aside className="game-side-panel wallz-panel">
        <p className="arcade-command"><span>&gt;</span> wallz --mode bot</p>
        <h2>WALLZ</h2>
        <p>{text.goal}</p>
        <div className="wallz-stats">
          <span><i className="is-player" />{text.you}<b>{playerWalls}</b></span>
          <span><i className="is-bot" />{text.bot}<b>{botWalls}</b></span>
        </div>
        <p className="game-help">{mode === "move" ? text.moveHelp : text.wallHelp}</p>
        {notice ? <p className="game-notice">{notice}</p> : null}
      </aside>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { ArcadeLanguage } from "./types";

type Position = { row: number; col: number };
type Wall = { row: number; col: number; orientation: "h" | "v" };
type Turn = "player" | "bot";

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
    goal: "Reach the top amber edge before the bot reaches yours.",
    yourTurn: "YOUR TURN",
    botTurn: "BOT CALCULATING",
    won: "ROUTE COMPLETE. YOU WIN.",
    lost: "BOT REACHED YOUR EDGE.",
    invalid: "That wall blocks a route or overlaps another wall.",
    walls: "walls left",
    reset: "new match",
    help: "Click a highlighted cell to move, or click any gap between cells to place a wall.",
  },
  ru: {
    goal: "Доберись до янтарного края раньше, чем бот до твоего.",
    yourTurn: "ТВОЙ ХОД",
    botTurn: "БОТ СЧИТАЕТ",
    won: "МАРШРУТ ЗАВЕРШЁН. ПОБЕДА.",
    lost: "БОТ ДОШЁЛ ДО ТВОЕГО КРАЯ.",
    invalid: "Стена перекрывает путь или накладывается на другую.",
    walls: "стен осталось",
    reset: "новый матч",
    help: "Нажмите на подсвеченную клетку для хода или на промежуток между клетками для установки стены.",
  },
  ko: {
    goal: "봇보다 먼저 반대편 주황색 가장자리에 도달하세요.",
    yourTurn: "내 차례",
    botTurn: "봇 계산 중",
    won: "경로 완료. 승리했습니다.",
    lost: "봇이 내 가장자리에 도달했습니다.",
    invalid: "경로를 막거나 다른 벽과 겹치는 벽입니다.",
    walls: "벽 남음",
    reset: "새 게임",
    help: "이동할 칸을 누르거나 칸 사이의 간격을 눌러 벽을 세우세요.",
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
  const [winner, setWinner] = useState<Turn | null>(null);
  const [notice, setNotice] = useState("");
  const moves = turn === "player" && !winner ? legalMoves(player, bot, walls) : [];

  useEffect(() => {
    if (turn !== "bot" || winner) return;
    const timer = window.setTimeout(() => {
      const wall = botWalls > 0 ? chooseBotWall(walls, player, bot) : null;
      if (wall) {
        setWalls((current) => [...current, wall]);
        setBotWalls((count) => count - 1);
        setTurn("player");
        return;
      }

      const options = legalMoves(bot, player, walls);
      const next = options.reduce((best, option) => {
        const distance = shortestPath(option, 8, walls);
        const bestDistance = shortestPath(best, 8, walls);
        if (distance !== bestDistance) return distance < bestDistance ? option : best;
        return Math.abs(option.col - 4) < Math.abs(best.col - 4) ? option : best;
      }, options[0]);
      if (!next) return;
      setBot(next);
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
    setWinner(null);
    setNotice("");
  };

  const movePlayer = (position: Position) => {
    if (turn !== "player" || winner || !moves.some((move) => samePosition(move, position))) return;
    setNotice("");
    setPlayer(position);
    if (position.row === 0) setWinner("player");
    else setTurn("bot");
  };

  const placePlayerWall = (wall: Wall) => {
    if (turn !== "player" || winner || playerWalls <= 0) return;
    if (!canPlaceWall(wall, walls, player, bot)) {
      setNotice(text.invalid);
      return;
    }
    setNotice("");
    setWalls((current) => [...current, wall]);
    setPlayerWalls((count) => count - 1);
    setTurn("bot");
  };

  return (
    <div className="wallz-layout">
      <div className="wallz-board-wrap">
        <div className="wallz-goal wallz-goal-bot">YOUR TARGET (ROW 0)</div>
        <div className="wallz-board" role="grid" aria-label="Wallz 9 by 9 board">
          {Array.from({ length: SIZE * SIZE }, (_, index) => {
            const position = { row: Math.floor(index / SIZE), col: index % SIZE };
            const isPlayer = samePosition(position, player);
            const isBot = samePosition(position, bot);
            const isMove = moves.some((move) => samePosition(move, position));
            return (
              <button
                key={`cell-${position.row}-${position.col}`}
                type="button"
                className={`wallz-cell ${position.row === 0 ? "is-player-goal" : ""} ${position.row === 8 ? "is-bot-goal" : ""} ${isMove ? "is-move" : ""}`}
                style={{ gridRow: position.row * 2 + 1, gridColumn: position.col * 2 + 1 }}
                onClick={() => movePlayer(position)}
                disabled={!isMove}
                aria-label={`row ${position.row + 1}, col ${position.col + 1}${isMove ? ", legal move" : ""}`}
              >
                {isPlayer ? <span className="wallz-pawn is-player">P</span> : null}
                {isBot ? <span className="wallz-pawn is-bot">B</span> : null}
              </button>
            );
          })}
          {Array.from({ length: 64 }, (_, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            return (["h", "v"] as const).map((orientation) => {
              const wall: Wall = { row, col, orientation };
              const placed = walls.some((item) => item.row === row && item.col === col && item.orientation === orientation);
              const valid = turn === "player" && !winner && playerWalls > 0 && !placed && canPlaceWall(wall, walls, player, bot);

              return (
                <button
                  key={`${orientation}-${row}-${col}`}
                  type="button"
                  disabled={!valid && !placed}
                  className={`wallz-wall-slot is-${orientation} ${placed ? "is-placed" : ""} ${valid ? "is-valid" : ""}`}
                  style={orientation === "h"
                    ? { gridRow: row * 2 + 2, gridColumn: `${col * 2 + 1} / span 3` }
                    : { gridRow: `${row * 2 + 1} / span 3`, gridColumn: col * 2 + 2 }}
                  onClick={() => placePlayerWall(wall)}
                  title={placed ? "Wall" : valid ? `Place ${orientation === "h" ? "horizontal" : "vertical"} wall` : undefined}
                  aria-label={`Wall slot row ${row + 1}, col ${col + 1}`}
                />
              );
            });
          })}
        </div>
        <div className="wallz-goal wallz-goal-player">BOT TARGET (ROW 8)</div>
      </div>

      <aside className="game-side-panel">
        <p className="arcade-command"><span>&gt;</span> wallz --mode bot</p>
        <h2>WALLZ</h2>
        <p>{text.goal}</p>
        <div className={`game-state-line ${winner ? "is-finished" : ""}`} aria-live="polite">
          {winner === "player" ? text.won : winner === "bot" ? text.lost : turn === "player" ? text.yourTurn : text.botTurn}
        </div>
        <div className="wallz-stats">
          <span>YOU <b>{playerWalls}</b> {text.walls}</span>
          <span>BOT <b>{botWalls}</b> {text.walls}</span>
        </div>
        <p className="game-help">{text.help}</p>
        {notice ? <p className="game-notice">[ERR] {notice}</p> : null}
        <button type="button" className="arcade-button" onClick={reset}>./{text.reset}</button>
      </aside>
    </div>
  );
}

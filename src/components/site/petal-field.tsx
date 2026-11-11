"use client";

import { useEffect, useRef } from "react";

type Petal = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  spin: number;
  opacity: number;
  color: string;
};

export function PetalField({ enabled = true }: { enabled?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const petalsRef = useRef<Petal[]>([]);
  const pointerRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduceMotion) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const createPetal = (initial = false): Petal => {
      const palette = ["rgba(169, 46, 88, 0.32)", "rgba(228, 139, 166, 0.5)", "rgba(21, 17, 20, 0.16)"];
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : -16 - Math.random() * 40,
        vx: 0.12 + Math.random() * 0.26,
        vy: 0.22 + Math.random() * 0.48,
        size: 3 + Math.random() * 5.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.012,
        opacity: 0.42 + Math.random() * 0.48,
        color: palette[Math.floor(Math.random() * palette.length)],
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = width < 700 ? 9 : width < 1100 ? 14 : 20;
      petalsRef.current = Array.from({ length: count }, () => createPetal(true));
    };

    const drawPetal = (petal: Petal) => {
      context.save();
      context.translate(petal.x, petal.y);
      context.rotate(petal.angle);
      context.globalAlpha = petal.opacity;
      context.fillStyle = petal.color;
      context.beginPath();
      context.moveTo(0, -petal.size);
      context.bezierCurveTo(
        petal.size * 0.95,
        -petal.size * 0.35,
        petal.size * 0.75,
        petal.size * 0.75,
        0,
        petal.size,
      );
      context.bezierCurveTo(
        -petal.size * 0.72,
        petal.size * 0.65,
        -petal.size * 0.95,
        -petal.size * 0.3,
        0,
        -petal.size,
      );
      context.fill();
      context.restore();
    };

    const tick = () => {
      context.clearRect(0, 0, width, height);
      const pointer = pointerRef.current;
      for (const petal of petalsRef.current) {
        petal.angle += petal.spin;
        petal.x += petal.vx + Math.sin((petal.y + petal.x) / 180) * 0.18;
        petal.y += petal.vy;

        const dx = petal.x - pointer.x;
        const dy = petal.y - pointer.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 110 && distance > 0.1) {
          const force = (110 - distance) / 110;
          petal.x += (dx / distance) * force * 1.6;
          petal.y += (dy / distance) * force * 0.8;
        }

        if (petal.y > height + 24 || petal.x > width + 30 || petal.x < -30) {
          Object.assign(petal, createPetal());
          petal.y = -16;
        }
        drawPetal(petal);
      }
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const onPointerLeave = () => {
      pointerRef.current = { x: -1000, y: -1000 };
    };

    resize();
    frameRef.current = window.requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

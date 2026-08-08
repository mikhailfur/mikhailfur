"use client";

import { useEffect, useRef } from "react";

interface CyberMatrixBackgroundProps {
  matrixActive?: boolean;
  onToggleMatrix?: () => void;
}

export function CyberMatrixBackground({ matrixActive = false }: CyberMatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse tracking for magnetic effect
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Mode 1: Ambient Cyber Particles
    const particleCount = Math.min(Math.floor((width * height) / 18000), 60);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.4 + 0.15,
    }));

    // Mode 2: Matrix Digital Rain
    const katakana = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789mikhail_fur";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (matrixActive) {
        // Render Digital Rain
        ctx.fillStyle = "rgba(11, 9, 7, 0.18)";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#F29A47"; // Theme orange rain
        ctx.font = `${fontSize}px "DepartureMono Nerd Font", monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = katakana[Math.floor(Math.random() * katakana.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Leading char is bright white-gold
          if (Math.random() > 0.88) {
            ctx.fillStyle = "#FFF7E8";
          } else {
            ctx.fillStyle = "rgba(242, 154, 71, 0.75)";
          }

          ctx.fillText(char, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } else {
        // Render Cyber Particle Field
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Move
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;

          // Mouse push
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const angle = Math.atan2(dy, dx);
            const force = (120 - dist) / 120;
            p.x -= Math.cos(angle) * force * 1.2;
            p.y -= Math.sin(angle) * force * 1.2;
          }

          // Draw particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(242, 154, 71, ${p.alpha})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = "rgba(242, 154, 71, 0.5)";
          ctx.fill();
          ctx.shadowBlur = 0;

          // Connect nearby particles
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const pdx = p.x - p2.x;
            const pdy = p.y - p2.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);

            if (pdist < 110) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(242, 154, 71, ${0.12 * (1 - pdist / 110)})`;
              ctx.lineWidth = 0.6;
              ctx.stroke();
            }
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [matrixActive]);

  return (
    <canvas
      ref={canvasRef}
      className={`cyber-canvas-bg ${matrixActive ? "is-matrix" : ""}`}
      aria-hidden="true"
    />
  );
}

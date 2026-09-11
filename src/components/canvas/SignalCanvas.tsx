"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion-tokens";

type Node = { x: number; y: number; vx: number; vy: number };
type Pulse = { from: number; to: number; t: number; speed: number };

const NODE_COUNT = 26;
const LINK_DIST = 170;
const COLORS = ["#2dd4f0", "#3d5cff", "#8b5cf6"];

/**
 * Hero backdrop — a lightweight Canvas2D network of drifting nodes with
 * occasional light "pulses" traveling between them, standing in for
 * "automation" without the weight of a WebGL scene. Family G-lite in
 * MOTION.md. Pauses off-screen, on tab-hide, and under reduced motion.
 */
export function SignalCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = false;
    const reduced = prefersReducedMotion();

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
      }));
      pulses = Array.from({ length: 5 }, () => spawnPulse());
    }

    function spawnPulse(): Pulse {
      const from = Math.floor(Math.random() * NODE_COUNT);
      let to = Math.floor(Math.random() * NODE_COUNT);
      if (to === from) to = (to + 1) % NODE_COUNT;
      return { from, to, t: 0, speed: 0.006 + Math.random() * 0.006 };
    }

    function drawFrame(animate: boolean) {
      ctx!.clearRect(0, 0, width, height);

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < LINK_DIST) {
            ctx!.strokeStyle = `rgba(120, 140, 200, ${0.14 * (1 - dist / LINK_DIST)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        ctx!.fillStyle = "rgba(200, 210, 255, 0.5)";
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      }

      // pulses
      pulses.forEach((p, idx) => {
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) return;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        const color = COLORS[idx % COLORS.length];
        ctx!.fillStyle = color;
        ctx!.shadowColor = color;
        ctx!.shadowBlur = 8;
        ctx!.beginPath();
        ctx!.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;

        if (animate) {
          p.t += p.speed;
          if (p.t >= 1) Object.assign(p, spawnPulse());
        }
      });

      if (animate) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
      }
    }

    function tick() {
      if (!running) return;
      drawFrame(true);
      raf = requestAnimationFrame(tick);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    seed();
    drawFrame(!reduced);
    if (!reduced) start();

    const ro = new ResizeObserver(() => {
      resize();
      drawFrame(!reduced);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (reduced) return;
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(canvas);

    const onVisibility = () => {
      if (reduced) return;
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

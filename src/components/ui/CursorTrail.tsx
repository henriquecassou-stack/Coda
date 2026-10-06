"use client";

import { useEffect, useRef } from "react";

/**
 * Rastro do cursor — pontinhos luminosos nas cores da marca que nascem atrás
 * do ponteiro e apagam depressa. É um efeito distinto do anel e do ponto do
 * `CustomCursor`: aquele marca a posição e o estado, este é o "sinal" se
 * espalhando. Desktop com ponteiro fino, e desligado sob movimento reduzido —
 * as mesmas duas condições do cursor, porque são o mesmo gesto.
 */

const COLORS = ["#2dd4f0", "#3d5cff", "#8b5cf6"];
const LIFE_MS = 650;
const SPAWN_MS = 28;
const MAX_PARTICLES = 40;
/** Raio do sprite de brilho, em px de CSS. */
const GLOW_R = 14;

type Particle = { x: number; y: number; born: number; color: number };

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      // O custo de um canvas é o tamanho da textura que ele envia a cada
      // redesenho, então o DPR é limitado a 1.5: num monitor 3x a diferença
      // visual num brilho desfocado é nula e a textura seria 4x maior.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // `shadowBlur` custa um passe de desfoque por chamada — com 40 partículas
    // seriam 40 por quadro. Cada cor vira um sprite desenhado uma única vez.
    const sprites = COLORS.map((color) => {
      const c = document.createElement("canvas");
      c.width = c.height = GLOW_R * 2;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(GLOW_R, GLOW_R, 0, GLOW_R, GLOW_R, GLOW_R);
      grad.addColorStop(0, color);
      grad.addColorStop(0.25, color);
      grad.addColorStop(1, "transparent");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(GLOW_R, GLOW_R, GLOW_R, 0, Math.PI * 2);
      g.fill();
      return c;
    });

    let particles: Particle[] = [];
    let lastSpawn = 0;
    let colorIdx = 0;
    let raf = 0;
    let awake = false;

    // O laço dorme quando a lista esvazia e é acordado pelo ponteiro. Um laço
    // que roda sempre limparia a viewport inteira 60 vezes por segundo mesmo
    // sem nenhuma partícula viva — e redesenhar é justamente o que custa.
    function tick() {
      const now = performance.now();
      particles = particles.filter((p) => now - p.born < LIFE_MS);
      ctx!.clearRect(0, 0, w, h);
      if (particles.length === 0) {
        awake = false;
        raf = 0;
        return;
      }
      for (const p of particles) {
        const t = (now - p.born) / LIFE_MS;
        const r = ((5 * (1 - t) + 1) / 5) * GLOW_R;
        ctx!.globalAlpha = (1 - t) * 0.8;
        ctx!.drawImage(sprites[p.color], p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx!.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    }

    function wake() {
      if (awake) return;
      awake = true;
      raf = requestAnimationFrame(tick);
    }

    function onMove(e: PointerEvent) {
      const now = performance.now();
      if (now - lastSpawn < SPAWN_MS) return;
      lastSpawn = now;
      particles.push({ x: e.clientX, y: e.clientY, born: now, color: colorIdx++ % COLORS.length });
      if (particles.length > MAX_PARTICLES) particles.shift();
      wake();
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="cursor-trail" aria-hidden />;
}

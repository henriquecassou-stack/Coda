"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion-tokens";

type Node = { x: number; y: number; vx: number; vy: number };
type Pulse = { from: number; to: number; t: number; speed: number };

const NODE_COUNT = 26;
const LINK_DIST = 170;
const LINK_DIST_SQ = LINK_DIST * LINK_DIST;
const COLORS = ["#2dd4f0", "#3d5cff", "#8b5cf6"];
/**
 * As ligações são agrupadas em faixas de opacidade e cada faixa vira UM path.
 * Com 26 nós são 325 pares por quadro; traçar cada um separadamente eram ~60
 * chamadas de stroke por quadro, e o custo está na chamada, não no pixel.
 */
const LINK_BANDS = 4;
/** Raio do sprite de brilho do pulso, em px de CSS. */
const GLOW_R = 13;
/**
 * Teto de 30 quadros por segundo para o desenho.
 *
 * Medido: com o canvas na tela mas SEM redesenhar, a página fica em 16,7ms por
 * quadro (60fps); redesenhando a cada quadro, vai para 30ms (33fps). O custo
 * não é o JS (estrangular a CPU em 4x não muda nada) nem a quantidade de
 * pixels (1080x675 e 1440x900 medem igual) — é o envio da textura do canvas
 * para composição, uma vez por redesenho.
 *
 * Como isto é um grafo ambiente à deriva, e não uma animação que alguém
 * acompanha, 30fps é indistinguível de 60 a olho nu e devolve metade do
 * orçamento de quadro para o resto da página. O passo da física é escalado
 * pelo tempo decorrido, então a velocidade aparente não muda.
 */
const DRAW_INTERVAL_MS = 1000 / 30;

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
    // 1.5 em vez de 2: num grafo abstrato e desfocado a diferença é
    // invisível, e o trabalho por quadro cai ~44% (a área é o quadrado do
    // fator). Numa tela retina 1440x790 são 4,5M de pixels contra 2,6M.
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let nodes: Node[] = [];
    let pulses: Pulse[] = [];
    let raf = 0;
    let running = false;
    const reduced = prefersReducedMotion();
    const reactive = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced;
    const mouse = { x: -9999, y: -9999 };

    /**
     * `shadowBlur` custa um passe de desfoque por chamada de desenho — com
     * cinco pulsos são cinco por quadro, e foi o maior item do perfil do hero.
     * Cada cor vira um sprite desenhado uma vez; o quadro só faz drawImage.
     */
    /**
     * Buffers dos segmentos por faixa, alocados uma vez. Reusar os arrays
     * (length = 0) evita criar lixo a cada quadro — a 60fps isso é o
     * suficiente para o coletor aparecer no perfil.
     */
    const bands: number[][] = Array.from({ length: LINK_BANDS }, () => []);

    const glow = COLORS.map((color) => {
      const c = document.createElement("canvas");
      const size = GLOW_R * 2;
      c.width = size;
      c.height = size;
      const g = c.getContext("2d")!;
      const grad = g.createRadialGradient(GLOW_R, GLOW_R, 0, GLOW_R, GLOW_R, GLOW_R);
      grad.addColorStop(0, color);
      grad.addColorStop(0.18, color);
      grad.addColorStop(1, "transparent");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(GLOW_R, GLOW_R, GLOW_R, 0, Math.PI * 2);
      g.fill();
      return c;
    });

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    function drawFrame(animate: boolean, step = 1) {
      ctx!.clearRect(0, 0, width, height);

      // links — UMA passada pelos 325 pares, separando os segmentos por faixa
      // de opacidade, e depois um stroke por faixa. A comparação é em distância
      // ao quadrado, então o laço interno não tira raiz quadrada.
      for (let band = 0; band < LINK_BANDS; band++) bands[band].length = 0;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST_SQ) {
            bands[(d2 * LINK_BANDS) / LINK_DIST_SQ | 0].push(a.x, a.y, b.x, b.y);
          }
        }
      }
      ctx!.lineWidth = 1;
      for (let band = 0; band < LINK_BANDS; band++) {
        const seg = bands[band];
        if (seg.length === 0) continue;
        // Opacidade representativa da faixa (o meio dela).
        const strength = 1 - (band + 0.5) / LINK_BANDS;
        ctx!.strokeStyle = `rgba(120, 140, 200, ${(0.14 * strength).toFixed(3)})`;
        ctx!.beginPath();
        for (let k = 0; k < seg.length; k += 4) {
          ctx!.moveTo(seg[k], seg[k + 1]);
          ctx!.lineTo(seg[k + 2], seg[k + 3]);
        }
        ctx!.stroke();
      }

      // nodes — mesma cor para todos, então um path só resolve os 26.
      ctx!.fillStyle = "rgba(200, 210, 255, 0.5)";
      ctx!.beginPath();
      for (const n of nodes) {
        ctx!.moveTo(n.x + 1.6, n.y);
        ctx!.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
      }
      ctx!.fill();

      // pulses
      pulses.forEach((p, idx) => {
        const a = nodes[p.from];
        const b = nodes[p.to];
        if (!a || !b) return;
        const x = a.x + (b.x - a.x) * p.t;
        const y = a.y + (b.y - a.y) * p.t;
        ctx!.drawImage(glow[idx % glow.length], x - GLOW_R, y - GLOW_R);

        if (animate) {
          p.t += p.speed * step;
          if (p.t >= 1) Object.assign(p, spawnPulse());
        }
      });

      if (animate) {
        const repelRadius = 130;
        for (const n of nodes) {
          if (reactive) {
            const dx = n.x - mouse.x;
            const dy = n.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist < repelRadius && dist > 0.01) {
              const force = (1 - dist / repelRadius) * 0.06 * step;
              n.vx += (dx / dist) * force;
              n.vy += (dy / dist) * force;
              // Damp only while a force is actively applied, so the
              // repulsion can't accumulate unbounded speed but the node's
              // normal ambient drift elsewhere is untouched.
              n.vx *= 0.9;
              n.vy *= 0.9;
            }
          }
          n.x += n.vx * step;
          n.y += n.vy * step;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
        }
      }
    }

    let lastDraw = 0;
    function tick(now: number) {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      const elapsed = now - lastDraw;
      if (elapsed < DRAW_INTERVAL_MS) return;
      lastDraw = now;
      // Passo proporcional ao tempo real desde o último desenho (limitado, para
      // que voltar de uma aba em segundo plano não teleporte os nós).
      drawFrame(true, Math.min(elapsed / 16.667, 4));
    }

    function start() {
      if (running) return;
      running = true;
      // Sem isto o primeiro quadro veria "elapsed" desde o carregamento da
      // página e daria um salto na física logo ao voltar para a tela.
      lastDraw = performance.now();
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

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onPointerLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    if (reactive) {
      // Listen on window, not the canvas: the canvas and its wrapper are
      // pointer-events:none so page content behind the hero stays clickable.
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      if (reactive) {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerleave", onPointerLeave);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

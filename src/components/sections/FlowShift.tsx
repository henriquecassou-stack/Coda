"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase } from "@/lib/motion-tokens";
import { flow } from "@/lib/content";

/**
 * PROPOSTA — seção nova, ainda não aprovada (ideia 4 do briefing). Para
 * remover: `git revert` do commit que a criou.
 *
 * O MOTION.md declara o conceito do site como "ruído que vira sinal", mas até
 * aqui ele só estava aplicado a texto entrando na tela. Esta seção é a única em
 * que o conceito é o próprio produto: o mesmo processo, emaranhado e depois
 * encadeado, com os nós viajando fisicamente entre os dois estados enquanto as
 * arestas se desentortam junto — em vez de um crossfade entre dois desenhos,
 * que não mostraria que são os mesmos passos.
 *
 * Como funciona: os nós são HTML (o texto precisa quebrar linha de verdade),
 * posicionados em porcentagem do palco. As arestas são um SVG por cima cujo
 * viewBox é medido em pixels reais do palco — assim traço, curvatura e
 * coordenadas vivem todos no mesmo sistema, sem a distorção que um viewBox
 * normalizado (0..100 com preserveAspectRatio="none") introduziria.
 */

type Pt = { x: number; y: number };

/**
 * Posições em % do palco. `tangled` é o estado manual, `chain` o automatizado.
 * Há um par por breakpoint porque a corrente limpa é uma linha horizontal no
 * desktop e uma coluna no celular.
 */
const LAYOUT = {
  desktop: {
    tangled: [
      { x: 9, y: 36 },
      { x: 57, y: 11 },
      { x: 24, y: 85 },
      { x: 88, y: 80 },
      { x: 46, y: 34 },
    ] as Pt[],
    chain: [
      { x: 11, y: 50 },
      { x: 30.5, y: 50 },
      { x: 50, y: 50 },
      { x: 69.5, y: 50 },
      { x: 89, y: 50 },
    ] as Pt[],
  },
  mobile: {
    tangled: [
      { x: 27, y: 9 },
      { x: 73, y: 28 },
      { x: 28, y: 51 },
      { x: 74, y: 72 },
      { x: 32, y: 92 },
    ] as Pt[],
    chain: [
      { x: 50, y: 8 },
      { x: 50, y: 29 },
      { x: 50, y: 50 },
      { x: 50, y: 71 },
      { x: 50, y: 92 },
    ] as Pt[],
  },
};

/** O encadeamento real: existe nos dois estados, só entortado no manual. */
const CHAIN_EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
];
/** Retrabalho: idas e voltas que só existem com uma pessoa no meio. */
const EXTRA_EDGES: [number, number][] = [
  [1, 3],
  [2, 0],
  [4, 1],
];

/**
 * Qual aresta do encadeamento cada badge de espera marca. Elas ficam em cima
 * da linha que atrasam — flutuando soltas no palco, não diziam nada.
 */
const WAIT_ON_EDGE = [0, 1, 3];

/** Afastamento da reta, em px no eixo perpendicular. Sinais alternados para as curvas se cruzarem. */
const CHAIN_BOW = [80, -98, 72, -86];
const EXTRA_BOW = [112, -124, 98];

export function FlowShift() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradRef = useRef<SVGLinearGradientElement>(null);
  const nodeRefs = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const svg = svgRef.current;
      const grad = gradRef.current;
      const nodes = nodeRefs.current.filter(Boolean);
      if (!stage || !svg || !grad || nodes.length !== flow.steps.length) return;

      const chainPaths = gsap.utils.toArray<SVGPathElement>("[data-edge=chain]");
      const extraPaths = gsap.utils.toArray<SVGPathElement>("[data-edge=extra]");
      const waits = gsap.utils.toArray<HTMLElement>("[data-wait]");

      /** Centro de cada nó, em pixels relativos ao palco. */
      function centers(): Pt[] {
        const s = stage!.getBoundingClientRect();
        return nodes.map((n) => {
          const r = n.getBoundingClientRect();
          return { x: r.left - s.left + r.width / 2, y: r.top - s.top + r.height / 2 };
        });
      }

      /** Quadrática com o ponto de controle deslocado na perpendicular. */
      function edge(a: Pt, b: Pt, bow: number) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const cx = (a.x + b.x) / 2 + (-dy / len) * bow;
        const cy = (a.y + b.y) / 2 + (dx / len) * bow;
        return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      }

      /**
       * Redesenha a partir das posições reais dos nós. Roda a cada tick do
       * scrub: com sete arestas o custo é irrelevante, e em troca as linhas
       * acompanham os nós em vez de fazer um crossfade por cima deles.
       * `t` vai de 0 (emaranhado) a 1 (encadeado) e controla só a curvatura.
       */
      function draw(t: number) {
        const r = stage!.getBoundingClientRect();
        if (!r.width) return;
        svg!.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);
        grad!.setAttribute("x1", "0");
        grad!.setAttribute("y1", String(r.height));
        grad!.setAttribute("x2", String(r.width));
        grad!.setAttribute("y2", "0");
        const c = centers();
        chainPaths.forEach((p, i) => {
          const [a, b] = CHAIN_EDGES[i];
          p.setAttribute("d", edge(c[a], c[b], CHAIN_BOW[i] * (1 - t)));
        });
        // Ponto médio da quadrática (s = 0.5): 0.25·A + 0.5·C + 0.25·B.
        waits.forEach((w, i) => {
          const [a, b] = CHAIN_EDGES[WAIT_ON_EDGE[i]];
          const bow = CHAIN_BOW[WAIT_ON_EDGE[i]] * (1 - t);
          const dx = c[b].x - c[a].x;
          const dy = c[b].y - c[a].y;
          const len = Math.hypot(dx, dy) || 1;
          const cx = (c[a].x + c[b].x) / 2 + (-dy / len) * bow;
          const cy = (c[a].y + c[b].y) / 2 + (dx / len) * bow;
          w.style.left = `${0.25 * c[a].x + 0.5 * cx + 0.25 * c[b].x}px`;
          w.style.top = `${0.25 * c[a].y + 0.5 * cy + 0.25 * c[b].y}px`;
        });
        extraPaths.forEach((p, i) => {
          const [a, b] = EXTRA_EDGES[i];
          p.setAttribute("d", edge(c[a], c[b], EXTRA_BOW[i] * (1 - t)));
        });
      }

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 1024px)",
          isMobile: "(max-width: 1023px)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop, reduced } = ctx.conditions as { isDesktop: boolean; reduced: boolean };
          const set = isDesktop ? LAYOUT.desktop : LAYOUT.mobile;

          const place = (pts: Pt[], els: HTMLElement[]) =>
            els.forEach((el, i) => gsap.set(el, { left: `${pts[i].x}%`, top: `${pts[i].y}%` }));

          if (reduced) {
            // Sem scrub: mostra o estado final, que é o desenho que explica o
            // serviço. As duas legendas ficam visíveis lado a lado, então o
            // contraste antes/depois continua sendo dito — em texto.
            place(set.chain, nodes);
            gsap.set(extraPaths, { autoAlpha: 0 });
            gsap.set(waits, { autoAlpha: 0 });
            gsap.set("[data-node]", { borderColor: "var(--color-border-strong)", color: "#ffffff" });
            // As duas legendas ficam empilhadas em absoluto para o crossfade do
            // scrub. Aqui as duas aparecem ao mesmo tempo, então precisam voltar
            // para o fluxo — senão uma imprime por cima da outra e o bloco vira
            // um borrão ilegível.
            gsap.set("[data-caption]", { position: "relative", marginBottom: "0.75rem" });
            gsap.set("[data-caption=before], [data-caption=after], [data-after-badge]", { autoAlpha: 1 });
            const redraw = () => draw(1);
            requestAnimationFrame(redraw);
            window.addEventListener("resize", redraw);
            return () => window.removeEventListener("resize", redraw);
          }

          place(set.tangled, nodes);
          gsap.set("[data-caption=after], [data-after-badge]", { autoAlpha: 0 });
          gsap.set("[data-caption=before]", { autoAlpha: 1 });
          requestAnimationFrame(() => draw(0));

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stage,
              start: "top 78%",
              end: "center 42%",
              scrub: 0.7,
              // O ScrollTrigger já se atualiza no resize; ligar o redesenho ao
              // refresh cobre resize e mudança de breakpoint de uma vez só.
              onUpdate: (self) => draw(self.progress),
              onRefresh: (self) => draw(self.progress),
            },
          });

          nodes.forEach((n, i) => {
            tl.to(n, { left: `${set.chain[i].x}%`, top: `${set.chain[i].y}%`, ease: "none" }, 0);
          });
          // O retrabalho some antes de os nós terminarem de andar — é o que faz
          // o desenho "abrir" em vez de só deslizar.
          tl.to(extraPaths, { autoAlpha: 0, ease: "none", duration: 0.55 }, 0);
          tl.to(waits, { autoAlpha: 0, scale: 0.9, ease: "none", duration: 0.5 }, 0);
          tl.to("[data-node]", { borderColor: "var(--color-border-strong)", color: "#ffffff", ease: "none" }, 0.3);
          tl.to("[data-caption=before]", { autoAlpha: 0, ease: "none", duration: 0.3 }, 0.2);
          tl.to("[data-caption=after]", { autoAlpha: 1, ease: "none", duration: 0.3 }, 0.55);
          tl.to("[data-after-badge]", { autoAlpha: 1, ease: "none", duration: 0.25 }, 0.7);
        },
      );

      // Cabeçalho, no mesmo registro das outras seções.
      const mmHead = gsap.matchMedia();
      mmHead.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-heading-line] > span",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: rootRef.current, start: "top 82%", toggleActions: "play none none none" },
          },
        );
      });
      mmHead.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
      });

      return () => {
        mm.revert();
        mmHead.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <section id="fluxo" ref={rootRef} className="relative overflow-hidden bg-[var(--color-bg)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-14 max-w-2xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase">
            {flow.eyebrow}
          </p>
          <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span data-heading-line className="block overflow-hidden">
              <span className="block">
                {flow.headline} <span className="text-gradient">{flow.headlineGradient}</span>
              </span>
            </span>
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--color-fg-muted)]">{flow.sub}</p>
        </div>

        {/* O palco é decorativo para leitores de tela — as duas legendas abaixo
            dizem em texto exatamente o que o desenho mostra. */}
        <div ref={stageRef} aria-hidden="true" className="relative h-[29rem] w-full lg:h-[19rem]">
          <svg ref={svgRef} className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none">
            <defs>
              {/* userSpaceOnUse, não o objectBoundingBox padrão: quando a
                  aresta termina reta e horizontal, sua caixa tem altura zero,
                  e um gradiente em unidades de caixa simplesmente não pinta —
                  as linhas sumiam exatamente ao chegar no estado final.
                  As coordenadas são escritas em draw(), junto com o viewBox. */}
              <linearGradient id="flowGrad" ref={gradRef} gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2dd4f0" />
                <stop offset="52%" stopColor="#3d5cff" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {CHAIN_EDGES.map(([a, b]) => (
              <path
                key={`c-${a}-${b}`}
                data-edge="chain"
                fill="none"
                stroke="url(#flowGrad)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}
            {EXTRA_EDGES.map(([a, b]) => (
              <path
                key={`x-${a}-${b}`}
                data-edge="extra"
                fill="none"
                stroke="rgba(255,255,255,0.3)"
                strokeWidth="1.25"
                strokeDasharray="3 5"
                strokeLinecap="round"
              />
            ))}
          </svg>

          {flow.steps.map((step, i) => (
            <div
              key={step.id}
              data-node
              ref={(el) => {
                if (el) nodeRefs.current[i] = el;
              }}
              // Estado final no HTML, para quem chega sem JS ver o desenho certo.
              style={{ left: `${LAYOUT.desktop.chain[i].x}%`, top: `${LAYOUT.desktop.chain[i].y}%` }}
              className="absolute w-[8.75rem] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2.5 text-center text-[0.72rem] leading-snug font-semibold text-[var(--color-fg-muted)] sm:w-[9.5rem] sm:text-xs"
            >
              {step.label}
            </div>
          ))}

          {flow.waits.map((w) => (
            <span
              key={w.label}
              data-wait
              style={{ left: "50%", top: "50%" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-1 text-[0.62rem] font-semibold tracking-[0.08em] whitespace-nowrap text-[var(--color-fg-faint)] uppercase"
            >
              {w.label}
            </span>
          ))}
        </div>

        <div className="relative mt-6 min-h-[5rem] sm:min-h-[3.5rem]">
          <p
            data-caption="before"
            className="absolute inset-x-0 top-0 max-w-xl text-sm leading-relaxed text-[var(--color-fg-muted)]"
          >
            <span className="font-semibold text-white">Antes — </span>
            {flow.beforeCaption}
          </p>
          <p
            data-caption="after"
            className="absolute inset-x-0 top-0 max-w-xl text-sm leading-relaxed text-[var(--color-fg-muted)]"
          >
            <span className="font-semibold text-white">Depois — </span>
            {flow.afterCaption}
          </p>
        </div>

        <p
          data-after-badge
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-xs font-semibold tracking-[0.08em] text-white uppercase"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gradient-brand)" }} />
          {flow.afterBadge}
        </p>
      </div>
    </section>
  );
}

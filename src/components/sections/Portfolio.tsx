"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, stagger } from "@/lib/motion-tokens";
import { portfolio } from "@/lib/content";
import { attachTilt } from "@/lib/tilt";

export function Portfolio() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-case-card]");

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-eyebrow]",
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: dur.base,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: rootRef.current, start: "top 85%", toggleActions: "play none none none" },
          },
        );
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
        // Clip-path wipe on scroll-enter — echoes the hover wipe on the
        // description panel instead of repeating the fade-and-rise used
        // everywhere else on the page (see MOTION.md technique B.8).
        gsap.fromTo(
          cards,
          { clipPath: "inset(0% 0% 100% 0% round 1.5rem)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
            duration: dur.slow,
            ease: gsapEase.enter,
            stagger: stagger.loose,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%", toggleActions: "play none none none" },
          },
        );

        // Inner parallax on the artwork — drifts against the card's own
        // scroll, tied purely to scroll position (no independent loop).
        gsap.utils.toArray<HTMLElement>("[data-parallax-bg]").forEach((bg) => {
          const trigger = bg.closest<HTMLElement>("[data-case-card]");
          if (!trigger) return;
          gsap.fromTo(
            bg,
            { yPercent: -8 },
            { yPercent: 8, ease: "none", scrollTrigger: { trigger, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { clipPath: "none" });
        gsap.set("[data-eyebrow]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
      });

      // Cursor-reactive spotlight — desktop, fine-pointer only. Never wired on touch.
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cleanups: Array<() => void> = [];
      if (canHover) {
        cards.forEach((card) => {
          const onMove = (e: PointerEvent) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
            card.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
          };
          card.addEventListener("pointermove", onMove);
          cleanups.push(() => card.removeEventListener("pointermove", onMove));
        });
      }

      // 3D pointer-tilt — the panel catches the signal's light.
      if (canHover && !reducedMotion) {
        cards.forEach((card) => cleanups.push(attachTilt(card, 6)));
      }

      return () => {
        mm.revert();
        cleanups.forEach((fn) => fn());
      };
    },
    { scope: rootRef },
  );

  return (
    /* Padding de topo menor que o de baixo, só aqui: esta é a única seção
       que vem logo depois de uma seção fixada de tela cheia, e o quadro
       fixado já termina com ~210px de folga própria (o conteúdo é
       centralizado em 100svh). Com py-28 dos dois lados dava 322px de
       preto seguido entre o fim do "Como funciona" e a palavra
       "Portfólio". A folga de baixo continua igual à das outras seções. */
    <section
      id="portfolio"
      ref={rootRef}
      className="relative pt-8 pb-20 sm:pt-12 sm:pb-28"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-16 max-w-2xl">
          <p
            data-eyebrow
            className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase"
          >
            Portfólio
          </p>
          <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span data-heading-line className="block overflow-hidden">
              <span className="block">
                PROJETOS QUE <span className="text-gradient">SAÍRAM DO PAPEL.</span>
              </span>
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {portfolio.map((item) => (
            <article
              key={item.id}
              data-case-card
              data-cursor="view"
              data-cursor-label="Ver"
              className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)]"
              style={{
                // spotlight vars, set via pointermove above
                ["--spot-x" as string]: "50%",
                ["--spot-y" as string]: "50%",
              }}
            >
              <div className="relative flex aspect-[4/3] flex-col justify-end overflow-hidden p-7 transition-transform duration-700 ease-[var(--ease-move)] group-hover:scale-[1.04] sm:p-9">
                {/* parallax layer — oversized so the scroll-linked drift never
                    exposes an edge. Uses the real screenshot when the case has
                    one, and the brand gradient as the fallback. */}
                <div data-parallax-bg aria-hidden={!item.image} className="absolute inset-x-0 -top-[12%] -bottom-[12%]">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.imageAlt ?? `${item.title} — ${item.segment}`}
                      fill
                      sizes="(min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(135deg, ${item.gradientFrom}, ${item.gradientTo})` }}
                    />
                  )}
                </div>

                {/* Legibility scrim — only needed over a photo, where the tag
                    would otherwise sit on unpredictable pixels. */}
                {item.image && (
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                  />
                )}
                {/* Textura. Sem mix-blend-mode: a mesclagem obriga o compositor a
                    guardar o fundo e re-rasterizar a pilha inteira do card a cada
                    quadro, e com a camada de parallax se movendo embaixo isso
                    sozinho respondia por 23% de quadros perdidos ao rolar por esta
                    seção (medido; cai para 6% sem ela). A opacidade foi reajustada
                    de .18 para compensar a mesclagem que saiu. */}
                <div
                  aria-hidden
                  className="absolute inset-0 opacity-[0.12]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }}
                />
                {/* cursor spotlight */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(220px circle at var(--spot-x) var(--spot-y), rgba(255,255,255,0.25), transparent 65%)",
                  }}
                />

                <span className="relative w-fit rounded-full border border-white/30 bg-black/20 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-sm">
                  {item.category}
                </span>
              </div>

              <div className="relative bg-[var(--color-bg-elevated)] p-7 sm:p-9">
                <h3 className="font-[var(--font-display)] text-xl font-bold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs font-semibold tracking-[0.1em] text-[var(--color-fg-faint)] uppercase">
                  {item.segment}
                </p>

                <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-[var(--ease-move)] group-hover:grid-rows-[1fr]">
                  <p className="overflow-hidden text-sm leading-relaxed text-[var(--color-fg-muted)]">
                    <span className="block pt-4">{item.description}</span>
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

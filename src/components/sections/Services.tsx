"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { dur, gsapEase, shift, stagger } from "@/lib/motion-tokens";
import { services } from "@/lib/content";
import { attachTilt } from "@/lib/tilt";

const icons: Record<string, React.ReactNode> = {
  automacoes: (
    <>
      <circle cx="16" cy="16" r="4" />
      <circle cx="48" cy="12" r="4" />
      <circle cx="48" cy="52" r="4" />
      <circle cx="16" cy="48" r="4" />
      <path d="M20 16 L44 13 M44 15 L20 46 M20 44 L44 50" />
    </>
  ),
  sites: (
    <>
      <rect x="10" y="12" width="44" height="40" rx="4" />
      <path d="M10 22 H54" />
      <circle cx="16" cy="17" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="21" cy="17" r="1.4" fill="currentColor" stroke="none" />
      <path d="M18 32 H34 M18 40 H28" />
    </>
  ),
};

export function Services() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-service-card]");

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

        cards.forEach((card, i) => {
          const fromX = i % 2 === 0 ? -shift.lg : shift.lg;
          gsap.fromTo(
            card,
            { autoAlpha: 0, x: fromX },
            {
              autoAlpha: 1,
              x: 0,
              duration: dur.slow,
              ease: gsapEase.enter,
              scrollTrigger: { trigger: card, start: "top 82%", toggleActions: "play none none none" },
            },
          );

          const bullets = card.querySelectorAll("[data-bullet]");
          gsap.fromTo(
            bullets,
            { autoAlpha: 0, y: shift.sm },
            {
              autoAlpha: 1,
              y: 0,
              duration: dur.base,
              ease: gsapEase.enter,
              stagger: stagger.base,
              scrollTrigger: { trigger: card, start: "top 70%", toggleActions: "play none none none" },
            },
          );

          const icon = card.querySelector<SVGElement>("[data-icon-path]");
          if (icon) {
            gsap.fromTo(
              icon,
              { autoAlpha: 0, scale: 0.85, transformOrigin: "50% 50%" },
              {
                autoAlpha: 1,
                scale: 1,
                duration: dur.slow,
                ease: gsapEase.enter,
                scrollTrigger: { trigger: card, start: "top 78%", toggleActions: "play none none none" },
              },
            );
          }
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { autoAlpha: 1, x: 0 });
        gsap.set("[data-bullet]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-eyebrow]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
      });

      // 3D pointer-tilt — the panel catches the signal's light. Desktop,
      // fine-pointer only; never wired under reduced motion.
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const tiltCleanups: Array<() => void> = [];
      if (canHover && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        cards.forEach((card) => tiltCleanups.push(attachTilt(card, 6)));
      }

      return () => {
        mm.revert();
        tiltCleanups.forEach((fn) => fn());
        ScrollTrigger.getAll().forEach((st) => {
          if (cards.includes(st.trigger as HTMLElement)) st.kill();
        });
      };
    },
    { scope: rootRef },
  );

  // `overflow-x-clip` na seção: os cards entram deslizando de x: ±64px. Num
  // celular de 390px o card já ocupa quase a largura toda, então esse
  // deslocamento inicial empurrava 40px para fora e a página ganhava uma barra
  // de rolagem horizontal até a animação rodar. `clip`, e não `hidden`, porque
  // `hidden` cria um contexto de rolagem que quebraria o `position: sticky` e o
  // pin do ScrollTrigger nas seções vizinhas.
  return (
    <section id="servicos" ref={rootRef} className="relative overflow-x-clip py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-16 max-w-2xl">
          <p
            data-eyebrow
            className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase"
          >
            O que fazemos
          </p>
          <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span data-heading-line className="block overflow-hidden">
              <span className="block">
                DUAS FRENTES. <span className="text-gradient">UM SÓ TIME.</span>
              </span>
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              data-service-card
              className="group relative overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 transition-colors duration-[var(--dur-base)] hover:border-[var(--color-border-strong)] sm:p-12"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.14] blur-3xl transition-opacity duration-[var(--dur-slow)] group-hover:opacity-25"
                style={{ background: "var(--gradient-brand)" }}
              />

              <svg
                data-icon-path
                viewBox="0 0 64 64"
                className="relative h-12 w-12 text-[var(--color-cyan)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {icons[service.id]}
              </svg>

              <p className="relative mt-8 text-xs font-semibold tracking-[0.18em] text-[var(--color-fg-faint)] uppercase">
                {service.kicker}
              </p>
              <h3 className="relative mt-3 font-[var(--font-display)] text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {service.title}
              </h3>
              <p className="relative mt-4 max-w-md text-sm leading-relaxed text-[var(--color-fg-muted)]">
                {service.description}
              </p>

              <ul className="relative mt-8 space-y-3">
                {service.bullets.map((b) => (
                  <li
                    key={b}
                    data-bullet
                    className="flex items-start gap-3 text-sm text-[var(--color-fg-muted)]"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--gradient-brand)" }}
                    />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

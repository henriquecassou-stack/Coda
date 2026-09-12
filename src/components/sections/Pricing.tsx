"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, shift, stagger } from "@/lib/motion-tokens";
import { pricing } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { attachTilt } from "@/lib/tilt";

export function Pricing() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-pricing-card]");
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
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            stagger: stagger.loose,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%", toggleActions: "play none none none" },
          },
        );
        gsap.fromTo(
          "[data-feature]",
          { autoAlpha: 0, y: shift.sm },
          {
            autoAlpha: 1,
            y: 0,
            duration: dur.base,
            ease: gsapEase.enter,
            stagger: stagger.tight,
            scrollTrigger: { trigger: rootRef.current, start: "top 70%", toggleActions: "play none none none" },
          },
        );

        const recommended = rootRef.current?.querySelector("[data-pricing-recommended]");
        if (recommended) {
          gsap.fromTo(
            recommended,
            { boxShadow: "0 0 0 0 rgba(139,92,246,0)" },
            {
              boxShadow: "0 0 60px 6px rgba(139,92,246,0.35)",
              duration: dur.slower,
              ease: gsapEase.enter,
              yoyo: true,
              repeat: 1,
              scrollTrigger: { trigger: rootRef.current, start: "top 78%", toggleActions: "play none none none" },
            },
          );
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { autoAlpha: 1, y: 0 });
        gsap.set("[data-feature]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-eyebrow]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
      });

      // 3D pointer-tilt — the panel catches the signal's light.
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tiltCleanups: Array<() => void> = [];
      if (canHover && !reducedMotion) {
        cards.forEach((card) => tiltCleanups.push(attachTilt(card, 6)));
      }

      return () => {
        mm.revert();
        tiltCleanups.forEach((fn) => fn());
      };
    },
    { scope: rootRef },
  );

  return (
    <section id="planos" ref={rootRef} className="relative bg-[var(--color-bg)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-16 max-w-2xl">
          <p
            data-eyebrow
            className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase"
          >
            Investimento
          </p>
          <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span data-heading-line className="block overflow-hidden">
              <span className="block">
                UM PLANO PARA <span className="text-gradient">CADA MOMENTO.</span>
              </span>
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.id}
              data-pricing-card
              {...(plan.recommended ? { "data-pricing-recommended": true } : {})}
              className={`relative flex flex-col rounded-3xl p-8 sm:p-9 ${
                plan.recommended
                  ? "border-gradient bg-[var(--color-bg-elevated-2)] lg:-translate-y-4"
                  : "border border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
              }`}
            >
              {plan.recommended && (
                <span
                  className="absolute -top-3 left-8 rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.12em] text-black uppercase"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  Recomendado
                </span>
              )}

              <h3 className="font-[var(--font-display)] text-lg font-bold tracking-[0.08em] text-white">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm text-[var(--color-fg-muted)]">{plan.description}</p>

              <p className="mt-8 font-[var(--font-display)] text-2xl font-bold text-white">{plan.price}</p>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} data-feature className="flex items-start gap-3 text-sm text-[var(--color-fg-muted)]">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: "var(--gradient-brand)" }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-9">
                <Button href="#contato" variant={plan.recommended ? "primary" : "secondary"} className="w-full">
                  Solicitar orçamento
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

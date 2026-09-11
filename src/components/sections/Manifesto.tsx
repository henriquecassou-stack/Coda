"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase } from "@/lib/motion-tokens";
import { manifesto } from "@/lib/content";

/**
 * Full-bleed editorial statement — a deliberate rhythm-breaker between the
 * proof-heavy Portfolio and Prova social sections (layout-inspiration pass,
 * see MOTION.md). Minimal chrome on purpose: no card, no grid, just type.
 */
export function Manifesto() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-manifesto=eyebrow]",
          { autoAlpha: 0, y: 12 },
          {
            autoAlpha: 1,
            y: 0,
            duration: dur.base,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%", toggleActions: "play none none none" },
          },
        );

        const lines = gsap.utils.toArray<HTMLElement>("[data-manifesto=line]");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: rootRef.current, start: "top 68%", toggleActions: "play none none none" },
        });
        lines.forEach((lineEl, i) => {
          const inner = lineEl.querySelector<HTMLElement>(":scope > span");
          if (!inner) return;
          tl.fromTo(
            inner,
            { yPercent: 100, scale: 0.96 },
            { yPercent: 0, scale: 1, duration: dur.slower, ease: gsapEase.enter, transformOrigin: "50% 100%" },
            i === 0 ? undefined : "-=0.35",
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(["[data-manifesto=eyebrow]", "[data-manifesto=line] > span"], {
          autoAlpha: 1,
          yPercent: 0,
          y: 0,
          scale: 1,
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-[var(--color-bg)] py-32 sm:py-44">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(61,92,255,0.12), transparent 65%)" }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center sm:px-10">
        <p
          data-manifesto="eyebrow"
          className="mb-8 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase"
        >
          {manifesto.eyebrow}
        </p>
        <h2 className="font-[var(--font-display)] text-[13vw] leading-[0.94] font-bold tracking-tight text-white sm:text-[7vw] lg:text-[6.5rem]">
          {manifesto.lines.map((line) => (
            <span key={line} data-manifesto="line" className="block overflow-hidden">
              <span className={`block ${line === manifesto.highlightLine ? "text-gradient" : ""}`}>{line}</span>
            </span>
          ))}
        </h2>
      </div>
    </section>
  );
}

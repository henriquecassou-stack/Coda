"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase } from "@/lib/motion-tokens";
import { manifesto } from "@/lib/content";

/**
 * Full-bleed editorial statement — a deliberate rhythm-breaker between the
 * proof-heavy Portfolio and Prova social sections (layout-inspiration pass,
 * see MOTION.md). Minimal chrome on purpose: no card, no grid, no eyebrow —
 * just type, so it reads as a pause rather than another labeled section.
 */
export function Manifesto() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
        gsap.set("[data-manifesto=line] > span", { yPercent: 0, scale: 1 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="relative overflow-hidden bg-[var(--color-bg)] py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(61,92,255,0.12), transparent 65%)" }}
      />

      <div className="relative mx-auto max-w-5xl px-6 text-center sm:px-10">
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

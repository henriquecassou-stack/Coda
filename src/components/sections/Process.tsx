"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, shift } from "@/lib/motion-tokens";
import { process } from "@/lib/content";

/**
 * Signature moment #2 (see MOTION.md): a pinned storytelling timeline whose
 * progress rail is the same ribbon-fold motif as the preloader and final CTA.
 */
export function Process() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<HTMLDivElement[]>([]);
  const dotRefs = useRef<HTMLSpanElement[]>([]);
  const railFillRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const steps = stepRefs.current.filter(Boolean);
      const dots = dotRefs.current.filter(Boolean);
      const railFill = railFillRef.current;
      if (!section || steps.length === 0) return;

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
            scrollTrigger: { trigger: section, start: "top 85%", toggleActions: "play none none none" },
          },
        );
        gsap.fromTo(
          "[data-heading-line] > span",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: section, start: "top 82%", toggleActions: "play none none none" },
          },
        );

        gsap.set(steps, { autoAlpha: 0, y: shift.md });
        gsap.set(steps[0], { autoAlpha: 1, y: 0 });
        gsap.set(railFill, { scaleY: 0, transformOrigin: "top center" });

        let lastActive = 0;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${(steps.length - 1) * 80}%`,
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.round(self.progress * (steps.length - 1));
              if (idx !== lastActive) {
                dots[lastActive]?.classList.remove("is-active");
                dots[idx]?.classList.add("is-active");
                lastActive = idx;
              }
            },
          },
        });

        tl.to(railFill, { scaleY: 1, duration: steps.length - 1, ease: "none" }, 0);

        // Each unit is a hold (read the step) followed by a short crossfade,
        // so adjacent steps never sit fully overlapped mid-scroll.
        const holdFraction = 0.6;
        const transitionDuration = 1 - holdFraction;
        for (let i = 0; i < steps.length - 1; i++) {
          const transitionStart = i + holdFraction;
          tl.to(steps[i], { autoAlpha: 0, y: -shift.md, duration: transitionDuration }, transitionStart);
          tl.fromTo(
            steps[i + 1],
            { autoAlpha: 0, y: shift.md },
            { autoAlpha: 1, y: 0, duration: transitionDuration },
            transitionStart,
          );
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(steps, { autoAlpha: 1, y: 0 });
        gsap.set(railFill, { scaleY: 1, transformOrigin: "top center" });
        gsap.set("[data-eyebrow]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
        dots.forEach((d) => d.classList.add("is-active"));
      });

      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  return (
    <section id="como-funciona" ref={sectionRef} className="relative bg-[var(--color-bg-elevated)]">
      <div className="relative flex min-h-[100svh] items-center overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 sm:px-10">
          <p
            data-eyebrow
            className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase"
          >
            Como funciona
          </p>
          <h2 className="mb-16 max-w-2xl font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span data-heading-line className="block overflow-hidden">
              <span className="block">
                DO DIAGNÓSTICO <span className="text-gradient">AO SUPORTE.</span>
              </span>
            </span>
          </h2>

          <div className="grid grid-cols-[auto_1fr] gap-8 sm:gap-14">
            {/* Progress rail — the ribbon-fold motif, motif #2 */}
            <div className="relative flex flex-col items-center">
              <div className="relative h-64 w-1 overflow-hidden rounded-full bg-white/10 sm:h-72">
                <span
                  ref={railFillRef}
                  className="absolute inset-0 block rounded-full"
                  style={{ background: "var(--gradient-brand)" }}
                />
              </div>
              <div className="absolute inset-y-0 flex h-64 flex-col items-center justify-between sm:h-72">
                {process.map((step, i) => (
                  <span
                    key={step.number}
                    ref={(el) => {
                      if (el) dotRefs.current[i] = el;
                    }}
                    className="dot-marker h-2.5 w-2.5 rounded-full border border-white/30 bg-[var(--color-bg-elevated)] transition-colors duration-300"
                  />
                ))}
              </div>
            </div>

            {/* Active step */}
            <div className="relative min-h-[220px] sm:min-h-[240px]">
              {process.map((step, i) => (
                <div
                  key={step.number}
                  ref={(el) => {
                    if (el) stepRefs.current[i] = el;
                  }}
                  className="absolute inset-0"
                >
                  <span className="text-gradient font-[var(--font-display)] text-sm font-bold tracking-[0.2em]">
                    {step.number}
                  </span>
                  <h3 className="mt-4 font-[var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--color-fg-muted)]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dot-marker.is-active { background: white; border-color: white; }
      `}</style>
    </section>
  );
}

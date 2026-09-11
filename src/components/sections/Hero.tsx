"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { dur, gsapEase, stagger } from "@/lib/motion-tokens";
import { hero } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { SignalCanvas } from "@/components/canvas/SignalCanvas";

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ delay: 0.15 });
        tl.fromTo(
          "[data-hero=eyebrow]",
          { autoAlpha: 0, y: 12 },
          { autoAlpha: 1, y: 0, duration: dur.base, ease: gsapEase.enter },
        )
          .fromTo(
            "[data-hero=line] > span",
            { yPercent: 100 },
            { yPercent: 0, duration: dur.slow, ease: gsapEase.enter, stagger: stagger.base },
            "-=0.15",
          )
          .fromTo(
            "[data-hero=sub]",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: dur.base, ease: gsapEase.enter },
            "-=0.35",
          )
          .fromTo(
            "[data-hero=cta]",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: dur.base, ease: gsapEase.enter, stagger: stagger.tight },
            "-=0.3",
          )
          .fromTo(
            "[data-hero=badge]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: dur.slow, ease: gsapEase.enter, stagger: stagger.base },
            "-=0.2",
          )
          .fromTo(
            "[data-hero=canvas]",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: dur.slower, ease: gsapEase.enter },
            "-=0.6",
          );

        const cue = gsap.to("[data-hero=cue-dot]", {
          y: 14,
          duration: 1.1,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.2,
        });

        if (rootRef.current) {
          ScrollTrigger.create({
            trigger: rootRef.current,
            start: "top top",
            end: "bottom top",
            onLeave: () => cue.pause(),
            onEnterBack: () => cue.resume(),
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          ["[data-hero=eyebrow]", "[data-hero=line] > span", "[data-hero=sub]", "[data-hero=cta]", "[data-hero=badge]", "[data-hero=canvas]"],
          { autoAlpha: 1, yPercent: 0, y: 0 },
        );
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section
      id="top"
      ref={rootRef}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-[var(--color-bg)] pt-28 pb-20"
    >
      <div
        data-hero="canvas"
        className="pointer-events-none absolute inset-0 opacity-0 [mask-image:radial-gradient(ellipse_70%_70%_at_60%_40%,black,transparent)]"
      >
        <SignalCanvas className="h-full w-full" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 60% 50% at 80% 0%, rgba(61,92,255,0.12), transparent 60%)" }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10">
        <p
          data-hero="eyebrow"
          className="mb-6 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase"
        >
          {hero.eyebrow}
        </p>

        <h1 className="max-w-4xl break-words font-[var(--font-display)] text-[10.5vw] leading-[0.98] font-bold tracking-tight text-white sm:text-[7.5vw] lg:text-[5.2rem]">
          {hero.headlineLines.map((line) => (
            <span key={line} data-hero="line" className="block overflow-hidden">
              <span
                className={`block ${line === hero.highlightWord ? "text-gradient" : ""}`}
              >
                {line}
              </span>
            </span>
          ))}
        </h1>

        <p
          data-hero="sub"
          className="mt-8 max-w-xl text-base leading-relaxed text-[var(--color-fg-muted)] sm:text-lg"
        >
          {hero.sub}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <span data-hero="cta">
            <Button href={hero.ctaPrimary.href}>{hero.ctaPrimary.label}</Button>
          </span>
          <span data-hero="cta">
            <Button href={hero.ctaSecondary.href} variant="secondary">
              {hero.ctaSecondary.label}
            </Button>
          </span>
        </div>

        <ul className="mt-14 flex flex-col flex-wrap gap-x-8 gap-y-3 sm:flex-row">
          {hero.badges.map((b) => (
            <li
              key={b}
              data-hero="badge"
              className="flex items-center gap-2 text-xs text-[var(--color-fg-faint)]"
            >
              <span className="h-1 w-1 rounded-full" style={{ background: "var(--gradient-brand)" }} />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex">
        <span className="h-9 w-px overflow-hidden bg-white/15">
          <span data-hero="cue-dot" className="block h-2 w-px bg-[var(--color-cyan)]" />
        </span>
      </div>
    </section>
  );
}

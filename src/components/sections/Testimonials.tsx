"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase } from "@/lib/motion-tokens";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { testimonials } from "@/lib/content";

const AUTOPLAY_MS = 6000;

export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const inViewRef = useRef(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => (inViewRef.current = entry.isIntersecting), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const id = setInterval(() => {
      if (!inViewRef.current) return;
      setIndex((i) => (i + 1) % testimonials.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [playing, reducedMotion]);

  useGSAP(
    () => {
      if (!cardRef.current) return;
      if (reducedMotion) {
        gsap.set(cardRef.current, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.fromTo(
        cardRef.current,
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: dur.base, ease: gsapEase.enter },
      );
    },
    { dependencies: [index], scope: sectionRef },
  );

  useGSAP(
    () => {
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
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" },
          },
        );
        gsap.fromTo(
          "[data-heading-line] > span",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: sectionRef.current, start: "top 82%", toggleActions: "play none none none" },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-eyebrow]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
      });
      return () => mm.revert();
    },
    { scope: sectionRef },
  );

  const current = testimonials[index];

  return (
    <section ref={sectionRef} className="relative bg-[var(--color-bg-elevated)] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center sm:px-10">
        <p
          data-eyebrow
          className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase"
        >
          Prova social
        </p>
        <h2 className="mb-16 font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
          <span data-heading-line className="block overflow-hidden">
            <span className="block">
              QUEM JÁ <span className="text-gradient">AUTOMATIZOU</span> COM A GENTE.
            </span>
          </span>
        </h2>

        {/* The box keeps the height of the longest quote so swapping never
            shifts the layout; centering means a short quote splits that slack
            evenly instead of leaving a hole above the controls. */}
        <div className="relative flex min-h-[200px] items-center justify-center">
          <div ref={cardRef} className="w-full">
            <p className="text-balance font-[var(--font-display)] text-xl leading-snug font-medium text-white sm:text-2xl">
              &ldquo;{current.quote}&rdquo;
            </p>
            <p className="mt-8 text-sm font-semibold tracking-[0.06em] text-white">{current.name}</p>
            <p className="text-xs text-[var(--color-fg-faint)]">{current.role}</p>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors hover:text-white"
            aria-label={playing ? "Pausar depoimentos automáticos" : "Retomar depoimentos automáticos"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="flex gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver depoimento ${i + 1}`}
                aria-current={i === index}
                className="h-1.5 w-6 overflow-hidden rounded-full bg-white/15"
              >
                <span
                  className="block h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: i === index ? "100%" : "0%",
                    background: "var(--gradient-brand)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="1" width="3" height="10" rx="1" />
      <rect x="7" y="1" width="3" height="10" rx="1" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2.5 1.2 10 6l-7.5 4.8V1.2Z" />
    </svg>
  );
}

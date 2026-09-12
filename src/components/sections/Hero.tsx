"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
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
        );

        // Plain lines cascade in character by character; the highlighted
        // line keeps the whole-block mask reveal — the "lock" moment after
        // the flutter of characters (see MOTION.md, hero choreography).
        // Below ~640px, SplitText's per-character mask boxes measure a
        // hair wider than the plain text run did and can push a long word
        // past the line width, breaking it mid-word — so narrow viewports
        // keep the simpler, already-proven whole-line reveal instead.
        const useCharSplit = window.innerWidth >= 640;
        const lineEls = gsap.utils.toArray<HTMLElement>("[data-hero=line]");
        lineEls.forEach((lineEl, i) => {
          const inner = lineEl.querySelector<HTMLElement>(":scope > span");
          if (!inner) return;
          const position = i === 0 ? "-=0.15" : "<0.1";
          if (!useCharSplit || hero.headlineLines[i] === hero.highlightWord) {
            tl.fromTo(inner, { yPercent: 100 }, { yPercent: 0, duration: dur.slow, ease: gsapEase.enter }, position);
          } else {
            const split = SplitText.create(inner, { type: "chars", mask: "chars" });
            tl.from(
              split.chars,
              { yPercent: 100, autoAlpha: 0, duration: dur.base, stagger: stagger.tight, ease: gsapEase.enter },
              position,
            );
          }
        });

        tl.fromTo(
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

      // Mouse-reactive backdrop — the canvas drifts a few px toward the
      // pointer, on top of the node network's own pointer repulsion.
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let onPointerMove: ((e: PointerEvent) => void) | undefined;
      let onPointerLeave: (() => void) | undefined;
      if (canHover && !reducedMotion && rootRef.current) {
        const canvasWrap = rootRef.current.querySelector<HTMLElement>("[data-hero=canvas]");
        if (canvasWrap) {
          const moveX = gsap.quickTo(canvasWrap, "x", { duration: 0.6, ease: "power3" });
          const moveY = gsap.quickTo(canvasWrap, "y", { duration: 0.6, ease: "power3" });
          onPointerMove = (e: PointerEvent) => {
            const r = rootRef.current!.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            moveX(px * 18);
            moveY(py * 18);
          };
          onPointerLeave = () => {
            moveX(0);
            moveY(0);
          };
          rootRef.current.addEventListener("pointermove", onPointerMove);
          rootRef.current.addEventListener("pointerleave", onPointerLeave);
        }
      }

      return () => {
        mm.revert();
        if (onPointerMove) rootRef.current?.removeEventListener("pointermove", onPointerMove);
        if (onPointerLeave) rootRef.current?.removeEventListener("pointerleave", onPointerLeave);
      };
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

        {/* SplitText shatters each line into per-character spans and tags the
            wrapper with aria-label to compensate — but aria-label is invalid
            on a plain span, so assistive tech got a malformed node instead of
            the headline. The readable copy lives in the sr-only span; every
            element the animation touches is hidden from AT. */}
        <h1 className="max-w-4xl break-words font-[var(--font-display)] text-[10.5vw] leading-[0.98] font-bold tracking-tight text-white sm:text-[7.5vw] lg:text-[5.2rem]">
          <span className="sr-only">{hero.headlineLines.join(" ")}</span>
          <span aria-hidden="true">
            {hero.headlineLines.map((line) => (
              <span key={line} data-hero="line" className="block overflow-hidden">
                <span
                  className={`block ${line === hero.highlightWord ? "text-gradient" : ""}`}
                >
                  {line}
                </span>
              </span>
            ))}
          </span>
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

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, stagger } from "@/lib/motion-tokens";
import { capabilities } from "@/lib/content";
import { attachTilt } from "@/lib/tilt";

const sizeClass: Record<string, string> = {
  lg: "lg:col-span-2 lg:row-span-2",
  md: "",
  wide: "sm:col-span-2 lg:col-span-2",
  full: "sm:col-span-2 lg:col-span-4 sm:flex-row sm:items-center sm:justify-between",
};

export function Capabilities() {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cells = gsap.utils.toArray<HTMLElement>("[data-cell]");
      const mm = gsap.matchMedia();

      function setStat(el: HTMLElement, decimals: number) {
        const target = Number(el.dataset.statTarget);
        el.textContent = target.toFixed(decimals);
      }

      mm.add("(prefers-reduced-motion: no-preference)", () => {
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
          cells,
          { autoAlpha: 0, scale: 0.94 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: dur.slow,
            ease: gsapEase.enter,
            stagger: stagger.base,
            scrollTrigger: { trigger: rootRef.current, start: "top 78%", toggleActions: "play none none none" },
          },
        );

        // Number counters — a technique unique to this section (fits the
        // "number counters" family already approved in MOTION.md), reads as
        // the stat locking into its final value rather than a generic fade.
        cells.forEach((cell) => {
          const statEl = cell.querySelector<HTMLElement>("[data-stat-value]");
          if (!statEl) return;
          const decimals = Number(statEl.dataset.statDecimals ?? "0");
          const target = Number(statEl.dataset.statTarget);
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: dur.slower,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: cell, start: "top 80%", toggleActions: "play none none none" },
            onUpdate: () => {
              statEl.textContent = obj.v.toFixed(decimals);
            },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cells, { autoAlpha: 1, scale: 1 });
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
        cells.forEach((cell) => {
          const statEl = cell.querySelector<HTMLElement>("[data-stat-value]");
          if (statEl) setStat(statEl, Number(statEl.dataset.statDecimals ?? "0"));
        });
      });

      // 3D pointer-tilt — same "panel catches the signal's light" language
      // as Services/Portfolio/Pricing, at a slightly smaller angle since
      // some cells here are shallower than a full card.
      const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const tiltCleanups: Array<() => void> = [];
      if (canHover && !reducedMotion) {
        cells.forEach((cell) => tiltCleanups.push(attachTilt(cell, 4)));
      }

      return () => {
        mm.revert();
        tiltCleanups.forEach((fn) => fn());
      };
    },
    { scope: rootRef },
  );

  return (
    <section id="capacidades" ref={rootRef} className="relative bg-[var(--color-bg)] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span data-heading-line className="block overflow-hidden">
              <span className="block">
                {capabilities.headline} <span className="text-gradient">{capabilities.headlineGradient}</span>
              </span>
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(170px,auto)]">
          {capabilities.cells.map((cell) => (
            <div
              key={cell.id}
              data-cell
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/[0.035] p-6 transition-colors duration-[var(--dur-base)] hover:bg-white/[0.065] sm:p-8 ${sizeClass[cell.size]}`}
            >
              {cell.size === "lg" && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full opacity-[0.14] blur-3xl transition-opacity duration-[var(--dur-slow)] group-hover:opacity-25"
                  style={{ background: "var(--gradient-brand)" }}
                />
              )}

              {cell.kind === "chips" ? (
                <div className="relative">
                  <p className="font-[var(--font-display)] text-xl font-bold text-white">{cell.label}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {cell.chips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-[var(--color-border-strong)] px-3 py-1.5 text-xs font-semibold tracking-wide text-[var(--color-fg-muted)]"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <p
                    className={`relative font-[var(--font-display)] font-bold text-white ${
                      cell.size === "lg" ? "text-6xl sm:text-7xl" : "text-4xl sm:text-5xl"
                    }`}
                  >
                    {cell.kind === "stat" ? (
                      <>
                        {cell.prefix}
                        <span
                          data-stat-value
                          data-stat-target={cell.value}
                          data-stat-decimals={cell.decimals ?? 0}
                        >
                          0
                        </span>
                        {cell.suffix}
                      </>
                    ) : (
                      cell.value
                    )}
                  </p>
                  <p
                    className={`relative mt-4 text-sm leading-relaxed text-[var(--color-fg-muted)] ${
                      cell.size === "full" ? "sm:mt-0 sm:max-w-xl sm:text-right" : "max-w-xs"
                    }`}
                  >
                    {cell.label}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

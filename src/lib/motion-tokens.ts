/**
 * Motion tokens for JS (GSAP) — keep in sync with src/app/globals.css and MOTION.md.
 * Durations are in seconds, as GSAP expects.
 */

export const dur = {
  instant: 0.12,
  fast: 0.22,
  base: 0.4,
  slow: 0.7,
  slower: 1.0,
  epic: 1.6,
} as const;

/** GSAP ease names by role */
export const gsapEase = {
  enter: "power3.out",
  exit: "power2.in",
  move: "power2.inOut",
  spring: "back.out(1.3)", // magnetic CTA only
  scrub: "none",
} as const;

export const shift = { sm: 8, md: 24, lg: 64 } as const; // px

export const stagger = { tight: 0.02, base: 0.06, loose: 0.12 } as const;

/* ------------------------------------------------------------------ */
/* Motion preference: OS setting only (no in-site toggle for v1)       */
/* ------------------------------------------------------------------ */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Subscribe to OS-level reduced-motion changes. Returns an unsubscribe function. */
export function onReducedMotionChange(fn: (reduced: boolean) => void): () => void {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const handler = () => fn(mql.matches);
  mql.addEventListener("change", handler);
  return () => mql.removeEventListener("change", handler);
}

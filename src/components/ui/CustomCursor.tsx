"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * The cursor becomes the signal: a dot at the exact pointer position with a
 * trailing ring. States communicate something — a plain ring over links, a
 * filled "Ver" state over portfolio cards — never pure decoration. Desktop,
 * fine-pointer only; off under reduced motion; never hides the native
 * cursor over form fields.
 */
export function CustomCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduced) return;

    const ring = ringRef.current;
    const label = labelRef.current;
    const dot = dotRef.current;
    if (!ring || !label || !dot) return;

    const html = document.documentElement;

    const dotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3" });

    function onMove(e: PointerEvent) {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    }

    function updateState(target: EventTarget | null) {
      const el = target instanceof Element ? target : null;
      if (el?.closest("input, textarea, select")) {
        html.classList.remove("has-custom-cursor");
        return;
      }
      html.classList.add("has-custom-cursor");
      const explicit = el?.closest<HTMLElement>("[data-cursor]");
      const interactive = el?.closest("a, button");
      ring!.dataset.state = explicit?.dataset.cursor ?? (interactive ? "link" : "");
      label!.textContent = explicit?.dataset.cursorLabel ?? "";
    }

    function onOver(e: PointerEvent) {
      updateState(e.target);
    }

    html.classList.add("has-custom-cursor");
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);

    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      html.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <div aria-hidden className="cursor-layer">
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}

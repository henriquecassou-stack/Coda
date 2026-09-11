"use client";

import { useEffect, useRef } from "react";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight || 1;
      const progress = Math.min(1, Math.max(0, window.scrollY / max));
      bar!.style.transform = `scaleX(${progress})`;
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left"
      style={{ background: "var(--gradient-brand)", transform: "scaleX(0)" }}
    />
  );
}

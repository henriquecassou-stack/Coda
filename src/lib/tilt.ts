import { gsap } from "@/lib/gsap";

/**
 * Pointer-tracked 3D tilt (technique catalog E.25) — the card angles toward
 * the pointer like a panel catching the signal's light. Desktop, fine-pointer
 * only; callers gate this behind `(hover: hover) and (pointer: fine)` and
 * skip it under reduced motion.
 */
export function attachTilt(el: HTMLElement, max = 8): () => void {
  gsap.set(el, { transformPerspective: 800, transformStyle: "preserve-3d" });
  const rotX = gsap.quickTo(el, "rotateX", { duration: 0.4, ease: "power2.out" });
  const rotY = gsap.quickTo(el, "rotateY", { duration: 0.4, ease: "power2.out" });

  function onMove(e: PointerEvent) {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY(px * max);
    rotX(-py * max);
  }
  function onLeave() {
    rotX(0);
    rotY(0);
  }

  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
    gsap.set(el, { rotateX: 0, rotateY: 0 });
  };
}

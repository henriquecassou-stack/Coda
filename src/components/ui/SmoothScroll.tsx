"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion-tokens";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Inertial scroll — the signal now travels the page with weight instead of
 * a raw 1:1 scroll. Off entirely under reduced motion (native scroll stays
 * intact); synced to GSAP's ticker so ScrollTrigger (including the Process
 * pin) never jitters against it.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // lerp 0.3, não 0.1.
    //
    // Medido com eventos de roda reais (scrollTo do script não passa pelo
    // Lenis, então medir por ali esconde exatamente este problema): depois de
    // UM golpe de roda, a página levava 1046ms até parar de deslizar com
    // lerp 0.1. Os quadros estavam em 60fps o tempo todo — não era engasgo,
    // era a página não responder ao gesto. É isso que se sente como travar.
    //
    // A curva medida: 0,1 = 1046ms · 0,18 = 740ms · 0,25 = 557ms ·
    // 0,35 = 441ms · sem Lenis = 122ms. 0,3 corta a cauda para menos da
    // metade e mantém o deslize.
    //
    // Para voltar ao scroll nativo, é só não criar o Lenis (apagar este
    // componente do layout); nada mais no site depende dele além do offset
    // de âncora abaixo.
    const lenis = new Lenis({ autoRaf: false, lerp: 0.3 });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    function onAnchorClick(e: MouseEvent) {
      const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id.length < 2) return;
      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -88, duration: 1.2 });

      // preventDefault() also cancels the focus move a fragment jump normally
      // does. Without this a keyboard user activated "Serviços", watched the
      // page scroll, then kept tabbing through the nav — focus never followed
      // them into the section. Sections aren't focusable, hence the temporary
      // tabindex, removed again on blur so the DOM doesn't accumulate them.
      if (!target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      target.focus({ preventScroll: true });
    }
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, []);

  return null;
}

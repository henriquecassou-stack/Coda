"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, prefersReducedMotion } from "@/lib/motion-tokens";
import { Logo } from "./Logo";

const SESSION_KEY = "coda-preloader-seen";

/**
 * Signature moment #1 (see MOTION.md): the ribbon draws itself once, then the
 * page reveals. Skipped on repeat visits within the same session and
 * collapsed to a quick crossfade under reduced motion.
 */
export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useGSAP(
    () => {
      setMounted(true);

      let alreadySeen = false;
      try {
        alreadySeen = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {
        alreadySeen = false;
      }

      const container = containerRef.current;
      if (!container) return;

      const finish = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }
        document.body.style.overflow = "";
        container.remove();
      };

      if (alreadySeen || prefersReducedMotion()) {
        gsap.to(container, {
          autoAlpha: 0,
          duration: dur.base,
          ease: gsapEase.exit,
          onComplete: finish,
        });
        return;
      }

      document.body.style.overflow = "hidden";
      const path = document.getElementById("coda-logo-path");
      if (!(path instanceof SVGPathElement)) {
        finish();
        return;
      }

      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

      const tl = gsap.timeline({ onComplete: finish });
      tl.to(path, {
        strokeDashoffset: 0,
        duration: dur.epic,
        ease: gsapEase.enter,
      }).to(
        container,
        {
          autoAlpha: 0,
          duration: dur.slow,
          ease: gsapEase.exit,
        },
        "-=0.1",
      );
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg)]"
      style={{ visibility: mounted ? "visible" : "hidden" }}
      aria-hidden="true"
    >
      <Logo animatable className="h-16 w-16 sm:h-20 sm:w-20" />
    </div>
  );
}

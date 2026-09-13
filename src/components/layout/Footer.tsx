"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, stagger } from "@/lib/motion-tokens";
import { brand, footer } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Scale instead of the fade-and-rise used elsewhere — the page's
        // last motion closes on a slightly different note.
        gsap.fromTo(
          "[data-footer-col]",
          { autoAlpha: 0, scale: 0.96 },
          {
            autoAlpha: 1,
            scale: 1,
            duration: dur.slow,
            ease: gsapEase.enter,
            stagger: stagger.loose,
            scrollTrigger: { trigger: rootRef.current, start: "top 88%", toggleActions: "play none none none" },
          },
        );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-footer-col]", { autoAlpha: 1, scale: 1 });
      });
      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <footer ref={rootRef} className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div data-footer-col>
            <div className="flex items-center gap-2.5">
              <Logo className="h-8 w-8" />
              <span className="font-[var(--font-display)] text-lg font-bold tracking-[0.14em] text-white">
                {brand.name}
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--color-fg-muted)]">
              {brand.tagline}
            </p>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title} data-footer-col>
              <h2 className="text-xs font-semibold tracking-[0.14em] text-[var(--color-fg-faint)] uppercase">
                {col.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--color-fg-muted)] transition-colors duration-[var(--dur-fast)] hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div data-footer-col>
            <h2 className="text-xs font-semibold tracking-[0.14em] text-[var(--color-fg-faint)] uppercase">
              Contato
            </h2>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={`mailto:${brand.email}`}
                  className="text-sm text-[var(--color-fg-muted)] transition-colors duration-[var(--dur-fast)] hover:text-white"
                >
                  {brand.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${brand.phone.replace(/\D/g, "")}`}
                  className="text-sm text-[var(--color-fg-muted)] transition-colors duration-[var(--dur-fast)] hover:text-white"
                >
                  {brand.phone}
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${brand.instagramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--color-fg-muted)] transition-colors duration-[var(--dur-fast)] hover:text-white"
                >
                  @{brand.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--color-fg-faint)]">
            © {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            {brand.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium tracking-[0.08em] text-[var(--color-fg-muted)] uppercase transition-colors duration-[var(--dur-fast)] hover:text-white"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

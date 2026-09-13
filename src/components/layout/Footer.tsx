"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, stagger } from "@/lib/motion-tokens";
import { brand, footer } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";
import { SocialIcon, type IconName } from "@/components/ui/SocialIcon";

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
    <footer ref={rootRef} className="border-t border-[var(--color-border)]">
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
              {[
                { icon: "mail" as IconName, label: brand.email, href: `mailto:${brand.email}`, external: false },
                {
                  icon: "whatsapp" as IconName,
                  label: brand.phone,
                  href: `tel:${brand.phone.replace(/\D/g, "")}`,
                  external: false,
                },
                {
                  icon: "instagram" as IconName,
                  label: `@${brand.instagramHandle}`,
                  href: `https://instagram.com/${brand.instagramHandle}`,
                  external: true,
                },
                {
                  icon: "linkedin" as IconName,
                  label: `/${brand.linkedinCompany}`,
                  href: `https://linkedin.com/company/${brand.linkedinCompany}`,
                  external: true,
                },
              ].map((row) => (
                <li key={row.href}>
                  <a
                    href={row.href}
                    {...(row.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="group/row flex items-center gap-2.5 text-sm text-[var(--color-fg-muted)] transition-colors duration-[var(--dur-fast)] hover:text-white"
                  >
                    <SocialIcon
                      name={row.icon}
                      className="h-4 w-4 flex-none text-[var(--color-fg-faint)] transition-colors duration-[var(--dur-fast)] group-hover/row:text-[var(--color-cyan)]"
                    />
                    {row.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--color-fg-faint)]">
            © {new Date().getFullYear()} {brand.name}. Todos os direitos reservados.
          </p>
          <div className="flex gap-3">
            {brand.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${brand.name} no ${s.label}`}
                title={s.label}
                // 40x40 de alvo em volta de um glifo de 18px: o símbolo sozinho
                // ficaria abaixo do mínimo de 24x24 e seria difícil de acertar
                // no celular.
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-fg-muted)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-border-strong)] hover:text-white"
              >
                <SocialIcon name={s.icon} className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

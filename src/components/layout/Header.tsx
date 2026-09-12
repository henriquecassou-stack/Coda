"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase, stagger } from "@/lib/motion-tokens";
import { brand, nav } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<HTMLAnchorElement[]>([]);

  /**
   * The panel covers the whole screen, so while it is open it has to behave
   * like a dialog: Escape closes it, Tab cycles inside it, and focus goes
   * back to the button that opened it. Without this a keyboard user tabbed
   * straight out of the menu into the page underneath — which is covered,
   * so the focus ring vanished off-screen while they kept tabbing blind.
   */
  useEffect(() => {
    if (!open) return;
    const panel = menuRef.current;
    if (!panel) return;

    const focusables = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        burgerRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useGSAP(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set("[data-nav-item]", { autoAlpha: 0, y: -8 });
        gsap.to("[data-nav-item]", {
          autoAlpha: 1,
          y: 0,
          duration: dur.base,
          ease: gsapEase.enter,
          stagger: stagger.tight,
          delay: 0.05,
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-nav-item]", { autoAlpha: 1, y: 0 });
      });
      return () => mm.revert();
    },
    { scope: headerRef },
  );

  useGSAP(
    () => {
      const menu = menuRef.current;
      if (!menu) return;
      const links = linksRef.current.filter(Boolean);

      if (open) {
        document.body.style.overflow = "hidden";
        gsap.set(menu, { display: "flex" });
        gsap.fromTo(
          menu,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: dur.slow, ease: gsapEase.move },
        );
        gsap.fromTo(
          links,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: dur.base, ease: gsapEase.enter, stagger: stagger.base, delay: 0.12 },
        );
      } else {
        document.body.style.overflow = "";
        gsap.to(menu, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: dur.base,
          ease: gsapEase.exit,
          onComplete: () => gsap.set(menu, { display: "none" }),
        });
      }

      return () => {
        document.body.style.overflow = "";
      };
    },
    { dependencies: [open] },
  );

  return (
    <header
      ref={headerRef}
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-[var(--dur-base)] ${
        scrolled
          ? // Strong enough that the page can't be read through it: the hero
            // headline is ~80px tall, and blur-md at 85% left it legible
            // behind the logo and the nav links (measured: the glyphs peaked
            // at rgb(26,26,28) over an rgb(8,8,11) bar). blur-xl at 95% takes
            // that to rgb(13,13,15) over rgb(7,7,9) — no longer readable as
            // text, while the bar still reads as glass rather than a slab.
            "border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl backdrop-saturate-150"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
        <Link href="#top" data-nav-item className="flex items-center gap-2.5" aria-label={brand.name}>
          <Logo className="h-8 w-8" />
          <span className="font-[var(--font-display)] text-lg font-bold tracking-[0.14em] text-white">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              data-nav-item
              className="relative text-xs font-semibold tracking-[0.12em] text-[var(--color-fg-muted)] uppercase transition-colors duration-[var(--dur-fast)] hover:text-white [&:hover>span]:scale-x-100"
            >
              {item.label}
              <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--gradient-brand)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)]" />
            </a>
          ))}
        </nav>

        <div data-nav-item className="hidden lg:block">
          <Button href="#contato" className="!px-5 !py-2.5 !text-xs">
            Começar projeto
          </Button>
        </div>

        <button
          ref={burgerRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-border)] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          <span className="relative block h-3 w-4">
            <span
              className={`absolute left-0 top-0 h-px w-4 bg-white transition-transform duration-[var(--dur-fast)] ${open ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 bottom-0 h-px w-4 bg-white transition-transform duration-[var(--dur-fast)] ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className="fixed inset-x-0 top-[73px] bottom-0 hidden flex-col justify-center overflow-y-auto border-t border-[var(--color-border)] bg-[var(--color-bg)] px-6 pb-10 lg:hidden"
        style={{ clipPath: "inset(0% 0% 100% 0%)" }}
      >
        {/* Capped width so the links and CTA don't stretch across a tablet;
            this panel now covers everything below lg, not just phones. */}
        <div className="mx-auto flex w-full max-w-xl flex-col gap-1">
          {nav.map((item, i) => (
            <a
              key={item.href}
              ref={(el) => {
                if (el) linksRef.current[i] = el;
              }}
              href={item.href}
              onClick={() => setOpen(false)}
              className="border-b border-[var(--color-border)] py-5 text-2xl font-semibold tracking-[0.02em] text-white uppercase"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-8">
            <Button href="#contato" className="w-full" onClick={() => setOpen(false)}>
              Começar projeto
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

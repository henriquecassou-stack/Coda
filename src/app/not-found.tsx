import type { Metadata } from "next";
import Link from "next/link";
import { nav } from "@/lib/content";

/**
 * Without this file Next serves its built-in 404: a white page, in English,
 * on a site that is dark and in Portuguese — it reads as a broken site rather
 * than a wrong address, and it offers no way back.
 */
export const metadata: Metadata = {
  title: "Página não encontrada — CODA",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center px-6 py-32 sm:px-10">
      <div className="w-full max-w-xl text-center">
        <p className="text-gradient font-[var(--font-display)] text-7xl leading-none font-bold tracking-tight sm:text-8xl">
          404
        </p>

        <h1 className="mt-8 font-[var(--font-display)] text-3xl font-bold tracking-tight text-white sm:text-4xl">
          ESTA PÁGINA NÃO EXISTE.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-[var(--color-fg-muted)]">
          O endereço pode ter mudado, ou o link que você seguiu está incorreto. Volte para a página
          inicial ou vá direto para o que você procurava.
        </p>

        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.08em] text-white uppercase"
            style={{ background: "var(--gradient-brand)" }}
          >
            Voltar para o início
          </Link>
        </div>

        <nav aria-label="Seções do site" className="mt-12 border-t border-[var(--color-border)] pt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={`/${item.href}`}
                  className="text-xs font-semibold tracking-[0.12em] text-[var(--color-fg-muted)] uppercase transition-colors duration-[var(--dur-fast)] hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

import { brand, footer } from "@/lib/content";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
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
            <div key={col.title}>
              <h4 className="text-xs font-semibold tracking-[0.14em] text-[var(--color-fg-faint)] uppercase">
                {col.title}
              </h4>
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

          <div>
            <h4 className="text-xs font-semibold tracking-[0.14em] text-[var(--color-fg-faint)] uppercase">
              Contato
            </h4>
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

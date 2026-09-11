import Link from "next/link";
import { type MouseEventHandler, type ReactNode } from "react";

type Variant = "primary" | "secondary";

type CommonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

type AsButton = CommonProps & {
  href?: undefined;
  type?: "button" | "submit";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
};

type AsLink = CommonProps & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.08em] uppercase transition-transform duration-[var(--dur-fast)] ease-[var(--ease-enter)] active:scale-[0.96] focus-visible:outline-offset-4 disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "text-white",
  secondary: "text-white border border-[var(--color-border-strong)] hover:border-white/40 bg-white/[0.02]",
};

export function Button(props: AsButton | AsLink) {
  const { children, variant = "primary", className = "" } = props;
  const classes = `${base} ${variants[variant]} ${className}`;

  const content = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-full"
          style={{ background: "var(--gradient-brand)" }}
        />
      )}
      {children}
    </>
  );

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} onClick={props.onClick} className={classes}>
        {content}
      </Link>
    );
  }

  const { type = "button", onClick, disabled } = props as AsButton;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {content}
    </button>
  );
}

"use client";

import { useRef, useState, type FormEvent } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { dur, gsapEase } from "@/lib/motion-tokens";
import { brand, contact } from "@/lib/content";
import { SocialIcon, type IconName } from "@/components/ui/SocialIcon";

type Status = "idle" | "sent" | "error";

// Reuses the WhatsApp link already defined in brand.social so there's one
// source of truth; falls back to a tel: link if that entry is ever removed.
const whatsappHref =
  brand.social.find((s) => s.label.toLowerCase() === "whatsapp")?.href ??
  `tel:${brand.phone.replace(/[^\d+]/g, "")}`;

/**
 * O formulário abre o WhatsApp com a mensagem pronta, em vez de mandar um
 * e-mail pelo servidor.
 *
 * Por quê: o envio por e-mail depende de uma chave de API configurada no
 * ambiente de deploy, e sem ela o formulário recusava o envio. Pelo WhatsApp
 * não há nada para configurar, a conversa já começa no canal onde a resposta
 * acontece, e o visitante vê o que está mandando antes de mandar.
 *
 * `src/app/api/contact/route.ts` continua no projeto e funcionando. Para
 * voltar ao e-mail, é trocar o corpo de `handleSubmit` pelo `fetch` daquela
 * rota — o histórico do git tem a versão anterior inteira.
 */
function montarMensagem(d: Record<string, string>): string {
  const linhas = [
    "Olá! Vim pelo site.",
    "",
    `*Nome:* ${d.name}`,
    `*E-mail:* ${d.email}`,
  ];
  if (d.company) linhas.push(`*Empresa:* ${d.company}`);
  if (d.service) linhas.push(`*Serviço de interesse:* ${d.service}`);
  if (d.message) linhas.push("", d.message);
  return linhas.join("\n");
}

export function ContactCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const traceRef = useRef<SVGPathElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  /** Preenchido só quando o pop-up é bloqueado, para oferecer o link na mão. */
  const [whatsappUrl, setWhatsappUrl] = useState("");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const path = traceRef.current;
        if (path) {
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(path, {
            strokeDashoffset: 0,
            duration: dur.slower,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" },
          });
        }

        gsap.fromTo(
          "[data-contact-reveal]",
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            stagger: 0.08,
            scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
          },
        );
        gsap.fromTo(
          "[data-heading-line] > span",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: sectionRef.current, start: "top 72%", toggleActions: "play none none none" },
          },
        );

        // Magnetic submit button — desktop, fine-pointer only.
        const btn = submitRef.current;
        const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
        if (btn && canHover) {
          const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
          const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
          const onMove = (e: PointerEvent) => {
            const rect = btn.getBoundingClientRect();
            const relX = e.clientX - (rect.left + rect.width / 2);
            const relY = e.clientY - (rect.top + rect.height / 2);
            xTo(relX * 0.3);
            yTo(relY * 0.3);
          };
          const onLeave = () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
          };
          btn.addEventListener("pointermove", onMove);
          btn.addEventListener("pointerleave", onLeave);
          return () => {
            btn.removeEventListener("pointermove", onMove);
            btn.removeEventListener("pointerleave", onLeave);
          };
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-contact-reveal]", { autoAlpha: 1, y: 0 });
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
        if (traceRef.current) gsap.set(traceRef.current, { strokeDasharray: "none" });
      });

      return () => {
        mm.revert();
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === sectionRef.current) st.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const dados = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const url = `${whatsappHref}?text=${encodeURIComponent(montarMensagem(dados))}`;

    // `window.open` chamado direto no handler do submit conta como ação do
    // usuário, então o bloqueador de pop-up deixa passar. Se ainda assim vier
    // `null`, o link fica na tela para a pessoa clicar — melhor que um botão
    // que não faz nada.
    //
    // Sem "noopener" na string de opções, de propósito: com ela o `window.open`
    // devolve `null` SEMPRE, por especificação, e aí o teste acima acusaria
    // bloqueio em toda submissão bem-sucedida. A proteção vem de anular o
    // `opener` logo depois, que é o que "noopener" faz de útil aqui.
    const aba = window.open(url, "_blank");
    if (aba) {
      aba.opener = null;
      setStatus("sent");
      setWhatsappUrl("");
      form.reset();
    } else {
      setWhatsappUrl(url);
      setStatus("error");
    }
  }

  return (
    <section id="contato" ref={sectionRef} className="relative overflow-hidden py-20 sm:py-28">
      <svg
        className="pointer-events-none absolute -top-10 left-0 h-40 w-full opacity-70"
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="traceGradient" x1="0" y1="160" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dd4f0" />
            <stop offset="50%" stopColor="#3d5cff" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <path
          ref={traceRef}
          d="M0 150 C 260 150, 300 40, 560 40 S 900 150, 1200 20"
          fill="none"
          stroke="url(#traceGradient)"
          strokeWidth="1.5"
        />
      </svg>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 sm:px-10 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col">
          <p data-contact-reveal className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase">
            {contact.eyebrow}
          </p>
          <h2
            data-contact-reveal
            className="max-w-lg font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl"
          >
            <span data-heading-line className="block overflow-hidden">
              <span className="block">{contact.headline}</span>
            </span>
          </h2>
          <p data-contact-reveal className="mt-6 max-w-sm text-base leading-relaxed text-[var(--color-fg-muted)]">
            {contact.sub}
          </p>

          {/* Direct channels — some people would rather write than fill a form,
              and this keeps the left column from running out of content
              halfway down a tall form. */}
          <dl
            data-contact-reveal
            className="mt-12 max-w-sm divide-y divide-[var(--color-border)] border-t border-[var(--color-border)] lg:mt-auto"
          >
            {[
              {
                icon: "mail" as IconName,
                label: "E-mail",
                value: brand.email,
                href: `mailto:${brand.email}`,
                external: false,
              },
              {
                icon: "whatsapp" as IconName,
                label: "WhatsApp",
                value: brand.phone,
                href: whatsappHref,
                external: true,
              },
              {
                icon: "instagram" as IconName,
                label: "Instagram",
                value: `@${brand.instagramHandle}`,
                href: brand.instagramUrl,
                external: true,
              },
              {
                icon: "linkedin" as IconName,
                label: "LinkedIn",
                value: brand.linkedinLabel,
                href: brand.linkedinUrl,
                external: true,
              },
            ].map((channel) => (
              <div key={channel.label} className="flex items-center justify-between gap-6 py-5">
                <dt className="flex items-center gap-2.5 text-xs font-semibold tracking-[0.18em] text-[var(--color-fg-faint)] uppercase">
                  <SocialIcon name={channel.icon} className="h-4 w-4 flex-none" />
                  {channel.label}
                </dt>
                <dd>
                  <a
                    href={channel.href}
                    {...(channel.external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="text-base text-white transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-cyan)]"
                  >
                    {channel.value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <form
          data-contact-reveal
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 sm:p-10"
        >
          <Field name="name" label="Nome" required />
          <Field name="email" label="E-mail" type="email" required />
          <Field name="company" label="Empresa" />

          <div>
            <label htmlFor="service" className="mb-2 block text-xs font-semibold tracking-[0.1em] text-[var(--color-fg-faint)] uppercase">
              Serviço de interesse
            </label>
            <select
              id="service"
              name="service"
              defaultValue=""
              className="w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--color-cyan)]"
            >
              <option value="" disabled>
                Selecione uma opção
              </option>
              {contact.serviceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-xs font-semibold tracking-[0.1em] text-[var(--color-fg-faint)] uppercase">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="w-full resize-none rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[var(--color-cyan)]"
              placeholder="Conte um pouco sobre seu negócio e seu objetivo."
            />
          </div>

          {/* O rótulo diz o que o botão faz: abrir o WhatsApp numa aba nova é
              surpresa demais para um botão escrito só "Enviar mensagem". */}
          <button
            ref={submitRef}
            type="submit"
            className="relative mt-2 inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold tracking-[0.08em] text-white uppercase"
            style={{ background: "var(--gradient-brand)" }}
          >
            <SocialIcon name="whatsapp" className="h-4 w-4" />
            Enviar pelo WhatsApp
          </button>

          <p className="text-xs leading-relaxed text-[var(--color-fg-faint)]">
            Abre o WhatsApp com a mensagem pronta. Você confere antes de enviar. Prefere e-mail?{" "}
            <a href={`mailto:${brand.email}`} className="text-[var(--color-cyan)] underline underline-offset-2">
              {brand.email}
            </a>
          </p>

          <p role="status" className="min-h-[1.2em] text-sm">
            {status === "sent" && (
              <span className="text-[var(--color-cyan)]">Abrimos o WhatsApp numa aba nova — é só enviar por lá.</span>
            )}
            {status === "error" && whatsappUrl && (
              <span className="text-red-400">
                O navegador bloqueou a aba nova.{" "}
                <a href={whatsappUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                  Abrir o WhatsApp
                </a>
                .
              </span>
            )}
          </p>
        </form>
      </div>
    </section>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="group relative">
      <label htmlFor={name} className="mb-2 block text-xs font-semibold tracking-[0.1em] text-[var(--color-fg-faint)] uppercase">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="peer w-full border-0 border-b border-[var(--color-border)] bg-transparent px-0 py-3 text-sm text-white outline-none transition-colors"
      />
      <span className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-[var(--gradient-brand)] transition-transform duration-[var(--dur-base)] ease-[var(--ease-enter)] peer-focus:scale-x-100" />
    </div>
  );
}

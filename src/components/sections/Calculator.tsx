"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { dur, gsapEase } from "@/lib/motion-tokens";
import { calculator } from "@/lib/content";

/**
 * PROPOSTA — seção nova, ainda não aprovada. Para remover: apague este
 * arquivo, o import em `src/app/page.tsx` e o bloco `calculator` em
 * `src/lib/content.ts` (ou simplesmente `git revert` do commit que a criou).
 *
 * Por que ela existe: o resto da página *afirma* que automação economiza
 * tempo. Esta seção não afirma nada — ela pega os números do próprio
 * visitante e mostra quanto o trabalho repetitivo custa para ele hoje.
 * Nenhum resultado da CODA é prometido, nenhuma média inventada é usada:
 * a conta inteira fica visível embaixo do resultado, e a porcentagem
 * automatizável é uma estimativa que o visitante controla no slider.
 */

const WEEKS_PER_YEAR = 46; // 52 menos férias e feriados — declarado na UI.

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

type FieldKey = "hours" | "people" | "cost" | "share";

const fields: {
  key: FieldKey;
  label: string;
  hint: string;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}[] = [
  {
    key: "hours",
    label: "Horas por semana em tarefas repetitivas",
    hint: "Por pessoa. Copiar dados, responder as mesmas perguntas, montar relatório na mão.",
    min: 1,
    max: 40,
    step: 1,
    format: (v) => `${v} h`,
  },
  {
    key: "people",
    label: "Quantas pessoas fazem esse trabalho",
    hint: "Some todo mundo que encosta nessas tarefas, mesmo que em tempo parcial.",
    min: 1,
    max: 30,
    step: 1,
    format: (v) => (v === 1 ? "1 pessoa" : `${v} pessoas`),
  },
  {
    key: "cost",
    label: "Custo médio por hora dessa equipe",
    hint: "Salário mais encargos, dividido pelas horas trabalhadas.",
    min: 15,
    max: 300,
    step: 5,
    format: (v) => brl.format(v),
  },
  {
    key: "share",
    label: "Quanto disso você acha que dá para automatizar",
    hint: "Sua estimativa, não a nossa — mexa no slider para ver os dois cenários.",
    min: 10,
    max: 100,
    step: 5,
    format: (v) => `${v}%`,
  },
];

export function Calculator() {
  const rootRef = useRef<HTMLElement>(null);
  const [values, setValues] = useState<Record<FieldKey, number>>({
    hours: 8,
    people: 3,
    cost: 45,
    share: 50,
  });

  const result = useMemo(() => {
    const hoursYear = values.hours * values.people * WEEKS_PER_YEAR;
    const costYear = hoursYear * values.cost;
    const share = values.share / 100;
    return {
      hoursYear,
      costYear,
      hoursSaved: Math.round(hoursYear * share),
      costSaved: Math.round(costYear * share),
    };
  }, [values]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-heading-line] > span",
          { yPercent: 100 },
          {
            yPercent: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            scrollTrigger: { trigger: rootRef.current, start: "top 82%", toggleActions: "play none none none" },
          },
        );
        gsap.fromTo(
          "[data-calc-panel]",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: dur.slow,
            ease: gsapEase.enter,
            stagger: 0.12,
            scrollTrigger: { trigger: rootRef.current, start: "top 76%", toggleActions: "play none none none" },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-heading-line] > span", { yPercent: 0 });
        gsap.set("[data-calc-panel]", { autoAlpha: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { scope: rootRef },
  );

  return (
    <section id="calculadora" ref={rootRef} className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 sm:px-10">
        <div className="mb-16 max-w-2xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-muted)] uppercase">
            {calculator.eyebrow}
          </p>
          <h2 className="font-[var(--font-display)] text-4xl font-bold tracking-tight text-white sm:text-5xl">
            <span data-heading-line className="block overflow-hidden">
              <span className="block">
                {calculator.headline} <span className="text-gradient">{calculator.headlineGradient}</span>
              </span>
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-fg-muted)]">
            {calculator.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.85fr]">
          {/* Inputs */}
          <div
            data-calc-panel
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-9"
          >
            <div className="flex flex-col gap-8">
              {fields.map((f) => (
                <div key={f.key}>
                  <div className="flex items-baseline justify-between gap-4">
                    <label
                      htmlFor={`calc-${f.key}`}
                      className="text-sm font-semibold text-white"
                    >
                      {f.label}
                    </label>
                    <output
                      htmlFor={`calc-${f.key}`}
                      className="font-[var(--font-display)] text-lg font-bold whitespace-nowrap text-[var(--color-cyan)] tabular-nums"
                    >
                      {f.format(values[f.key])}
                    </output>
                  </div>
                  <input
                    id={`calc-${f.key}`}
                    type="range"
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    value={values[f.key]}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: Number(e.target.value) }))}
                    className="calc-range mt-4 w-full"
                  />
                  <p className="mt-2.5 text-xs leading-relaxed text-[var(--color-fg-faint)]">{f.hint}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Result */}
          <div
            data-calc-panel
            className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 sm:p-9"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-[0.13] blur-3xl"
              style={{ background: "var(--gradient-brand)" }}
            />

            {/* aria-live so the numbers are announced as the sliders move,
                instead of silently changing behind a screen reader user. */}
            <div className="relative" aria-live="polite">
              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-fg-faint)] uppercase">
                Esse trabalho custa hoje
              </p>
              <p className="text-gradient mt-3 font-[var(--font-display)] text-4xl leading-none font-bold tabular-nums sm:text-5xl">
                {brl.format(result.costYear)}
              </p>
              <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
                por ano — {num.format(result.hoursYear)} horas da sua equipe
              </p>

              <hr className="my-8 border-[var(--color-border)]" />

              <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-fg-faint)] uppercase">
                Se {values.share}% for automatizável
              </p>
              <p className="mt-3 font-[var(--font-display)] text-3xl leading-none font-bold text-white tabular-nums sm:text-4xl">
                {brl.format(result.costSaved)}
              </p>
              <p className="mt-2 text-sm text-[var(--color-fg-muted)]">
                de volta por ano, e {num.format(result.hoursSaved)} horas livres para o que gera receita
              </p>
            </div>

            <div className="relative mt-10">
              <a
                href="#contato"
                className="flex w-full items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold tracking-[0.08em] text-white uppercase"
                style={{ background: "var(--gradient-brand)" }}
              >
                {calculator.cta}
              </a>
              {/* A conta inteira, à vista — sem isso o número vira só mais uma
                  promessa de agência. */}
              <p className="mt-5 text-xs leading-relaxed text-[var(--color-fg-faint)]">
                Conta: {values.hours}h × {values.people}{" "}
                {values.people === 1 ? "pessoa" : "pessoas"} × {WEEKS_PER_YEAR} semanas ×{" "}
                {brl.format(values.cost)}/h. Usamos {WEEKS_PER_YEAR} semanas para descontar férias e
                feriados. A porcentagem automatizável é a sua estimativa — quanto dá para automatizar de
                verdade só o diagnóstico diz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

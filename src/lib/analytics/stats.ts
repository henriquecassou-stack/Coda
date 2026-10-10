import type { Visita } from "@/lib/analytics/store";

/**
 * Contas do painel. Funções puras — recebem a lista de visitas e devolvem
 * números — para poderem ser testadas sem banco nem servidor.
 *
 * Fuso: tudo em horário de Brasília. São Paulo não tem horário de verão desde
 * 2019, então o deslocamento é fixo em -3h; se um dia voltar, é aqui que muda.
 */

export const FUSO = "America/Sao_Paulo";
const OFFSET_MS = -3 * 60 * 60 * 1000;
const DIA_MS = 24 * 60 * 60 * 1000;

export type Periodo = "hoje" | "7d" | "30d" | "90d";
export const PERIODOS: { id: Periodo; rotulo: string }[] = [
  { id: "hoje", rotulo: "Hoje" },
  { id: "7d", rotulo: "7 dias" },
  { id: "30d", rotulo: "30 dias" },
  { id: "90d", rotulo: "90 dias" },
];

export function lerPeriodo(v: unknown): Periodo {
  return PERIODOS.some((p) => p.id === v) ? (v as Periodo) : "7d";
}

/** Meia-noite (em Brasília) do dia que contém `ms`. */
export function inicioDoDia(ms: number): number {
  const local = ms + OFFSET_MS;
  return local - (((local % DIA_MS) + DIA_MS) % DIA_MS) - OFFSET_MS;
}

/** Janela do período: de `desde` até agora. "7 dias" inclui hoje e os 6 anteriores. */
export function janela(periodo: Periodo, agora = Date.now()) {
  const hoje = inicioDoDia(agora);
  const dias = periodo === "hoje" ? 1 : periodo === "7d" ? 7 : periodo === "30d" ? 30 : 90;
  return { desde: hoje - (dias - 1) * DIA_MS, ate: agora, dias };
}

export type Coluna = { inicio: number; visitas: number };

/** Visitas por dia — ou por hora, quando o período é "hoje". */
export function porIntervalo(visitas: Visita[], periodo: Periodo, agora = Date.now()): Coluna[] {
  const { desde, dias } = janela(periodo, agora);
  const passo = periodo === "hoje" ? 60 * 60 * 1000 : DIA_MS;
  const n = periodo === "hoje" ? 24 : dias;
  const colunas: Coluna[] = Array.from({ length: n }, (_, i) => ({ inicio: desde + i * passo, visitas: 0 }));
  for (const v of visitas) {
    const i = Math.floor((v.inicio - desde) / passo);
    if (i >= 0 && i < n) colunas[i].visitas++;
  }
  return colunas;
}

export const FAIXAS_TEMPO = [
  { rotulo: "Menos de 10 s", ate: 10_000 },
  { rotulo: "10 a 30 s", ate: 30_000 },
  { rotulo: "30 s a 1 min", ate: 60_000 },
  { rotulo: "1 a 3 min", ate: 180_000 },
  { rotulo: "3 a 10 min", ate: 600_000 },
  { rotulo: "Mais de 10 min", ate: Infinity },
];

export function resumo(visitas: Visita[]) {
  const duracoes = visitas.map((v) => v.duracaoMs).sort((a, b) => a - b);
  const total = visitas.length;
  const soma = duracoes.reduce((s, d) => s + d, 0);
  const meio = Math.floor(total / 2);
  const mediana = total === 0 ? 0 : total % 2 ? duracoes[meio] : (duracoes[meio - 1] + duracoes[meio]) / 2;

  const faixas = FAIXAS_TEMPO.map((f) => ({ rotulo: f.rotulo, visitas: 0 }));
  for (const d of duracoes) faixas[FAIXAS_TEMPO.findIndex((f) => d < f.ate)].visitas++;

  const contar = (chave: (v: Visita) => string) => {
    const m = new Map<string, number>();
    for (const v of visitas) m.set(chave(v), (m.get(chave(v)) ?? 0) + 1);
    return [...m.entries()].map(([rotulo, n]) => ({ rotulo, visitas: n })).sort((a, b) => b.visitas - a.visitas);
  };

  return {
    total,
    mediaMs: total ? soma / total : 0,
    medianaMs: mediana,
    rapidas: faixas[0].visitas,
    faixas,
    origens: contar((v) => v.origem || "Acesso direto"),
    dispositivos: contar((v) => v.dispositivo),
  };
}

/** "45 s", "2 min 05 s", "1 h 03 min". */
export function fmtDuracao(ms: number): string {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} s`;
  const min = Math.floor(s / 60);
  if (min < 60) return `${min} min ${String(s % 60).padStart(2, "0")} s`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
}

const fmtDataHora = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
export const fmtQuando = (ms: number) => fmtDataHora.format(ms).replace(",", "");

const fmtDiaSemana = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, weekday: "short", day: "2-digit", month: "2-digit" });
const fmtDiaCurto = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, day: "2-digit", month: "2-digit" });
const fmtHora = new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" });

/** Rótulo longo (tooltip) e curto (eixo) de uma coluna. */
export function rotulosColuna(inicio: number, periodo: Periodo) {
  if (periodo === "hoje") {
    const h = fmtHora.format(inicio);
    return { longo: `${h} às ${fmtHora.format(inicio + 59 * 60 * 1000)}`, curto: h.slice(0, 2) + "h" };
  }
  return { longo: fmtDiaSemana.format(inicio).replace(".", ""), curto: fmtDiaCurto.format(inicio) };
}

/** Topo "redondo" do eixo e as marcações: 0, metade e topo, sempre inteiros. */
export function eixoY(maximo: number): number[] {
  if (maximo <= 0) return [0, 1];
  if (maximo <= 4) return [0, Math.ceil(maximo / 2), Math.max(2, Math.ceil(maximo / 2) * 2)].filter((v, i, a) => a.indexOf(v) === i);
  const bruto = maximo / 2;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const passo = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto)!;
  const passoInteiro = Math.max(1, Math.ceil(passo));
  return [0, passoInteiro, passoInteiro * 2];
}

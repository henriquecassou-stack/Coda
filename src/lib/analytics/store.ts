/**
 * Armazenamento das visitas, no Redis da Upstash, pela API REST — com `fetch`,
 * sem SDK. O formato do corpo e das respostas foi conferido contra o cliente
 * oficial (@upstash/redis 1.39): `POST {url}/pipeline`, corpo
 * `[["COMANDO", ...args], ...]`, resposta `[{ result } | { error }, ...]`.
 *
 * Variáveis, com os mesmos nomes que a integração da Vercel cria:
 *   UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *   ou KV_REST_API_URL / KV_REST_API_TOKEN
 *
 * O modelo cabe em três chaves, e foi desenhado para gastar pouco da cota
 * gratuita (cobrada por comando):
 *
 *   visitas  — sorted set: id → início da visita (ms, hora do SERVIDOR)
 *   duracao  — sorted set: id → tempo ativo em ms. Gravado com ZADD GT, que só
 *              aceita valor MAIOR que o atual: batimentos atrasados ou fora de
 *              ordem nunca encolhem a duração.
 *   v:{id}   — string JSON com os dados da visita, gravada com SET NX (só a
 *              primeira vez) e EX (expira sozinha depois da retenção).
 *
 * Cada batimento do rastreador custa 3 comandos. Carregar o painel custa 3
 * comandos para listar (ZRANGE + ZMSCORE + MGET), não importa quantas visitas
 * haja, mais 3 de limpeza.
 *
 * Nada aqui identifica uma pessoa: o id é aleatório e vive só na aba do
 * navegador; o país vem do cabeçalho da Vercel; IP nunca é gravado.
 */

export const RETENCAO_DIAS = 90;
const RETENCAO_S = RETENCAO_DIAS * 24 * 60 * 60;

const K_VISITAS = "visitas";
const K_DURACAO = "duracao";
const kDados = (id: string) => `v:${id}`;

export type Dispositivo = "celular" | "tablet" | "computador";

export type DadosVisita = {
  /** Página onde a visita começou. */
  caminho: string;
  /** Domínio de onde a pessoa veio, ou "" para acesso direto. */
  origem: string;
  dispositivo: Dispositivo;
  /** Código do país (ex.: "BR"), ou "" se a hospedagem não informar. */
  pais: string;
};

export type Visita = DadosVisita & {
  id: string;
  /** Início, em ms desde 1970 (relógio do servidor). */
  inicio: number;
  /** Tempo com a aba visível, em ms. */
  duracaoMs: number;
};

/** Banco não configurado — tratado à parte para virar uma mensagem clara. */
export class AnalyticsNaoConfigurado extends Error {
  constructor() {
    super("Banco de dados do painel de visitas não configurado.");
    this.name = "AnalyticsNaoConfigurado";
  }
}

/**
 * Acha a URL e o token REST do banco. Primeiro pelos nomes padrão; depois por
 * qualquer par com prefixo — a tela da Vercel que conecta o banco ao projeto
 * deixa escolher um prefixo, e aí `KV_REST_API_URL` vira, por exemplo,
 * `STORAGE_KV_REST_API_URL`. O token é sempre o par "…URL" → "…TOKEN" do mesmo
 * nome, o que deixa de fora o token só-de-leitura (READ_ONLY), que não grava.
 */
function config() {
  const env = process.env;
  const padrao = [
    ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
    ["KV_REST_API_URL", "KV_REST_API_TOKEN"],
  ];
  const comPrefixo = Object.keys(env)
    .filter((k) => /(_REST_API_URL|_REDIS_REST_URL)$/.test(k))
    .sort()
    .map((k) => [k, k.replace(/URL$/, "TOKEN")]);

  // Nos nomes com prefixo, a URL também tem de parecer a de um banco: https
  // (o Upstash é sempre https), ou o próprio computador, para testes. Sem
  // isso, a URL REST de outro serviço qualquer poderia ser confundida.
  const pareceBanco = (url: string) => /^(https:\/\/|http:\/\/(127\.0\.0\.1|localhost)[:/])/.test(url);

  for (const [kUrl, kToken] of padrao) {
    if (env[kUrl] && env[kToken]) return { url: env[kUrl]!.replace(/\/$/, ""), token: env[kToken]!, origem: kUrl };
  }
  for (const [kUrl, kToken] of comPrefixo) {
    const url = env[kUrl];
    const token = env[kToken];
    if (url && token && pareceBanco(url)) return { url: url.replace(/\/$/, ""), token, origem: kUrl };
  }
  return null;
}

/** Nome da variável de onde veio o banco (só o nome) — para o painel mostrar. */
export function origemDoBanco(): string | null {
  return config()?.origem ?? null;
}

export function analyticsConfigurado(): boolean {
  return config() !== null;
}

type Arg = string | number;

async function pipeline(comandos: Arg[][]): Promise<unknown[]> {
  const c = config();
  if (!c) throw new AnalyticsNaoConfigurado();

  const res = await fetch(`${c.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${c.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(comandos.map((cmd) => cmd.map(String))),
    cache: "no-store",
    // Sem limite, um banco lento seguraria a função até ela ser derrubada.
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`Upstash respondeu ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const corpo = (await res.json()) as { result?: unknown; error?: string }[];
  const falha = corpo.find((r) => r.error);
  if (falha) throw new Error(`Upstash: ${falha.error}`);
  return corpo.map((r) => r.result);
}

/**
 * Registra um batimento de uma visita. Idempotente: o primeiro batimento cria
 * a visita, os seguintes só podem aumentar a duração. Se o primeiro se perder
 * na rede, o seguinte cria a visita do mesmo jeito.
 */
export async function registrarBatimento(id: string, duracaoMs: number, dados: DadosVisita) {
  await pipeline([
    ["ZADD", K_VISITAS, "NX", Date.now(), id],
    ["SET", kDados(id), JSON.stringify(dados), "NX", "EX", RETENCAO_S],
    ["ZADD", K_DURACAO, "GT", Math.round(duracaoMs), id],
  ]);
}

/** Visitas iniciadas entre `desde` e `ate` (ms), da mais recente para a mais antiga. */
export async function listarVisitas(desde: number, ate: number, limite = 5000): Promise<Visita[]> {
  const [faixa] = await pipeline([
    ["ZRANGE", K_VISITAS, ate, desde, "BYSCORE", "REV", "LIMIT", 0, limite, "WITHSCORES"],
  ]);
  const plano = (faixa as string[] | null) ?? [];
  if (plano.length === 0) return [];

  const ids: string[] = [];
  const inicios: number[] = [];
  for (let i = 0; i < plano.length; i += 2) {
    ids.push(plano[i]);
    inicios.push(Number(plano[i + 1]));
  }

  const [duracoes, dados] = await pipeline([
    ["ZMSCORE", K_DURACAO, ...ids],
    ["MGET", ...ids.map(kDados)],
  ]);
  const dur = (duracoes as (string | null)[]) ?? [];
  const dad = (dados as (string | null)[]) ?? [];

  return ids.map((id, i) => {
    let d: Partial<DadosVisita> = {};
    try {
      d = dad[i] ? (JSON.parse(dad[i] as string) as DadosVisita) : {};
    } catch {
      // Dado corrompido não derruba o painel: a visita aparece sem detalhes.
    }
    return {
      id,
      inicio: inicios[i],
      duracaoMs: Number(dur[i] ?? 0),
      caminho: d.caminho ?? "",
      origem: d.origem ?? "",
      dispositivo: d.dispositivo ?? "computador",
      pais: d.pais ?? "",
    };
  });
}

/**
 * Apaga visitas mais antigas que a retenção. Os dados de cada visita (v:{id})
 * já expiram sozinhos; aqui saem os dois índices. Rodado a cada carga do
 * painel, em lotes, para nunca ficar caro.
 */
export async function limparAntigas() {
  const corte = Date.now() - RETENCAO_S * 1000;
  const [antigas] = await pipeline([["ZRANGE", K_VISITAS, "-inf", corte, "BYSCORE", "LIMIT", 0, 1000]]);
  const ids = (antigas as string[] | null) ?? [];
  if (ids.length === 0) return;
  await pipeline([
    ["ZREM", K_DURACAO, ...ids],
    ["ZREM", K_VISITAS, ...ids],
  ]);
}

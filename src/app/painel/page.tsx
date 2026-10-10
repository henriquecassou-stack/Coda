import type { Metadata } from "next";
import { cookies } from "next/headers";
import { COOKIE_PAINEL, cookieValido, senhaConfigurada } from "@/lib/analytics/auth";
import { AnalyticsNaoConfigurado, RETENCAO_DIAS, analyticsConfigurado, limparAntigas, listarVisitas, type Visita } from "@/lib/analytics/store";
import {
  PERIODOS,
  eixoY,
  fmtDuracao,
  fmtQuando,
  janela,
  lerPeriodo,
  porIntervalo,
  resumo,
  rotulosColuna,
  type Coluna,
  type Periodo,
} from "@/lib/analytics/stats";
import { NaoContar } from "./NaoContar";

export const metadata: Metadata = {
  title: "Visitas — CODA",
  robots: { index: false, follow: false },
};

/**
 * Painel de visitas. Sem JavaScript de gráfico: tudo é HTML desenhado no
 * servidor, então abre rápido no celular e não puxa biblioteca nenhuma.
 *
 * Cor das barras: #5b8cff, o azul da marca num tom que passa no validador de
 * paleta contra o fundo dos cartões (#0c0c12) — contraste ≥ 3:1 e luminosidade
 * dentro da faixa. O ciano da marca (#2dd4f0) é claro demais para uma barra.
 */
const COR_BARRA = "#5b8cff";
const COR_BARRA_HOVER = "#86a8ff";

const DISPOSITIVO_ROTULO: Record<string, string> = { celular: "Celular", tablet: "Tablet", computador: "Computador" };

export default async function Painel({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const jar = await cookies();

  if (!senhaConfigurada()) return <Aviso titulo="Painel desligado"><AvisoSemSenha /></Aviso>;
  if (!cookieValido(jar.get(COOKIE_PAINEL)?.value)) return <Login erro={typeof params.erro === "string" ? params.erro : ""} />;
  if (!analyticsConfigurado()) return <Aviso titulo="Falta conectar o banco de dados" sair><AvisoSemBanco /></Aviso>;

  const periodo = lerPeriodo(params.periodo);
  const { desde, ate } = janela(periodo);

  let visitas: Visita[];
  try {
    await limparAntigas();
    visitas = await listarVisitas(desde, ate);
  } catch (err) {
    if (err instanceof AnalyticsNaoConfigurado) return <Aviso titulo="Falta conectar o banco de dados" sair><AvisoSemBanco /></Aviso>;
    console.error("[painel] falha ao ler visitas:", err);
    return (
      <Aviso titulo="Não consegui ler as visitas" sair>
        <p>O banco está configurado, mas respondeu com erro. Recarregue em alguns segundos; se continuar, a mensagem abaixo diz o motivo.</p>
        {/* Só quem passou pela senha vê isto. A mensagem é montada em store.ts e
            nunca inclui o token. */}
        <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 p-3 font-mono text-xs break-words text-red-100">
          {err instanceof Error ? err.message.slice(0, 300) : String(err).slice(0, 300)}
        </p>
        <p className="mt-3">
          Se a mensagem falar em <code>401</code> ou <code>Unauthorized</code>, o token do banco não confere: desconecte e reconecte o banco ao
          projeto em <strong>Storage</strong> e faça o Redeploy.
        </p>
      </Aviso>
    );
  }

  const r = resumo(visitas);
  const colunas = porIntervalo(visitas, periodo);

  return (
    <Moldura sair>
      <nav aria-label="Período" className="flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <a
            key={p.id}
            href={`/painel?periodo=${p.id}`}
            aria-current={p.id === periodo ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-xs font-semibold tracking-[0.08em] uppercase transition-colors ${
              p.id === periodo
                ? "border-white bg-white text-black"
                : "border-[var(--color-border-strong)] text-[var(--color-fg-muted)] hover:text-white"
            }`}
          >
            {p.rotulo}
          </a>
        ))}
      </nav>

      {/* Números principais. Um só número-herói por tela: o total de visitas. */}
      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 lg:col-span-1">
          <p className="text-sm text-[var(--color-fg-muted)]">Visitas</p>
          <p className="mt-2 text-6xl leading-none font-semibold text-white">{r.total.toLocaleString("pt-BR")}</p>
        </div>
        <Tile rotulo="Tempo médio" valor={r.total ? fmtDuracao(r.mediaMs) : "—"} />
        <Tile rotulo="Tempo mediano" valor={r.total ? fmtDuracao(r.medianaMs) : "—"} nota="metade ficou mais que isso" />
        {/* `largo`: no celular a grade tem 2 colunas, e este terceiro cartão
            ficava sozinho com um buraco ao lado. */}
        <Tile
          largo
          rotulo="Saíram em menos de 10 s"
          valor={r.total ? `${Math.round((r.rapidas / r.total) * 100)}%` : "—"}
          nota={r.total ? `${r.rapidas} de ${r.total}` : undefined}
        />
      </section>

      <Cartao titulo={periodo === "hoje" ? "Visitas por hora" : "Visitas por dia"} className="mt-3">
        <Colunas colunas={colunas} periodo={periodo} />
      </Cartao>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <Cartao titulo="Quanto tempo ficaram">
          <Barras itens={r.faixas} total={r.total} />
        </Cartao>
        <Cartao titulo="De onde vieram">
          <Barras itens={dobrar(r.origens, 6)} total={r.total} />
        </Cartao>
        <Cartao titulo="Dispositivo">
          <Barras itens={r.dispositivos.map((d) => ({ ...d, rotulo: DISPOSITIVO_ROTULO[d.rotulo] ?? d.rotulo }))} total={r.total} />
        </Cartao>
      </div>

      <Cartao titulo="Visitas recentes" className="mt-3">
        <TabelaVisitas visitas={visitas.slice(0, 50)} />
        {visitas.length > 50 && (
          <p className="mt-4 text-xs text-[var(--color-fg-faint)]">Mostrando as 50 mais recentes de {visitas.length.toLocaleString("pt-BR")}.</p>
        )}
      </Cartao>

      <div className="mt-8 flex flex-col gap-2 text-xs text-[var(--color-fg-faint)]">
        <NaoContar />
        <p>
          Tempo contado só com a aba visível e com a pessoa ativa: parar de mexer por 2 minutos pausa o relógio. Horários em Brasília. As
          visitas ficam guardadas por {RETENCAO_DIAS} dias.
        </p>
      </div>
    </Moldura>
  );
}

/* ------------------------------------------------------------------ */
/* Peças                                                               */
/* ------------------------------------------------------------------ */

function Moldura({ children, sair = false }: { children: React.ReactNode; sair?: boolean }) {
  return (
    <div className="min-h-[100svh] bg-[var(--color-bg)] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[var(--color-fg-faint)] uppercase">CODA</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Visitas do site</h1>
          </div>
          {sair && (
            <form action="/api/painel/sair" method="post">
              <button type="submit" className="rounded-full border border-[var(--color-border-strong)] px-4 py-2 text-xs text-[var(--color-fg-muted)] hover:text-white">
                Sair
              </button>
            </form>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}

function Aviso({ titulo, children, sair = false }: { titulo: string; children: React.ReactNode; sair?: boolean }) {
  return (
    <Moldura sair={sair}>
      <div className="max-w-xl rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 text-sm leading-relaxed text-[var(--color-fg-muted)] sm:p-8 [&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-white/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-white">
        <h2 className="mb-3 text-lg font-semibold text-white">{titulo}</h2>
        {children}
      </div>
    </Moldura>
  );
}

/**
 * "Painel desligado" quase nunca é falta de variável — a pessoa criou e o
 * servidor não está vendo. Em vez de repetir as instruções, a página diz o que
 * ESTE deploy encontrou: em que ambiente está e se existe alguma variável com
 * nome parecido. Só nomes aparecem aqui, nunca valores.
 */
function AvisoSemSenha() {
  const parecidas = Object.keys(process.env).filter((k) => k !== "PAINEL_SENHA" && /painel|senha/i.test(k));
  const vazia = process.env.PAINEL_SENHA !== undefined;
  const ambiente = process.env.VERCEL_ENV;
  const nomeAmbiente = ambiente === "production" ? "Production" : ambiente === "preview" ? "Preview" : ambiente;

  return (
    <>
      <p>
        Este deploy não está encontrando a variável <code>PAINEL_SENHA</code>
        {nomeAmbiente ? (
          <>
            {" "}
            (ambiente <strong>{nomeAmbiente}</strong>)
          </>
        ) : null}
        .
      </p>

      {parecidas.length > 0 && (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
          Encontrei {parecidas.length === 1 ? "uma variável com nome parecido" : "variáveis com nome parecido"}:{" "}
          {parecidas.map((k, i) => (
            <span key={k}>
              {i > 0 && ", "}
              <code>{k}</code>
            </span>
          ))}
          . O nome precisa ser exatamente <code>PAINEL_SENHA</code> — maiúsculas, com sublinhado, sem espaço.
        </p>
      )}
      {vazia && (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
          A variável <code>PAINEL_SENHA</code> existe, mas está vazia.
        </p>
      )}

      <p className="mt-4">Confira, nesta ordem:</p>
      <ol>
        <li>
          <strong>Redeploy depois de salvar.</strong> A Vercel só aplica variáveis em deploys novos: <strong>Deployments → ⋯ → Redeploy</strong>.
        </li>
        <li>
          <strong>Ambiente.</strong> Em <strong>Settings → Environment Variables</strong>, a <code>PAINEL_SENHA</code> precisa estar marcada para{" "}
          <strong>{nomeAmbiente ?? "Production"}</strong>.
        </li>
        <li>
          <strong>Nome.</strong> Exatamente <code>PAINEL_SENHA</code>.
        </li>
      </ol>
    </>
  );
}

/**
 * Como em AvisoSemSenha: em vez de repetir "conecte o banco", diz o que ESTE
 * deploy encontrou. Só NOMES de variáveis aparecem, nunca valores.
 */
function AvisoSemBanco() {
  const nomes = Object.keys(process.env)
    .filter((k) => /KV|REDIS|UPSTASH|REST_API|POSTGRES|DATABASE|SUPABASE|NEON|MONGO/i.test(k))
    .sort();
  const soConexaoDireta = nomes.some((k) => /(^|_)(REDIS|KV)_URL$/i.test(k)) && !nomes.some((k) => /REST/i.test(k));
  const outroBanco = nomes.some((k) => /POSTGRES|DATABASE|SUPABASE|NEON|MONGO/i.test(k)) && !nomes.some((k) => /REDIS|KV|UPSTASH/i.test(k));
  const ambiente = process.env.VERCEL_ENV;
  const nomeAmbiente = ambiente === "production" ? "Production" : ambiente === "preview" ? "Preview" : ambiente;

  return (
    <>
      <p>
        Este deploy{nomeAmbiente ? <> (ambiente <strong>{nomeAmbiente}</strong>)</> : null} não encontrou as variáveis do banco das visitas.
      </p>

      {nomes.length === 0 ? (
        <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
          Nenhuma variável de banco de dados chegou a este deploy. Ou o banco ainda não está conectado a este projeto, ou foi conectado sem
          marcar <strong>{nomeAmbiente ?? "Production"}</strong>, ou faltou o Redeploy depois de conectar.
        </p>
      ) : (
        <div className="mt-3 rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-amber-100">
          <p>
            Encontrei estas variáveis:{" "}
            {nomes.map((k, i) => (
              <span key={k}>
                {i > 0 && ", "}
                <code>{k}</code>
              </span>
            ))}
            .
          </p>
          {soConexaoDireta && (
            <p className="mt-2">
              São só de conexão direta. O painel usa a <strong>API REST</strong> do Upstash — as variáveis que terminam em{" "}
              <code>REST_API_URL</code> e <code>REST_API_TOKEN</code>. Confira se o banco criado é o <strong>Upstash for Redis</strong>.
            </p>
          )}
          {outroBanco && (
            <p className="mt-2">
              Parece um banco de outro tipo (Postgres ou similar). O painel usa o <strong>Upstash for Redis</strong> — crie esse, que também é
              gratuito, e conecte ao projeto.
            </p>
          )}
        </div>
      )}

      <p className="mt-4">Para conectar:</p>
      <ol>
        <li>
          Na Vercel, abra o projeto → aba <strong>Storage</strong> → <strong>Create Database</strong> → <strong>Upstash for Redis</strong> (plano
          gratuito).
        </li>
        <li>
          Na tela de conectar ao projeto, deixe <strong>{nomeAmbiente ?? "Production"}</strong> marcado. Se ele pedir um prefixo, pode deixar o
          padrão — qualquer prefixo funciona.
        </li>
        <li>
          Em <strong>Deployments → ⋯ → Redeploy</strong>.
        </li>
      </ol>
    </>
  );
}

function Login({ erro }: { erro: string }) {
  const mensagem = erro === "senha" ? "Senha incorreta." : erro === "limite" ? "Muitas tentativas. Espere 15 minutos." : "";
  return (
    <Moldura>
      <form action="/api/painel/login" method="post" className="max-w-sm rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 sm:p-8">
        <label htmlFor="senha" className="block text-sm font-semibold text-white">
          Senha do painel
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-3 w-full rounded-xl border border-[var(--color-border)] bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-[var(--color-cyan)]"
        />
        <p role="alert" className="mt-3 min-h-[1.2em] text-sm text-red-400">
          {mensagem}
        </p>
        <button type="submit" className="mt-2 w-full rounded-full px-6 py-3 text-sm font-semibold tracking-[0.08em] text-white uppercase" style={{ background: "var(--gradient-brand)" }}>
          Entrar
        </button>
      </form>
    </Moldura>
  );
}

function Cartao({ titulo, children, className = "" }: { titulo: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 sm:p-6 ${className}`}>
      <h2 className="mb-5 text-sm font-semibold text-white">{titulo}</h2>
      {children}
    </section>
  );
}

function Tile({ rotulo, valor, nota, largo = false }: { rotulo: string; valor: string; nota?: string; largo?: boolean }) {
  return (
    <div className={`rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5 sm:p-6 ${largo ? "col-span-2 lg:col-span-1" : ""}`}>
      <p className="text-sm text-[var(--color-fg-muted)]">{rotulo}</p>
      <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{valor}</p>
      {nota && <p className="mt-1 text-xs text-[var(--color-fg-faint)]">{nota}</p>}
    </div>
  );
}

/**
 * Colunas por dia (ou hora). Barra fina (até 24px), topo arredondado e base
 * reta, grade em linha fina e discreta. Só o valor máximo vai escrito na
 * própria coluna; os demais aparecem ao passar o mouse ou focar com o teclado
 * — cada coluna inteira é a área de toque, não só a barra pintada.
 */
function Colunas({ colunas, periodo }: { colunas: Coluna[]; periodo: Periodo }) {
  const maximo = Math.max(0, ...colunas.map((c) => c.visitas));
  const ticks = eixoY(maximo);
  const topo = ticks[ticks.length - 1];
  const iMax = maximo > 0 ? colunas.findIndex((c) => c.visitas === maximo) : -1;
  const n = colunas.length;
  const passoRotulo = n <= 7 ? 1 : n <= 24 ? 3 : n <= 30 ? 5 : 15;

  return (
    <div>
      <div className="grid grid-cols-[2rem_1fr] gap-2">
        {/* eixo Y */}
        <div className="relative h-44 text-right text-[11px] tabular-nums text-[var(--color-fg-faint)]" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / topo) * 100}%`, transform: "translateY(50%)" }}>
              {t}
            </span>
          ))}
        </div>

        <div className="relative h-44">
          {ticks.map((t) => (
            <div key={t} aria-hidden className="absolute inset-x-0 h-px bg-white/[0.07]" style={{ bottom: `${(t / topo) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex">
            {colunas.map((c, i) => {
              const rot = rotulosColuna(c.inicio, periodo);
              const texto = `${rot.longo}: ${c.visitas} ${c.visitas === 1 ? "visita" : "visitas"}`;
              const alinhamento = i < 2 ? "left-0" : i > n - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
              return (
                <div key={c.inicio} tabIndex={0} aria-label={texto} className="group relative h-full flex-1 outline-none">
                  {c.visitas > 0 && (
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-[4px] bg-[var(--barra)] transition-colors group-hover:bg-[var(--barra-hover)] group-focus-visible:bg-[var(--barra-hover)]"
                      style={{
                        height: `${(c.visitas / topo) * 100}%`,
                        width: "min(24px, calc(100% - 2px))",
                        ["--barra" as string]: COR_BARRA,
                        ["--barra-hover" as string]: COR_BARRA_HOVER,
                      }}
                    >
                      {i === iMax && (
                        <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-[11px] font-semibold text-[var(--color-fg-muted)] tabular-nums">
                          {c.visitas}
                        </span>
                      )}
                    </div>
                  )}
                  <span
                    role="tooltip"
                    className={`pointer-events-none absolute -top-2 z-10 -translate-y-full whitespace-nowrap rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated-2)] px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${alinhamento}`}
                  >
                    <span className="block text-[var(--color-fg-muted)]">{rot.longo}</span>
                    <span className="font-semibold tabular-nums">
                      {c.visitas} {c.visitas === 1 ? "visita" : "visitas"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* eixo X */}
        <div />
        <div className="flex text-[11px] tabular-nums text-[var(--color-fg-faint)]" aria-hidden>
          {colunas.map((c, i) => (
            <span key={c.inicio} className="flex-1 text-center whitespace-nowrap">
              {i % passoRotulo === 0 || i === n - 1 ? rotulosColuna(c.inicio, periodo).curto : ""}
            </span>
          ))}
        </div>
      </div>

      {/* A mesma informação em tabela, para leitor de tela. */}
      <table className="sr-only">
        <caption>Visitas por {periodo === "hoje" ? "hora" : "dia"}</caption>
        <tbody>
          {colunas.map((c) => (
            <tr key={c.inicio}>
              <th scope="row">{rotulosColuna(c.inicio, periodo).longo}</th>
              <td>{c.visitas}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Barras horizontais com o valor na ponta. Uma série só: sem legenda, o título do cartão diz o que é. */
function Barras({ itens, total }: { itens: { rotulo: string; visitas: number }[]; total: number }) {
  if (total === 0) return <p className="text-sm text-[var(--color-fg-faint)]">Nenhuma visita no período.</p>;
  const maximo = Math.max(1, ...itens.map((i) => i.visitas));
  return (
    <ul className="space-y-3">
      {itens.map((i) => (
        <li key={i.rotulo}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate text-[var(--color-fg-muted)]">{i.rotulo}</span>
            <span className="shrink-0 tabular-nums text-white">
              {i.visitas} <span className="text-[var(--color-fg-faint)]">· {Math.round((i.visitas / total) * 100)}%</span>
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full">
            {i.visitas > 0 && (
              <div className="h-full rounded-r-[4px]" style={{ width: `${(i.visitas / maximo) * 100}%`, background: COR_BARRA }} />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function TabelaVisitas({ visitas }: { visitas: Visita[] }) {
  if (visitas.length === 0) return <p className="text-sm text-[var(--color-fg-faint)]">Nenhuma visita no período ainda.</p>;
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:-mx-6 sm:px-6">
      <table className="w-full min-w-[34rem] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-xs text-[var(--color-fg-faint)]">
            <th scope="col" className="py-2 pr-4 font-normal">Quando</th>
            <th scope="col" className="py-2 pr-4 font-normal">Tempo no site</th>
            <th scope="col" className="py-2 pr-4 font-normal">De onde veio</th>
            <th scope="col" className="py-2 pr-4 font-normal">Dispositivo</th>
            <th scope="col" className="py-2 font-normal">País</th>
          </tr>
        </thead>
        <tbody>
          {visitas.map((v) => (
            <tr key={v.id} className="border-b border-white/[0.05] last:border-0">
              <td className="py-2.5 pr-4 tabular-nums text-[var(--color-fg-muted)]">{fmtQuando(v.inicio)}</td>
              <td className="py-2.5 pr-4 tabular-nums text-white">{fmtDuracao(v.duracaoMs)}</td>
              <td className="py-2.5 pr-4 text-[var(--color-fg-muted)]">{v.origem || "Acesso direto"}</td>
              <td className="py-2.5 pr-4 text-[var(--color-fg-muted)]">{DISPOSITIVO_ROTULO[v.dispositivo] ?? v.dispositivo}</td>
              <td className="py-2.5 text-[var(--color-fg-muted)]">{v.pais || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mantém as `n-1` maiores e junta o resto em "Outras". */
function dobrar(itens: { rotulo: string; visitas: number }[], n: number) {
  if (itens.length <= n) return itens;
  const resto = itens.slice(n - 1).reduce((s, i) => s + i.visitas, 0);
  return [...itens.slice(0, n - 1), { rotulo: "Outras", visitas: resto }];
}

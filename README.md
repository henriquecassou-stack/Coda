# CODA — Websites + Automações

Site institucional da CODA. Next.js (App Router) + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Colocando no ar

O jeito mais curto é a Vercel, que é de quem faz o Next.js: ela detecta o projeto
sozinha, sem nenhum arquivo de configuração. Não há `vercel.json`, `Dockerfile` nem script
de build especial neste repositório de propósito — não é preciso.

**1. Subir.** Em [vercel.com](https://vercel.com), entre com a conta do GitHub, **Add New →
Project**, escolha o repositório `coda` e clique em **Deploy**. Não mude nada nas opções: framework,
comando de build e diretório de saída já vêm certos. Em um ou dois minutos o site está num endereço
tipo `coda-xxxx.vercel.app`.

Esse endereço já é o site no ar, de verdade. Ninguém chega nele sem o link — o que o torna o lugar
certo para conferir tudo antes de apontar o domínio.

**2. As variáveis.** Em **Settings → Environment Variables**, adicione:

| Variável | Valor | Sem ela |
|---|---|---|
| `RESEND_API_KEY` | a chave da Resend (veja "Formulário de contato") | O formulário avisa que o envio está indisponível |
| `NEXT_PUBLIC_SITE_URL` | **só enquanto o site estiver no endereço `.vercel.app`**: esse endereço, sem barra no fim. Com o domínio apontando, pode apagar | A página se anuncia como `codaautomacoes.com` antes de o domínio existir, e a prévia no WhatsApp/LinkedIn sai errada |

Variável nova só vale depois de um novo deploy: **Deployments → ⋯ → Redeploy**.

**3. O domínio.** Com `codaautomacoes.com` registrado, vá em **Settings → Domains** na Vercel e
adicione-o. A Vercel mostra o registro DNS para copiar no painel de quem vendeu o domínio. A
propagação costuma levar minutos, às vezes horas. O HTTPS é automático.

Quando o domínio estiver servindo o site, **apague** o `NEXT_PUBLIC_SITE_URL` do passo 2: o padrão
do código já é o domínio certo, e uma variável apontando para o endereço `.vercel.app` passa a ser
justamente o que faz o canonical sair errado.

**Depois de subir, cada `git push` na `main` publica sozinho.** Um push em outra branch vira uma
prévia com endereço próprio, sem mexer no site que está no ar.

### Em que ordem fazer

O site está pronto tecnicamente, mas parte do conteúdo ainda é placeholder (veja o checklist
abaixo). Isso não impede de subir — impede de divulgar. Uma ordem que funciona:

1. Suba na Vercel e confira no endereço `.vercel.app`, no celular e no computador.
2. Ligue o formulário e mande uma mensagem de teste para si mesmo.
3. Troque o conteúdo inventado — cases, depoimentos, números.
4. Só então aponte o domínio e comece a divulgar o link.

Inverter 3 e 4 é o único erro caro da lista: um cliente que pergunta sobre um case que não existe
descobre a resposta na hora.

### Domínio

O domínio do site é **`https://codaautomacoes.com`**, e ele é o padrão em `src/lib/site.ts` — em
produção não é preciso definir nada. É de lá que saem as URLs absolutas do `canonical`, da imagem de
compartilhamento (`og:image`), do `robots.txt`, do sitemap e dos dados estruturados.

`NEXT_PUBLIC_SITE_URL` serve para quando o site roda em **outro** endereço: a prévia `.vercel.app`
enquanto o domínio ainda não aponta para cá, ou um ambiente de homologação. Nesses casos vale
defini-la — sem isso a página se anuncia como `codaautomacoes.com`, que ainda não serve aquele
conteúdo, e a prévia no WhatsApp/LinkedIn sai errada.

Para trocar o domínio um dia, é uma linha em `src/lib/site.ts`.

A imagem de compartilhamento é gerada por código em **`src/app/opengraph-image.tsx`** — edite o texto
ali (usa as cores e o logo da marca automaticamente); não há PNG para exportar à mão.

### Formulário de contato

O formulário da seção "Vamos conversar" envia por e-mail através da
[Resend](https://resend.com). Para ligá-lo:

1. Crie uma conta na Resend **com o mesmo e-mail que vai receber as mensagens**. Isso importa: sem
   domínio próprio verificado, a Resend só entrega na caixa dona da conta.
2. Em **API Keys → Create API Key**, copie a chave (ela só aparece uma vez).
3. Localmente: `cp .env.example .env.local` e cole a chave em `RESEND_API_KEY`.
   Na Vercel: **Settings → Environment Variables**, a mesma chave, e um novo deploy.

Só isso. `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL` são opcionais — sem elas o e-mail vai para o
endereço em `src/lib/content.ts`, assinado pelo remetente de testes da Resend.

Quando tiver domínio próprio, verifique-o na Resend e defina
`CONTACT_FROM_EMAIL="CODA <contato@seudominio.com.br>"`. Aí o e-mail passa a sair do seu domínio,
cai menos em spam e o formulário consegue escrever para qualquer endereço, não só para o seu.

**Sem `RESEND_API_KEY` o formulário não finge que enviou**: ele responde "envio indisponível" e
manda a pessoa usar o e-mail ou o WhatsApp. É proposital — um lead perdido em silêncio é pior que um
erro visível. Se o formulário mostrar essa mensagem em produção, é a variável que está faltando.

Duas coisas para saber sobre `src/app/api/contact/route.ts`:

- **Limite de envios**: 5 por IP a cada 10 minutos, guardado na memória do processo. Segura o caso
  comum, mas não sobrevive a um cold start nem é compartilhado entre instâncias. Se o formulário
  virar alvo de spam de verdade, troque por um limitador com armazenamento compartilhado
  (Upstash Ratelimit, Vercel KV).
- **Quando o envio falha**, os dados do contato vão para o log do servidor junto com o erro. É de
  propósito: é o que permite responder à mão um lead que não chegou. Vale saber que eles ficam lá.

Outros comandos:

```bash
npm run build   # build de produção
npm run start   # roda o build de produção
npm run lint    # ESLint
```

## ⚠️ Checklist antes de publicar

O site está pronto tecnicamente, mas **parte do conteúdo é placeholder ilustrativo**. Publicar como
está significa mostrar projetos e resultados que não aconteceram — o que derruba sua credibilidade na
primeira pergunta do cliente. O que falta trocar, tudo em `src/lib/content.ts`:

| O quê | Onde | O que é preciso |
|---|---|---|
| **Cases do portfólio** | `portfolio` | 4 projetos reais + prints. Coloque as imagens em `public/images/cases/` e preencha `image` / `imageAlt`. Sem `image`, o card usa o gradiente da marca (estado atual). Veja `public/images/cases/README.md`. |
| **Números das capacidades** | `capabilities` | `-70%`, `+2.4x` e `3 semanas` são inventados. Troque pelos reais citando a origem no `label`, ou reescreva como capacidade em vez de resultado (é o que a célula `atendimento` já faz). |
| **Depoimentos** | `testimonials` | Citações reais com nome, cargo e empresa — e autorização do cliente. Depoimento anônimo convence pouco. |
| **Preços** | `pricing` | Hoje todos dizem "Sob consulta". Se tiver faixa de preço, ela converte melhor. |
| **WhatsApp / telefone** | `brand.phone` | `+55 (11) 90000-0000` ainda é fictício. O número em `brand.social` (`wa.me/5511900000000`) é o mesmo e precisa mudar junto. |
| **Chave da Resend** | `RESEND_API_KEY` | O formulário já está ligado ao e-mail real, mas **precisa da chave para enviar** — veja "Formulário de contato" acima. Sem ela, o formulário avisa que o envio está indisponível. |
| ~~E-mail~~ | `brand.email` | ✅ Caixa real já configurada (`atmzcoda@gmail.com`). |
| ~~Instagram~~ | `instagramHandle` | ✅ Perfil real já configurado (`coda.automatizacoes`). Para trocar, é a constante `instagramHandle` no topo de `content.ts` — o rodapé, o canal direto no contato e o `sameAs` dos dados estruturados saem todos dela. |
| ~~LinkedIn~~ | `linkedinUrl` | ✅ Perfil real já configurado. Para trocar, é a URL completa na constante `linkedinUrl` no topo de `content.ts`, e o texto exibido em `linkedinLabel`. |
| ~~Domínio~~ | `src/lib/site.ts` | ✅ `codaautomacoes.com` já configurado como padrão. Falta registrá-lo e apontá-lo na Vercel — veja "Domínio" acima. |

Para os prints dos cases: peça autorização ao cliente e borre dados pessoais (nomes, telefones,
e-mails, valores) que apareçam nas telas.

## Seção "Antes / Depois" — proposta, não aprovada

A seção **Antes / Depois** (`src/components/sections/FlowShift.tsx`) foi adicionada como proposta
(ideia 4 do briefing). Os cinco passos são um processo genérico de PME, não um case de cliente:
serve para ilustrar como o trabalho manual se encadeia. Nenhum resultado da CODA é afirmado ali.

Para remover: `git revert` do commit que a criou, ou à mão — apague
`src/components/sections/FlowShift.tsx`, a linha `<FlowShift />` e seu import em `src/app/page.tsx`,
e o bloco `flow` em `src/lib/content.ts`.

Para editar o processo desenhado: mexa em `flow.steps` e `flow.waits` no `content.ts`. As posições
dos nós ficam na constante `LAYOUT` dentro do componente (um conjunto por breakpoint), e as posições
das esperas são derivadas das arestas — não há coordenada para ajustar nelas.

## Seção "Calculadora" — proposta, não aprovada

A seção **Conta rápida / Calculadora** (`src/components/sections/Calculator.tsx`) foi adicionada
como proposta. Ela não afirma nenhum resultado da CODA: faz aritmética com os números que o próprio
visitante informa nos sliders, e mostra a conta inteira embaixo do resultado. A porcentagem
"automatizável" é uma estimativa que o visitante controla — não uma promessa nossa.

Para remover, se não quiser: `git revert` do commit que a criou, ou à mão — apague
`src/components/sections/Calculator.tsx`, a linha `<Calculator />` e seu import em
`src/app/page.tsx`, o bloco `calculator` em `src/lib/content.ts` e o bloco `.calc-range` no final de
`src/app/globals.css`.

## Como editar sem mexer nas animações

O projeto separa **conteúdo**, **estilo** e **animação** em lugares diferentes de propósito —
dá para trocar texto, cor e imagem sem tocar em nenhum arquivo que tenha `gsap` ou `ScrollTrigger`.

### Textos

Todo o copy do site (headline, bullets, cases, depoimentos, planos, textos do formulário) está em
**`src/lib/content.ts`**. É um arquivo só de dados — troque as strings ali e o site inteiro atualiza.
Os itens de portfólio e depoimentos estão marcados como ilustrativos: substitua pelos seus projetos e
clientes reais antes de publicar.

### Cores, gradiente e fontes

Tudo em **`src/app/globals.css`**, no bloco `:root` no topo do arquivo:

- `--color-bg`, `--color-fg`, etc. — cores base.
- `--gradient-brand` — o gradiente ciano → azul → violeta usado no logo, botões e destaques de texto.
- `--font-display` / `--font-body` — apontam para as fontes carregadas em `src/app/layout.tsx`
  (Space Grotesk para títulos, Inter para texto corrido). Para trocar a fonte, troque o import do
  `next/font/google` em `layout.tsx`.
  - Cada peso (`weight: [...]`) baixa um arquivo de fonte a mais — se adicionar um novo peso a um
    componente (ex.: `font-black` num título), adicione esse peso na config do `layout.tsx` também;
    se remover o último uso de um peso, remova-o de lá para não carregar um arquivo à toa. Peso
    `font-bold` (700) num elemento que usa `--font-body` (Inter, carregada em 400/500/600) renderiza
    em negrito sintético do navegador em vez da fonte real — prefira `font-semibold` nesses casos.

Não é necessário mexer em nenhum componente para restilizar o site — os componentes só consomem essas
variáveis.

### Logo / símbolo da marca

O símbolo "<" é um SVG puro em **`src/components/ui/Logo.tsx`** (sem imagem raster). O favicon usa a
mesma forma em **`src/app/icon.svg`**. Para ajustar o desenho, edite os pontos do `path` nesses dois
arquivos (mantenha os dois iguais).

### Imagens do portfólio

Os cards de portfólio hoje usam gradientes gerados por CSS (cores definidas em `portfolio` dentro de
`content.ts`, campos `gradientFrom`/`gradientTo`) em vez de fotos — não há imagens reais de projeto
ainda. Para usar fotos de verdade: coloque os arquivos em `public/images/`, troque o `<div style={{background: ...}}>` em `src/components/sections/Portfolio.tsx` por um `next/image`, e adicione o
caminho da imagem aos dados de cada case em `content.ts`.

### Formulário de contato

O envio hoje é só um placeholder: `src/app/api/contact/route.ts` valida os campos (tamanho máximo,
formato de e-mail, remove CR/LF para evitar header injection quando isso virar e-mail de verdade) e
loga no console, mas **não envia e-mail de verdade**. Para ativar o envio real, plugue um provedor (ex:
[Resend](https://resend.com), SendGrid, ou um CRM) dentro desse arquivo, no lugar do `console.log` —
e nesse momento também adicione **rate limiting** (ex: Upstash Ratelimit), que a rota ainda não tem.

## Sistema de animação (motion system)

O motion system do site — conceito, tokens de duração/easing, e o mapa de coreografia por seção — está
documentado em **`MOTION.md`**, na raiz do projeto. Antes de adicionar ou mudar qualquer animação, vale
ler esse arquivo: ele existe justamente para que novas animações continuem parecendo parte do mesmo
sistema, em vez de efeitos soltos.

Os tokens de motion (durações, easings, distâncias, stagger) vivem em dois lugares que precisam ficar em
sincronia:

- **`src/app/globals.css`** — versão CSS (`--dur-*`, `--ease-*`, `--shift-*`).
- **`src/lib/motion-tokens.ts`** — a mesma coisa para uso em GSAP (`dur`, `gsapEase`, `shift`, `stagger`).

Cada seção anima a partir de **`src/components/sections/*.tsx`**, sempre dentro de um `useGSAP(...)`,
e sempre com um branch separado para `prefers-reduced-motion` via `gsap.matchMedia()` — isso já está
implementado em todas as seções; ao adicionar uma nova, siga o mesmo padrão.

## Estrutura

```
src/
  app/            # rotas Next.js (layout, page, rota da API de contato)
  components/
    layout/       # Header, Footer
    ui/           # Logo, Button, Preloader — peças reutilizáveis
    sections/     # Hero, Services, Process, Portfolio, Testimonials, Pricing, ContactCTA
    canvas/       # fundo animado (Canvas2D) do Hero
  lib/
    content.ts    # todo o copy do site
    motion-tokens.ts
    gsap.ts       # registro dos plugins GSAP
  hooks/
    useReducedMotion.ts
MOTION.md          # fonte da verdade do sistema de animação
```

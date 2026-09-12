# CODA — Websites + Automações

Site institucional da CODA. Next.js (App Router) + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Antes de publicar: domínio

Defina `NEXT_PUBLIC_SITE_URL` com o domínio real (ex.: `https://coda.com.br`) no ambiente de deploy.
Ele é usado para montar as URLs absolutas do `canonical` e da imagem de compartilhamento
(`og:image`) em `src/app/layout.tsx`. Sem isso vale o fallback `https://coda.studio`, e as prévias no
WhatsApp/LinkedIn vão apontar para o domínio errado.

A imagem de compartilhamento é gerada por código em **`src/app/opengraph-image.tsx`** — edite o texto
ali (usa as cores e o logo da marca automaticamente); não há PNG para exportar à mão.

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
| **Contato** | `brand` | `contato@coda.studio` e `+55 (11) 90000-0000` são fictícios. Ajuste também os links de `social`. |
| **Domínio** | `NEXT_PUBLIC_SITE_URL` | Ver a seção acima — afeta as prévias no WhatsApp/LinkedIn. |

Para os prints dos cases: peça autorização ao cliente e borre dados pessoais (nomes, telefones,
e-mails, valores) que apareçam nas telas.

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

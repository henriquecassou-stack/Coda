/**
 * All site copy lives here. Edit text without touching any component or
 * animation logic — components read from this file only.
 *
 * Placeholder / illustrative content is marked with a comment. Replace with
 * real cases, testimonials and pricing before launch.
 */

export const brand = {
  name: "CODA",
  tagline: "WEBSITES + AUTOMAÇÕES",
  positioning:
    "Automação inteligente e sites que convertem, para pequenas e médias empresas que querem operar como grandes.",
  email: "contato@coda.studio",
  phone: "+55 (11) 90000-0000",
  social: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "WhatsApp", href: "https://wa.me/5511900000000" },
  ],
};

export const nav = [
  { label: "Serviços", href: "#servicos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Portfólio", href: "#portfolio" },
  { label: "Planos", href: "#planos" },
  { label: "Contato", href: "#contato" },
];

export const hero = {
  eyebrow: "AGÊNCIA DE AUTOMAÇÃO E DESENVOLVIMENTO",
  headlineLines: ["NÓS CONSTRUÍMOS", "O QUE SUA EMPRESA", "AINDA NÃO SABE", "QUE PRECISA."],
  highlightWord: "AINDA NÃO SABE",
  sub: "Automações com IA que eliminam trabalho manual e sites que convertem — desenhados, construídos e otimizados pela mesma equipe.",
  ctaPrimary: { label: "COMEÇAR PROJETO", href: "#contato" },
  ctaSecondary: { label: "VER COMO FUNCIONA", href: "#como-funciona" },
  badges: [
    "Especialistas em IA aplicada a negócios",
    "Time enxuto, entrega direta",
    "Suporte com quem constrói, não com atendente",
  ],
};

export const services = [
  {
    id: "automacoes",
    kicker: "SERVIÇO 01",
    title: "AUTOMAÇÕES COM IA",
    description:
      "Conectamos suas ferramentas e treinamos agentes de IA para tirar o trabalho repetitivo das mãos da sua equipe.",
    bullets: [
      "Integração entre CRM, WhatsApp, planilhas e ERPs",
      "Agentes de IA para atendimento, vendas e suporte",
      "Fluxos de trabalho que eliminam tarefas manuais",
      "Dashboards e relatórios gerados automaticamente",
    ],
  },
  {
    id: "sites",
    kicker: "SERVIÇO 02",
    title: "CRIAÇÃO DE SITES",
    description:
      "Sites desenhados sob medida — rápidos, bem estruturados e pensados para converter visita em contato.",
    bullets: [
      "Design sob medida, sem templates genéricos",
      "Performance e SEO técnico desde o primeiro código",
      "Estrutura pensada para conversão",
      "Fácil de manter e escalar depois do lançamento",
    ],
  },
] as const;

// Bento-grid capability/outcome cards — asymmetric sizes are intentional
// (see MOTION.md "2026-09-11 — layout inspiration pass").
export type CapabilityCell =
  | {
      id: string;
      size: "lg" | "md" | "full";
      kind: "stat";
      value: number;
      decimals?: number;
      prefix?: string;
      suffix?: string;
      label: string;
    }
  | { id: string; size: "md"; kind: "text"; value: string; label: string }
  | { id: string; size: "wide"; kind: "chips"; label: string; chips: string[] };

export const capabilities: {
  headline: string;
  headlineGradient: string;
  cells: CapabilityCell[];
} = {
  headline: "O QUE MUDA",
  headlineGradient: "NA PRÁTICA.",
  cells: [
    {
      id: "tempo",
      size: "lg",
      kind: "stat",
      value: 70,
      prefix: "-",
      suffix: "%",
      label: "menos tempo gasto em tarefas manuais depois de uma automação com IA",
    },
    {
      id: "atendimento",
      size: "md",
      kind: "text",
      value: "24/7",
      label: "Atendimento automático que nunca dorme — no WhatsApp, e-mail e formulário",
    },
    {
      id: "leads",
      size: "md",
      kind: "stat",
      value: 2.4,
      decimals: 1,
      prefix: "+",
      suffix: "x",
      label: "mais leads qualificados, sem aumentar o time comercial",
    },
    {
      id: "integracoes",
      size: "wide",
      kind: "chips",
      label: "Integrações prontas",
      chips: ["CRM", "WhatsApp", "ERP", "Planilhas", "E-mail"],
    },
    {
      id: "prazo",
      size: "full",
      kind: "stat",
      value: 3,
      suffix: " semanas",
      label: "tempo médio até o site novo estar no ar",
    },
  ],
};

// Full-bleed editorial statement — a deliberate rhythm-breaker between the
// proof-heavy Portfolio and Prova social sections (see MOTION.md).
export const manifesto = {
  lines: ["MENOS TAREFA.", "MAIS NEGÓCIO."],
  highlightLine: "MAIS NEGÓCIO.",
};

export const process = [
  {
    number: "01",
    title: "DIAGNÓSTICO",
    description:
      "Mapeamos seus processos e objetivos para identificar onde automação e IA geram mais retorno.",
  },
  {
    number: "02",
    title: "PROPOSTA",
    description: "Você recebe um plano claro: o que será construído ou automatizado, prazo e investimento.",
  },
  {
    number: "03",
    title: "IMPLEMENTAÇÃO",
    description: "Desenvolvemos, testamos e ajustamos cada fluxo ou página até funcionar exatamente como deve.",
  },
  {
    number: "04",
    title: "SUPORTE",
    description: "Acompanhamos os resultados no ar e evoluímos o que já foi entregue.",
  },
] as const;

// Illustrative cases — replace with real projects and screenshots.
export const portfolio = [
  {
    id: "case-1",
    category: "Automação",
    title: "Automação de Atendimento",
    segment: "E-commerce de moda",
    description: "Fluxo de IA que qualifica leads e responde dúvidas frequentes direto no WhatsApp.",
    gradientFrom: "#2dd4f0",
    gradientTo: "#3d5cff",
  },
  {
    id: "case-2",
    category: "Site",
    title: "Site Institucional",
    segment: "Clínica odontológica",
    description: "Site novo com agendamento integrado e SEO local reformulado do zero.",
    gradientFrom: "#3d5cff",
    gradientTo: "#8b5cf6",
  },
  {
    id: "case-3",
    category: "Automação",
    title: "Fluxo de Vendas com IA",
    segment: "SaaS B2B",
    description: "Qualificação automática de leads e roteamento direto para o time comercial certo.",
    gradientFrom: "#8b5cf6",
    gradientTo: "#2dd4f0",
  },
  {
    id: "case-4",
    category: "Site",
    title: "Landing de Lançamento",
    segment: "Infoproduto",
    description: "Página de alta conversão construída e no ar em menos de duas semanas.",
    gradientFrom: "#2dd4f0",
    gradientTo: "#8b5cf6",
  },
] as const;

// Illustrative testimonials — replace with real client quotes.
export const testimonials = [
  {
    quote:
      "A automação que a CODA construiu tirou horas do nosso time todo dia. O atendimento no WhatsApp hoje responde sozinho o que era repetitivo.",
    name: "Fundadora",
    role: "E-commerce de beleza",
  },
  {
    quote:
      "O site ficou muito acima do que a gente esperava — rápido, bonito e já nasceu convertendo mais do que o anterior.",
    name: "Sócio-diretor",
    role: "Clínica odontológica",
  },
  {
    quote:
      "Entenderam o processo comercial melhor que a gente mesmo. A automação de leads mudou o ritmo do time de vendas.",
    name: "Head comercial",
    role: "SaaS B2B",
  },
] as const;

export const pricing = [
  {
    id: "essencial",
    name: "ESSENCIAL",
    description: "Para quem precisa de presença digital sólida.",
    price: "Sob consulta",
    recommended: false,
    features: [
      "1 site institucional completo",
      "Otimização SEO técnica",
      "Formulário de contato integrado",
      "Suporte por 30 dias após entrega",
    ],
  },
  {
    id: "crescimento",
    name: "CRESCIMENTO",
    description: "Site e automação trabalhando juntos.",
    price: "Sob consulta",
    recommended: true,
    features: [
      "Tudo do plano Essencial",
      "Até 3 automações com IA",
      "Integração com WhatsApp e CRM",
      "Suporte contínuo mensal",
    ],
  },
  {
    id: "escala",
    name: "ESCALA",
    description: "Para operações que exigem automação avançada.",
    price: "Sob consulta",
    recommended: false,
    features: [
      "Automações sob escopo dedicado",
      "Agentes de IA personalizados",
      "Dashboards e relatórios sob medida",
      "Suporte prioritário e consultoria",
    ],
  },
] as const;

export const contact = {
  eyebrow: "VAMOS CONVERSAR",
  headline: "PRONTO PARA TIRAR TRABALHO MANUAL DA SUA OPERAÇÃO?",
  sub: "Conte um pouco sobre seu negócio. Respondemos em até 1 dia útil.",
  serviceOptions: ["Automações com IA", "Criação de site", "Os dois"],
};

export const footer = {
  columns: [
    {
      title: "CODA",
      links: [
        { label: "Serviços", href: "#servicos" },
        { label: "Como funciona", href: "#como-funciona" },
        { label: "Portfólio", href: "#portfolio" },
      ],
    },
    {
      title: "Empresa",
      links: [
        { label: "Planos", href: "#planos" },
        { label: "Contato", href: "#contato" },
      ],
    },
  ],
};

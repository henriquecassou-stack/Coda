/**
 * Marcas das redes e ícones dos canais de contato, como SVG inline.
 *
 * São desenhados aqui em vez de virem de uma biblioteca de ícones porque o
 * site inteiro já é assim (o símbolo da marca, os ícones dos serviços): nada
 * de fonte de ícones nem pacote extra no bundle por quatro glifos. Todos
 * partilham o mesmo viewBox 24 e herdam a cor via `currentColor`, então
 * ficam alinhados entre si em qualquer tamanho.
 *
 * As marcas do Instagram, do LinkedIn e do WhatsApp são propriedade das
 * respectivas empresas — aqui aparecem apenas como link para os perfis, que é
 * o uso que as diretrizes das três permitem.
 */

export type IconName = "instagram" | "linkedin" | "whatsapp" | "mail";

const paths: Record<IconName, React.ReactNode> = {
  // Contorno: câmera arredondada, lente e o ponto do flash.
  instagram: (
    <>
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" />
    </>
  ),
  // Sólido: o "in" — ponto e haste do i, mais o n.
  linkedin: (
    <path
      fill="currentColor"
      d="M6.94 4.96a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0zM3.28 8.48h3.44V21H3.28zM9.9 8.48h3.3v1.71h.05c.46-.87 1.58-1.79 3.26-1.79 3.48 0 4.13 2.29 4.13 5.27V21h-3.44v-5.53c0-1.32-.03-3.01-1.84-3.01-1.84 0-2.12 1.43-2.12 2.91V21H9.9z"
    />
  ),
  // Sólido: balão de conversa com o telefone dentro.
  whatsapp: (
    <path
      fill="currentColor"
      d="M12.04 2.5a9.46 9.46 0 0 0-8.2 14.2L2.5 21.5l4.93-1.3a9.46 9.46 0 1 0 4.61-17.7zm0 17.34a7.87 7.87 0 0 1-4.01-1.1l-.29-.17-2.93.77.78-2.86-.19-.3a7.87 7.87 0 1 1 6.64 3.66zm4.33-5.64c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.53.12-.16.24-.61.77-.75.93-.14.16-.28.18-.51.06-.24-.12-1-.37-1.91-1.18-.71-.63-1.18-1.41-1.32-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.28-.73-1.75-.19-.46-.38-.4-.53-.4h-.45c-.16 0-.41.06-.63.3-.22.24-.83.81-.83 1.97s.85 2.29.97 2.45c.12.16 1.67 2.55 4.05 3.58.57.24 1.01.39 1.35.5.57.18 1.09.15 1.5.09.46-.07 1.41-.58 1.61-1.13.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z"
    />
  ),
  // Contorno: envelope com a aba.
  mail: (
    <>
      <rect x="2.75" y="4.75" width="18.5" height="14.5" rx="2.75" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3.5 7.6 12 13.2l8.5-5.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function SocialIcon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}>
      {paths[name]}
    </svg>
  );
}

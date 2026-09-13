"use client";

import { SignalCanvas } from "@/components/canvas/SignalCanvas";

/**
 * EXPERIMENTO — a rede de sinais do hero estendida ao site inteiro.
 * Para voltar atrás: `git revert` do commit que criou este arquivo.
 *
 * A mesma animação que antes vivia só dentro do hero, agora numa camada fixa
 * atrás de tudo. Como todas as seções ficaram sem fundo próprio, ela aparece
 * da primeira à última.
 *
 * Três escolhas que o modo "página inteira" exige e o modo "só no hero" não:
 *
 * - `fixed`, não `absolute`. O canvas cobre a viewport e fica parado
 *   enquanto a página rola por cima. Se acompanhasse o documento, seria um
 *   canvas de 12.000px de altura, e o custo de um canvas é redesenhar — o
 *   tamanho da textura enviada a cada quadro é o que se paga.
 * - Opacidade reduzida. Dentro do hero o grafo tinha só o título por cima;
 *   aqui ele passa por trás de texto corrido do site todo, e na intensidade
 *   original competia com a leitura.
 * - Máscara vertical. O grafo some perto do topo e da base da viewport, então
 *   as emendas entre seções não ganham uma linha de nós atravessando.
 *
 * O custo: no modo hero o IntersectionObserver parava o desenho assim que a
 * seção saía da tela — ou seja, em quase toda a página. Aqui ele nunca sai,
 * então o desenho roda o tempo todo (limitado a 30fps, ver SignalCanvas).
 */
export function PageSignal() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 opacity-[0.55] [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]"
    >
      <SignalCanvas className="h-full w-full" />
    </div>
  );
}

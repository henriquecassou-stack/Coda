# Imagens dos cases

Coloque aqui os prints dos projetos reais e referencie em `src/lib/content.ts`:

```ts
{
  id: "case-1",
  category: "Automação",
  title: "Automação de Atendimento",
  segment: "E-commerce de moda",
  description: "...",
  image: "/images/cases/atendimento.jpg",   // <- caminho a partir de /public
  imageAlt: "Painel do fluxo de atendimento no WhatsApp",
  gradientFrom: "#2dd4f0",                  // fallback, se não houver imagem
  gradientTo: "#3d5cff",
}
```

Sem `image`, o card usa o gradiente da marca (é o estado atual).

## Formato recomendado

- Proporção **4:3** (os cards recortam nessa proporção)
- Pelo menos **1200×900 px** para ficar nítido em telas retina
- `.jpg` para fotos/screenshots, `.png` só se precisar de fundo transparente
- O `next/image` cuida da otimização, do `srcset` e do lazy-loading automaticamente

## Antes de publicar

Peça autorização ao cliente para exibir o projeto e, se o print mostrar dados
de clientes (nomes, telefones, e-mails, valores), borre ou troque por dados
fictícios.

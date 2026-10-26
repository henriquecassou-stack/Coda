/**
 * Gera os ícones raster a partir de src/app/icon.svg:
 *   src/app/favicon.ico     16, 32 e 48 px (PNGs dentro do .ico)
 *   src/app/icon1.png       192 px — o favicon que o Google prefere (múltiplo de 48)
 *   src/app/apple-icon.png  180 px — ícone da tela inicial do iPhone
 *   public/logo.png         512 px — o "logo" do JSON-LD (StructuredData.tsx)
 *
 * Rode `npm run icones` depois de mudar o desenho do icon.svg.
 * Usa o sharp que já vem instalado com o Next.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const raiz = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const svg = fs.readFileSync(path.join(raiz, "src/app/icon.svg"));
const png = (n) =>
  sharp(svg, { density: Math.ceil((72 * n) / 240) * 4 })
    .resize(n, n)
    .png({ compressionLevel: 9 })
    .toBuffer();

function ico(imagens, tamanhos) {
  const cabecalho = Buffer.alloc(6 + 16 * imagens.length);
  cabecalho.writeUInt16LE(0, 0);
  cabecalho.writeUInt16LE(1, 2);
  cabecalho.writeUInt16LE(imagens.length, 4);
  let posicao = cabecalho.length;
  imagens.forEach((img, i) => {
    const e = 6 + 16 * i;
    cabecalho.writeUInt8(tamanhos[i], e);
    cabecalho.writeUInt8(tamanhos[i], e + 1);
    cabecalho.writeUInt16LE(1, e + 4);
    cabecalho.writeUInt16LE(32, e + 6);
    cabecalho.writeUInt32LE(img.length, e + 8);
    cabecalho.writeUInt32LE(posicao, e + 12);
    posicao += img.length;
  });
  return Buffer.concat([cabecalho, ...imagens]);
}

const tamanhosIco = [16, 32, 48];
const saidas = {
  "src/app/favicon.ico": ico(await Promise.all(tamanhosIco.map(png)), tamanhosIco),
  "src/app/icon1.png": await png(192),
  "src/app/apple-icon.png": await png(180),
  "public/logo.png": await png(512),
};
for (const [arquivo, conteudo] of Object.entries(saidas)) {
  fs.writeFileSync(path.join(raiz, arquivo), conteudo);
  console.log(`${arquivo}  ${conteudo.length} bytes`);
}

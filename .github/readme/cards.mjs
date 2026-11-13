// Gera os cards de "Projetos em destaque" do README: node .github/readme/cards.mjs
// Cada card é um SVG autossuficiente (miniatura e fonte embutidas), porque o GitHub
// mostra SVG como <img> e nesse modo ele não carrega nada de fora.
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert';

const root = new URL('../..', import.meta.url);
const b64 = (p) => readFileSync(new URL(p, root)).toString('base64');
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const up = (s) => s.toLocaleUpperCase('pt-BR');

const projects = [
  { id: 'kolly', title: 'Kolly Crochê', kind: 'Loja sob encomenda', url: 'kollycroche.netlify.app',
    desc: 'Mostruário de peças de crochê feitas à mão. A cliente monta a sacola e o pedido chega pronto no WhatsApp.',
    techs: ['HTML', 'CSS', 'JavaScript', 'Netlify'] },
  { id: 'bilhetei', title: 'Bilhetei', kind: 'Plataforma de ingressos', url: 'bilhetei.com',
    desc: 'Ingressos vendidos no Pix, com QR Code na hora. Quem organiza controla a portaria pelo celular.',
    techs: ['Next.js', 'React', 'TypeScript', 'Pix'] },
  { id: 'express', title: 'Express Counter', kind: 'Sistema para lojas de construção', url: 'expresscounter.com.br',
    desc: 'Balcão, estoque, loja online e entregas com rastreio em um sistema só. Usa IA para simular a cor da parede.',
    techs: ['Node.js', 'Express', 'Leaflet', 'IA'] },
  { id: 'portfolio', title: 'Portfólio AKA', kind: 'Link da bio', url: 'akapedr0.netlify.app',
    desc: 'Meu portfólio em uma página só, com animações de scroll em CSS puro e sem etapa de build.',
    techs: ['HTML', 'CSS', 'Scroll-driven'] },
];

// quebra o texto em linhas por largura aproximada (SVG não quebra linha sozinho)
function wrap(text, max) {
  const lines = [''];
  for (const word of text.split(' ')) {
    const cur = lines[lines.length - 1];
    if (cur && (cur + ' ' + word).length > max) lines.push(word);
    else lines[lines.length - 1] = cur ? cur + ' ' + word : word;
  }
  return lines;
}

const font = b64('assets/anton.woff2');
const sans = `-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
const X = 128; // início da coluna de texto

for (const p of projects) {
  const lines = wrap(p.desc, 46);
  assert(lines.length <= 3, `${p.id}: descrição passou de 3 linhas (${lines.length})`);
  assert(up(p.title).length <= 18, `${p.id}: título longo demais para o card`);

  let x = X;
  const pills = p.techs.map((t) => {
    const w = Math.round(t.length * 6.4 + 16);
    const out = `<rect x="${x}" y="126" width="${w}" height="20" fill="none" stroke="#c6b6d6"/><text x="${x + w / 2}" y="140" text-anchor="middle" class="pill">${esc(t)}</text>`;
    x += w + 6;
    return out;
  });
  assert(x <= 424, `${p.id}: as tags não cabem na largura do card`);

  const btnW = Math.round(p.url.length * 7 + 44);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 204" width="448" height="204" role="img" aria-label="${esc(p.title)}: ${esc(p.desc)}">
<style>
@font-face{font-family:A;src:url(data:font/woff2;base64,${font}) format("woff2")}
.d{font-family:A,"Arial Narrow",Impact,sans-serif}
.kind{font:700 10.5px ${sans};letter-spacing:.09em;fill:#d596ff}
.desc{font:400 12px ${sans};fill:#c6b6d6}
.pill{font:600 10.5px ${sans};fill:#faf8fc}
</style>
<clipPath id="c"><rect x="18" y="17" width="92" height="162" rx="12"/></clipPath>
<rect x="10" y="10" width="436" height="192" fill="#a100ff"/>
<rect x="1" y="1" width="436" height="192" fill="#0d0314" stroke="#faf8fc" stroke-width="2"/>
<rect x="23" y="22" width="92" height="162" rx="12" fill="#a100ff"/>
<image x="18" y="17" width="92" height="162" preserveAspectRatio="xMidYMin slice" clip-path="url(#c)" href="data:image/webp;base64,${b64(`.github/readme/${p.id}.webp`)}"/>
<rect x="18" y="17" width="92" height="162" rx="12" fill="none" stroke="#0a0210" stroke-width="3"/>
<text x="${X}" y="33" class="kind">${esc(up(p.kind))}</text>
<text x="${X}" y="63" class="d" font-size="27" fill="#faf8fc" letter-spacing=".3">${esc(up(p.title))}</text>
${lines.map((l, i) => `<text x="${X}" y="${84 + i * 16}" class="desc">${esc(l)}</text>`).join('\n')}
${pills.join('\n')}
<rect x="${X}" y="157" width="${btnW}" height="24" fill="#a100ff" stroke="#faf8fc"/>
<text x="${X + 11}" y="174" class="d" font-size="12.5" fill="#fff" letter-spacing=".8">${esc(up(p.url))}</text>
<path transform="translate(${X + btnW - 24} 162.5) scale(.055)" fill="#fff" d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/>
</svg>
`;
  writeFileSync(new URL(`.github/readme/cards/${p.id}.svg`, root), svg);
  console.log(`${p.id}.svg  ${Math.round(svg.length / 1024)} KB  ${lines.length} linhas`);
}

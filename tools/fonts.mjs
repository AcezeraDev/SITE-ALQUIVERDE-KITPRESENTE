// Converte as fontes TTF em WOFF2 só com os caracteres usados num site em português (latim + pontuação).
// Uso: node tools/fonts.mjs   (lê public/fonts/*.ttf e grava public/fonts/*.woff2)
import { readFile, writeFile, readdir } from 'node:fs/promises';
import subsetFont from 'subset-font';

const ranges = [[0x20, 0x7e], [0xa0, 0xff], [0x131, 0x131], [0x152, 0x153], [0x2c6, 0x2c6], [0x2da, 0x2dc], [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2190, 0x21bb], [0x2733, 0x2733]];
const text = ranges.flatMap(([a, b]) => Array.from({ length: b - a + 1 }, (_, i) => String.fromCodePoint(a + i))).join('');

for (const f of (await readdir('public/fonts')).filter((n) => n.endsWith('.ttf'))) {
  const src = await readFile(`public/fonts/${f}`);
  const out = await subsetFont(src, text, { targetFormat: 'woff2' });
  await writeFile(`public/fonts/${f.replace('.ttf', '.woff2')}`, out);
  console.log(f, Math.round(src.length / 1024), 'KB →', Math.round(out.length / 1024), 'KB');
}

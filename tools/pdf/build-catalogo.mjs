// Catálogo em PDF: renderiza as fotos 3D (render3d.html) e imprime catalogo.html em A4.
// Uso: node tools/pdf/build-catalogo.mjs [--sem-3d] [--es]   (--es: versão em espanhol, arquivos com -ES no nome)   →   ../catalogo-pdf/Alquiverde-Kits-Presente.pdf
import { createServer } from 'vite';
import { chromium } from 'playwright';
import { mkdir, writeFile, access, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '../..');
const out = resolve(root, '../catalogo-pdf');
const renders = resolve(root, 'tools/pdf/render');
const skip3d = process.argv.includes('--sem-3d');
const es = process.argv.includes('--es');
const q = es ? '?es' : '';
const nome = es ? 'Alquiverde-Kits-Navidad-ES' : 'Alquiverde-Kits-Presente';

const server = await createServer({ root, configFile: resolve(root, 'vite.config.js'), server: { port: 5191, strictPort: false, host: '127.0.0.1', hmr: false, watch: null }, logLevel: 'error' });
await server.listen();
const base = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

try {
  await mkdir(out, { recursive: true });
  await mkdir(renders, { recursive: true });
  if (!skip3d) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1400 } });
    page.on('console', (m) => { if (m.type() === 'error') console.error('[3d]', m.text()); });
    // o Vite pode recarregar a página na 1ª otimização de dependências: tenta de novo
    let names;
    for (let i = 0; i < 3 && !names; i++) {
      await page.goto(`${base}/tools/pdf/render3d.html`);
      names = await page.evaluate(() => window.__done).catch(() => null);
    }
    for (const n of names) {
      const data = await page.evaluate((k) => window.__renders[k], n);
      const buf = Buffer.from(data.split(',')[1], 'base64');
      // fotos 3D: corta a margem transparente; sedas e veludos são JPEG de página inteira
      if (n.startsWith('seda') || n.startsWith('veludo')) await writeFile(resolve(renders, `${n}.jpg`), buf);
      else await sharp(buf).trim({ threshold: 1 }).toFile(resolve(renders, `${n}.png`));
    }
    console.log(`3D: ${names.length} imagens em tools/pdf/render`);
    await page.close();
  }
  await access(resolve(root, 'tools/pdf/catalogo.html')).catch(() => { throw new Error('falta tools/pdf/catalogo.html'); });
  const page = await browser.newPage({ viewport: { width: 794, height: 1123 } });
  page.on('response', (r) => { if (r.status() >= 400) console.error('[pdf]', r.status(), r.url()); });
  for (let i = 0; i < 3; i++) {
    await page.goto(`${base}/tools/pdf/catalogo.html${q}`, { waitUntil: 'networkidle' });
    if (await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 }).then(() => true, () => false)) break;
  }
  await page.waitForTimeout(600);
  const faltam = await page.evaluate(() => window.__faltam || []);
  if (faltam.length) console.warn(`sem tradução (${faltam.length}):\n  ${faltam.join('\n  ')}`);
  const pdf = resolve(out, `${nome}.pdf`);
  await page.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
  // prévias das páginas para conferir
  const n = await page.locator('.page').count();
  await rm(resolve(out, es ? 'previas-es' : 'previas'), { recursive: true, force: true });
  await mkdir(resolve(out, es ? 'previas-es' : 'previas'), { recursive: true });
  for (let i = 0; i < n; i++) await page.locator('.page').nth(i).screenshot({ path: resolve(out, 'previas', `pagina-${String(i + 1).padStart(2, '0')}.png`) });
  console.log(`PDF: ${pdf} (${n} páginas)`);
  // versão leve para WhatsApp/e-mail: o Chrome guarda PNG/WebP sem perda, então a página troca as imagens
  // por cópias menores (JPEG nas opacas, PNG com paleta nas que têm transparência) em tools/pdf/leve
  const leveDir = resolve(root, 'tools/pdf/leve');
  await rm(leveDir, { recursive: true, force: true });
  await mkdir(leveDir, { recursive: true });
  const srcs = await page.evaluate(() => [...new Set([...document.images].map((i) => new URL(i.src).pathname)
    .concat([...document.querySelectorAll('[style*="--silk"]')].map((e) => e.style.getPropertyValue('--silk').match(/\((.*)\)/)[1])))]);
  const mapa = {};
  for (const src of srcs) {
    const path = decodeURIComponent(src);
    const file = path.startsWith('/tools/') ? resolve(root, '.' + path) : resolve(root, 'public', '.' + path);
    const alpha = (await sharp(file).metadata()).hasAlpha;
    const name = `${path.slice(1).replaceAll('/', '__').replace(/\.\w+$/, '')}.${alpha ? 'png' : 'jpg'}`;
    const img = sharp(file).resize(alpha ? 1000 : 1240, alpha ? 1000 : 1754, { fit: 'inside', withoutEnlargement: true });
    await (alpha ? img.png({ palette: true, quality: 90, effort: 8 }) : img.jpeg({ quality: 80, mozjpeg: true })).toFile(resolve(leveDir, name));
    mapa[path] = `/tools/pdf/leve/${name}`;
  }
  await writeFile(resolve(leveDir, 'mapa.json'), JSON.stringify(mapa, null, 1));
  // as cópias leves são recriadas a cada build: servidas direto do disco, sem depender do cache do Vite
  await page.route('**/tools/pdf/leve/**', (route) => route.fulfill({ path: resolve(leveDir, decodeURIComponent(new URL(route.request().url()).pathname.split('/').pop())) }));
  for (let i = 0; i < 3; i++) {
    await page.goto(`${base}/tools/pdf/catalogo.html?leve${es ? '&es' : ''}`, { waitUntil: 'load' });
    if (await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 }).then(() => true, () => false)) break;
  }
  await page.waitForTimeout(600);
  const leve = resolve(out, es ? `${nome}-ligero.pdf` : `${nome}-leve.pdf`);
  await page.pdf({ path: leve, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log(`PDF leve: ${leve}`);
} finally {
  await browser.close();
  await server.close();
}

// Lista os textos do site que ainda não têm tradução (inglês e espanhol).
// Junta: HTML do build, todas as combinações de cada kit (normal e modo leve) e o que o JavaScript escreve na tela.
// Uso: npm run build e o servidor de dev ligado; depois BASE_URL=http://localhost:5180 npm run i18n:extract → grava i18n-faltando.json
import { readFile, writeFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { chromium } from 'playwright';
import { KIT_PAGES } from '../src/kitPages.js';
import { KITS } from '../src/kits.js';
import { kitRenderer } from '../src/kitMarkup.js';
import { makeTranslator, translateTree } from '../src/i18nCore.js';
import en from '../src/i18n/en.js';
import es from '../src/i18n/es.js';

const BASE = process.env.BASE_URL || 'http://localhost:5180';
const found = new Set();
const add = (s) => { const v = s.replace(/\s+/g, ' ').trim(); if (/\p{L}/u.test(v)) found.add(v); };
const collect = makeTranslator({}, { onMissing: add });
const fromHTML = (html) => { const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`); translateTree(document.body, 'en', collect); };

// 1. páginas do build
for (const f of ['index.html', 'monte.html', ...Object.keys(KIT_PAGES).map((s) => `kits/${s}/index.html`)]) {
  const { document } = parseHTML(await readFile(`dist/${f}`, 'utf8'));
  translateTree(document.body, 'en', collect);
  add(document.querySelector('title')?.textContent || '');
  document.querySelectorAll('meta[content]').forEach((m) => /description|title|alt|site_name/.test(m.getAttribute('name') || m.getAttribute('property') || '') && add(m.getAttribute('content')));
}
// 2. cada combinação de cada kit
for (const page of Object.values(KIT_PAGES)) for (let i = 0; i < 8; i++) for (const light of [false, true]) fromHTML(kitRenderer(page).render(i, light).html);
for (const k of KITS) for (const v of k.variants) { (k.itemsFor?.(v) || []).forEach(add); add(v.label || ''); add(v.tag || ''); (v.soaps || []).forEach(add); }

// 3. o que o JavaScript escreve depois de carregar (com cliques nos controles principais)
const browser = await chromium.launch();
const grab = async (page) => page.evaluate(() => {
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = w.currentNode; n; n = w.nextNode()) {
    if (n.nodeType === 3) { if (!n.parentElement.closest('script,style,[translate="no"]')) out.push(n.data); }
    else ['alt', 'aria-label', 'title', 'placeholder'].forEach((a) => n.getAttribute(a) && out.push(n.getAttribute(a)));
  }
  return out;
});
const clickAll = async (page, sel, max = 30) => {
  const n = Math.min(await page.locator(sel).count(), max);
  for (let i = 0; i < n; i++) { try { await page.locator(sel).nth(i).click({ timeout: 800, force: true }); (await grab(page)).forEach(add); } catch { /* invisível */ } }
};
for (const mode of ['', '?leve=1']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: mode ? 'no-preference' : 'reduce' });
  await page.goto(`${BASE}/${mode}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  (await grab(page)).forEach(add);
  await clickAll(page, '.variant');
  await clickAll(page, '.ing-card', 8);
  await page.goto(`${BASE}/monte.html${mode}`, { waitUntil: 'networkidle' }); await page.waitForTimeout(1200);
  (await grab(page)).forEach(add);
  await clickAll(page, '.mk-size, [data-size]', 3);
  await clickAll(page, '.mk-soap, [data-soap]', 9);
  await clickAll(page, '.mk-extra', 6);
  await clickAll(page, '#mkClose', 1);
  for (const slug of Object.keys(KIT_PAGES)) {
    await page.goto(`${BASE}/kits/${slug}/${mode}`, { waitUntil: 'domcontentloaded' }); await page.waitForTimeout(700);
    (await grab(page)).forEach(add);
    await clickAll(page, '.variant[data-v]', 4);
  }
  await page.close();
}
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(`${BASE}/`, { waitUntil: 'networkidle' }); await mob.waitForTimeout(1200);
(await grab(mob)).forEach(add);
await clickAll(mob, '.nav-toggle', 1);
await browser.close();

const result = {};
for (const [lang, dict] of Object.entries({ en, es })) {
  const T = makeTranslator(dict);
  result[lang] = [...found].filter((s) => T.tr(s) == null).sort();
}
await writeFile('i18n-faltando.json', JSON.stringify(result, null, 2));
console.log(`textos encontrados: ${found.size} · sem tradução: en ${result.en.length}, es ${result.es.length} → i18n-faltando.json`);

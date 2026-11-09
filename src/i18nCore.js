// Núcleo da tradução: o site é escrito em português e cada texto é trocado pelo dicionário do idioma.
// Mesmo código no build (linkedom, tools/seo-build.mjs) e no navegador (src/i18n.js).
// Dicionário: { text: { 'texto em português': 'tradução' }, patterns: [[/regex/, (m, tr) => '...']] }

export const LANGS = ['pt', 'en', 'es'];
export const HTML_LANG = { pt: 'pt-BR', en: 'en', es: 'es' };
export const OG_LOCALE = { pt: 'pt_BR', en: 'en_US', es: 'es_ES' };
export const LANG_LABEL = { pt: 'Português', en: 'English', es: 'Español' };

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const hasWords = (s) => /\p{L}/u.test(s);

// páginas do site (não imagens nem arquivos): /, /?x, /#x, /monte.html, /kits/<slug>/, /kit.html
const PAGE = /^\/(?:[?#].*)?$|^\/(?:monte\.html|kit\.html)(?:[?#].*)?$|^\/kits\/[a-z0-9-]+\/(?:[?#].*)?$/;
export const stripLang = (path) => path.replace(/^\/(en|es)(?=\/)/, '') || '/';
export const localize = (href, lang) => {
  if (!href || lang === 'pt' || !PAGE.test(href)) return href;
  return `/${lang}${href}`;
};
export const pathFor = (ptPath, lang) => (lang === 'pt' ? ptPath : `/${lang}${ptPath}`);

export function makeTranslator(dict, { onMissing } = {}) {
  const text = dict?.text || {};
  const patterns = dict?.patterns || [];
  const tr = (raw) => {
    const s = norm(raw);
    if (!s || !hasWords(s)) return null;
    if (Object.hasOwn(text, s)) return text[s];
    for (const [re, fn] of patterns) {
      const m = s.match(re);
      // fn(m, t, strict): t devolve o original quando não acha; strict devolve null
      if (m) { const out = fn(m, (x) => tr(x) ?? x, tr); if (out != null) return out; }
    }
    // partes separadas por " · " (rótulos compostos: "Caixa vermelha · Kit Clássico")
    if (s.includes(' · ')) {
      const parts = s.split(' · ');
      const done = parts.map((p) => tr(p));
      if (done.every((p, i) => p != null || !hasWords(parts[i]))) return done.map((p, i) => p ?? parts[i]).join(' · ');
    }
    return null;
  };
  // troca preservando os espaços nas pontas
  const swap = (raw) => {
    const out = tr(raw);
    if (out == null) { const s = norm(raw); if (hasWords(s)) onMissing?.(s); return null; }
    const lead = raw.match(/^\s*/)[0], tail = raw.match(/\s*$/)[0];
    return lead + out + tail;
  };
  return { tr, swap };
}

// seletor de idioma do cabeçalho: cada opção aponta para a mesma página no outro idioma
export function setLangSwitch(doc, lang, ptPath, hash = '') {
  doc.querySelectorAll('.lang').forEach((box) => {
    const cur = box.querySelector('.lang__cur');
    if (cur) cur.textContent = lang.toUpperCase();
    box.querySelectorAll('a[data-lang]').forEach((a) => {
      const l = a.getAttribute('data-lang');
      a.setAttribute('href', pathFor(ptPath, l) + hash);
      if (l === lang) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  });
}

const ATTRS =['alt', 'aria-label', 'title', 'placeholder', 'data-cursor-label'];
const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'CODE']);

// traduz um nó e tudo dentro dele; links internos ganham o prefixo do idioma
export function translateTree(node, lang, { swap }) {
  if (lang === 'pt' || !node) return;
  if (node.nodeType === 3) {
    const out = swap(node.data);
    if (out != null && out !== node.data) node.data = out;
    return;
  }
  if (node.nodeType !== 1 && node.nodeType !== 9 && node.nodeType !== 11) return;
  if (node.nodeType === 1) {
    if (SKIP.has(node.tagName) || node.getAttribute('translate') === 'no') return;
    translateAttrs(node, lang, swap);
    // frase que acende palavra por palavra: refeita a partir da frase inteira (aria-label da seção, já traduzido)
    if (node.classList?.contains('kp-reveal__text')) { rebuildWords(node); return; }
  }
  for (const child of [...node.childNodes]) translateTree(child, lang, { swap });
}

function rebuildWords(p) {
  const phrase = p.closest('.kp-reveal')?.getAttribute('aria-label');
  if (!phrase) return;
  const doc = p.ownerDocument;
  while (p.firstChild) p.removeChild(p.firstChild);
  phrase.split(' ').forEach((w, i) => {
    if (i) p.appendChild(doc.createTextNode(' '));
    const box = doc.createElement('span'); box.className = 'kp-w';
    for (const cls of ['kp-w__ghost', 'kp-w__ink']) { const s = doc.createElement('span'); s.className = cls; s.textContent = w; box.appendChild(s); }
    p.appendChild(box);
  });
}

export function translateAttrs(el, lang, swap) {
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (v) { const out = swap(v); if (out != null && out !== v) el.setAttribute(a, out); }
  }
  if (el.tagName === 'INPUT' && /^(submit|button)$/i.test(el.getAttribute('type') || '')) {
    const v = el.getAttribute('value');
    if (v) { const out = swap(v); if (out != null) el.setAttribute('value', out); }
  }
  if (el.tagName === 'A') {
    const h = el.getAttribute('href');
    const out = localize(h, lang);
    if (out !== h) el.setAttribute('href', out);
  }
  if (el.tagName === 'FORM') {
    const h = el.getAttribute('action');
    if (h) { const out = localize(h, lang); if (out !== h) el.setAttribute('action', out); }
  }
}

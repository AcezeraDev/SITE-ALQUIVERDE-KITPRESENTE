// Gera as versões em inglês e espanhol a partir do HTML em português (build e servidor de desenvolvimento).
import { parseHTML } from 'linkedom';
import en from '../src/i18n/en.js';
import es from '../src/i18n/es.js';
import { makeTranslator, translateTree, setLangSwitch, localize, HTML_LANG, OG_LOCALE } from '../src/i18nCore.js';

export const DICTS = { en, es };
export const missing = { en: new Set(), es: new Set() };

const META_TEXT = ['description', 'twitter:title', 'twitter:description', 'twitter:image:alt'];
const META_PROP = ['og:title', 'og:description', 'og:image:alt', 'og:site_name'];

// troca o caminho de uma URL absoluta do próprio site para o idioma
const localizeAbs = (value, lang, siteUrl) => {
  if (!siteUrl || !value?.startsWith(siteUrl)) return value;
  const rest = value.slice(siteUrl.length) || '/';
  return siteUrl + localize(rest, lang);
};

export function translateHTML(html, lang, ptPath, { siteUrl = '' } = {}) {
  const T = makeTranslator(DICTS[lang], { onMissing: (s) => missing[lang].add(s) });
  const { document } = parseHTML(html);
  document.documentElement.setAttribute('lang', HTML_LANG[lang]);

  const title = document.querySelector('title');
  if (title) { const out = T.tr(title.textContent); if (out) title.textContent = out; else missing[lang].add(title.textContent.trim()); }
  for (const name of META_TEXT) document.querySelectorAll(`meta[name="${name}"]`).forEach((m) => { const out = T.swap(m.getAttribute('content') || ''); if (out != null) m.setAttribute('content', out); });
  for (const p of META_PROP) document.querySelectorAll(`meta[property="${p}"]`).forEach((m) => { const out = T.swap(m.getAttribute('content') || ''); if (out != null) m.setAttribute('content', out); });
  document.querySelectorAll('meta[property="og:locale"]').forEach((m) => m.setAttribute('content', OG_LOCALE[lang]));
  document.querySelectorAll('link[rel="canonical"]').forEach((l) => l.setAttribute('href', localizeAbs(l.getAttribute('href'), lang, siteUrl)));
  document.querySelectorAll('meta[property="og:url"]').forEach((m) => m.setAttribute('content', localizeAbs(m.getAttribute('content'), lang, siteUrl)));

  // dados estruturados: idioma, nomes e endereços da página
  document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
    try {
      const data = JSON.parse(s.textContent);
      const walk = (o) => {
        if (Array.isArray(o)) return o.forEach(walk);
        if (!o || typeof o !== 'object') return;
        for (const [k, v] of Object.entries(o)) {
          if (k === 'inLanguage') o[k] = HTML_LANG[lang];
          else if ((k === 'name' || k === 'description') && typeof v === 'string' && o['@type'] !== 'Organization' && o['@type'] !== 'Brand') o[k] = T.tr(v) ?? v;
          else if ((k === 'url' || k === '@id' || k === 'item') && typeof v === 'string' && o['@type'] !== 'Organization') o[k] = localizeAbs(v, lang, siteUrl);
          else walk(v);
        }
      };
      walk(data);
      s.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    } catch { /* mantém o original */ }
  });

  translateTree(document.body, lang, T);
  setLangSwitch(document, lang, ptPath);
  return '<!doctype html>\n' + document.documentElement.outerHTML;
}

export function missingReport() {
  return Object.fromEntries(Object.entries(missing).map(([l, s]) => [l, [...s].sort()]));
}

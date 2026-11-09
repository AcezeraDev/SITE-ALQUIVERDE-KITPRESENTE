// Idioma da página (pelo <html lang>). Em inglês e espanhol, traduz o que o JavaScript escreve depois do carregamento.
// Importe primeiro em cada página: o texto já vem traduzido do build e este módulo cobre o que muda em tempo de execução.
import { LANGS, makeTranslator, translateTree, translateAttrs, setLangSwitch, stripLang } from './i18nCore.js';
import './lang.css';

const code = (document.documentElement.lang || 'pt').slice(0, 2);
export const LANG = LANGS.includes(code) && code !== 'pt' ? code : 'pt';

const dict = LANG === 'pt' ? null : (await import(`./i18n/${LANG}.js`)).default;
const missing = new Set();
const produced = new Set();
let quiet = true; // o HTML já vem traduzido do build: na primeira passada, texto "desconhecido" é o próprio texto traduzido
const known = new Set(Object.values(dict?.text || {})); // texto que já é tradução (copiado de um lugar para outro pelo JS)
const T = makeTranslator(dict, { onMissing: (s) => { if (!quiet && !produced.has(s) && !known.has(s)) missing.add(s); } });
// no navegador, pedaços com menos de 3 caracteres nunca são traduzidos: são letras soltas da animação (SplitText)
// e já vieram traduzidos do build quando fazem parte do texto ("e", "O" do FAQ). Sem isso, "Free" virava "Frandand".
const swap = (raw) => {
  if (raw.trim().length < 3) return null;
  const out = T.swap(raw); if (out != null) produced.add(out.trim()); return out;
};
// palavras e letras criadas pela SplitText (aria-hidden dentro de um elemento com aria-label): texto já traduzido
const isSplitPiece = (n) => n.nodeType === 1 && n.getAttribute('aria-hidden') === 'true' && n.parentElement?.hasAttribute('aria-label');
const translator = { swap };
if (import.meta.env.DEV) window.__i18nMissing = missing;

// texto avulso em JS (ex.: mensagens montadas antes de ir para a tela)
export const t = (s) => (LANG === 'pt' ? s : T.tr(s) ?? s);

// seletor de idioma com a página atual e a âncora
const syncSwitch = () => setLangSwitch(document, LANG, stripLang(location.pathname), location.hash);
syncSwitch();
addEventListener('hashchange', syncSwitch);
document.querySelectorAll('.lang').forEach((box) => {
  document.addEventListener('click', (e) => { if (!box.contains(e.target)) box.open = false; });
  box.addEventListener('keydown', (e) => { if (e.key === 'Escape' && box.open) { box.open = false; box.querySelector('summary').focus(); } });
  box.querySelectorAll('a[data-lang]').forEach((a) => a.addEventListener('click', () => { a.href = a.href.split('#')[0] + location.hash; }));
});

if (LANG !== 'pt') {
  translateTree(document.body, LANG, translator);
  document.title = T.tr(document.title) ?? document.title;
  quiet = false;
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') { if (r.target.nodeType === 1) translateAttrs(r.target, LANG, swap); }
      else r.addedNodes.forEach((n) => { if (!isSplitPiece(n) && !n.parentElement?.closest('.lang')) translateTree(n, LANG, translator); });
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['alt', 'aria-label', 'title', 'placeholder', 'href'] });
}

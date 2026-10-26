import { lightMode } from './experience.js';
import './light.css';
import './navigation.js';
// Página "Monte o seu kit": escolhe a caixa (3, 6 ou 9 sabonetes), os sabonetes e os extras; a caixa 3D acompanha.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { INGREDIENTS } from './kits.js';
import { ITEM_INFO } from './kitPages.js';
import { magnetic } from './fx.js';
import { idleTask } from './lazy.js';
import { loadBag, addToBag } from './bag.js';
import { decorateSections } from './decor.js';
import { initWhatsApp } from './whatsapp.js';

decorateSections();
initWhatsApp();

const { initBuilder, SOAP_KEYS } = await (lightMode ? import('./lightScenes.js') : import('./fullScenes.js'));

gsap.registerPlugin(ScrollTrigger, SplitText);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = lightMode || matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = !lightMode && matchMedia('(hover: hover) and (pointer: fine)').matches;
const EASE = { enter: 'expo.out', soft: 'power3.out' };

// tamanhos de caixa e quantos extras cabem em cada uma
const SIZES = [{ n: 3, extras: 2 }, { n: 6, extras: 3 }, { n: 9, extras: 4 }];
const SOAPS = INGREDIENTS.map((g) => ({ key: g.img, name: g.name, line: g.line, color: g.color }));
// extras com foto (aparecem em pé no fundo da caixa); height = altura na cena 3D
const EXTRA_IDS = ['essencia-morango', 'essencia-natal', 'essencia-chocolate', 'oleo-canela', 'oleo-cravo', 'vela', 'bucha'];
const HEIGHT = { vela: 1.25, bucha: 0.8 };
const EXTRAS = EXTRA_IDS.filter((id) => ITEM_INFO[id]?.photo).map((id) => ({ id, ...ITEM_INFO[id], height: HEIGHT[id] || 1.5 }));

let restored;
try { restored = JSON.parse(sessionStorage.getItem('alquiverde:montagem-modo')); sessionStorage.removeItem('alquiverde:montagem-modo'); } catch {}
const state = { size: 6, picks: [], extras: [] };
if (restored && SIZES.some((s) => s.n === restored.size) && Array.isArray(restored.picks) && Array.isArray(restored.extras)) {
  state.size = restored.size;
  state.picks = restored.picks.filter((k) => SOAPS.some((s) => s.key === k)).slice(0, state.size);
  state.extras = restored.extras.filter((id) => EXTRAS.some((x) => x.id === id)).slice(0, SIZES.find((s) => s.n === state.size).extras);
}
addEventListener('experiencechange', () => { try { sessionStorage.setItem('alquiverde:montagem-modo', JSON.stringify(state)); } catch {} }); // picks: chaves na ordem em que foram escolhidas
const cap = () => SIZES.find((s) => s.n === state.size).extras;
const count = (k) => state.picks.filter((x) => x === k).length;
const nameOf = (k) => SOAPS.find((s) => s.key === k).name;

/* ---------------- Painel ---------------- */
const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const minus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const dotsFor = (n) => `<span class="mk-size__dots" style="--rows:${n / 3}">${'<i></i>'.repeat(n)}</span>`;

$('#mkPanel').innerHTML = `
  <div class="mk-step" aria-labelledby="mkS1">
    <p class="mk-step__num">01</p>
    <h2 id="mkS1">Tamanho da caixa</h2>
    <div class="mk-sizes" role="radiogroup" aria-labelledby="mkS1">
      ${SIZES.map((s) => `
      <button type="button" class="mk-size" role="radio" aria-checked="${s.n === state.size}" data-size="${s.n}">
        ${dotsFor(s.n)}
        <span class="mk-size__n">${s.n} sabonetes</span>
        <span class="mk-size__x">+ até ${s.extras} extras</span>
      </button>`).join('')}
    </div>
  </div>

  <div class="mk-step" aria-labelledby="mkS2">
    <p class="mk-step__num">02</p>
    <h2 id="mkS2">Sabonetes</h2>
    <div class="mk-progress" aria-hidden="true"><span id="mkBar"></span></div>
    <p class="mk-need" id="mkNeed" aria-live="polite"></p>
    <ul class="mk-soaps">
      ${SOAPS.map((s) => `
      <li class="mk-soap" data-key="${s.key}" style="--ing:${s.color}">
        <img src="/soaps/${s.key}.webp" alt="" width="72" height="72" loading="lazy" decoding="async" />
        <span class="mk-soap__txt"><b>${s.name}</b><small>${s.line}</small></span>
        <span class="mk-qty">
          <button type="button" class="mk-qty__btn" data-act="minus" aria-label="Tirar um sabonete de ${s.name}">${minus}</button>
          <output class="mk-qty__n" aria-label="Sabonetes de ${s.name} na caixa">0</output>
          <button type="button" class="mk-qty__btn" data-act="plus" aria-label="Pôr um sabonete de ${s.name}">${plus}</button>
        </span>
      </li>`).join('')}
    </ul>
    <div class="mk-actions">
      <button type="button" class="mk-ghost" id="mkSurprise">Surpreenda-me</button>
      <button type="button" class="mk-ghost" id="mkClear">Limpar</button>
    </div>
  </div>

  <div class="mk-step" aria-labelledby="mkS3">
    <p class="mk-step__num">03</p>
    <h2 id="mkS3">Extras <small id="mkExtraCap"></small></h2>
    <ul class="mk-extras">
      ${EXTRAS.map((x) => `
      <li><button type="button" class="mk-extra" aria-pressed="false" data-id="${x.id}" style="--ing:${x.color}">
        <span class="mk-extra__img"><img src="${x.photo}" alt="" loading="lazy" decoding="async" /></span>
        <span class="mk-extra__name">${x.name}</span>
        <span class="mk-extra__kind">${x.kind || ''}</span>
        <span class="mk-extra__check" aria-hidden="true">${plus}</span>
      </button></li>`).join('')}
    </ul>
  </div>

  <div class="mk-step mk-summary" aria-labelledby="mkS4">
    <p class="mk-step__num">04</p>
    <h2 id="mkS4">Seu kit</h2>
    <ul class="mk-list" id="mkList"></ul>
    <p class="mk-price">Preço em breve</p>
    <div class="mk-cta">
      <button type="button" class="kit__add" id="mkClose" disabled><span>Fechar a caixa</span>${arrow}</button>
      <div class="mk-done" id="mkDone" hidden>
        <button type="button" class="kit__add" id="mkAdd"><span>Adicionar à sacola</span>${arrow}</button>
        <button type="button" class="mk-ghost" id="mkReopen">Abrir de novo</button>
      </div>
    </div>
  </div>`;

if (lightMode) $('.mk-sub').textContent = 'Escolha a caixa, combine os sabonetes e acrescente os extras. Acompanhe cada detalhe do seu presente na prévia.';

/* ---------------- 3D ---------------- */
const builder = initBuilder($('#mkGL'), { reduced });
// os sabonetes entram no cache um por vez, em momentos ociosos (sem soluço ao escolher)
SOAP_KEYS.forEach((k) => idleTask(() => builder.preload([k])));

function sync() {
  const extras = state.extras.map((id) => EXTRAS.find((x) => x.id === id));
  builder.update({ size: state.size, soaps: state.picks, extras });
  const missing = state.size - state.picks.length;
  $('#mkBar').style.transform = `scaleX(${state.picks.length / state.size})`;
  $('#mkNeed').textContent = missing > 0 ? `${state.picks.length} de ${state.size} · faltam ${missing}` : `${state.size} de ${state.size} · caixa completa`;
  $('#mkCount').textContent = `${state.picks.length}/${state.size} sabonetes${state.extras.length ? ` · ${state.extras.length} extra${state.extras.length > 1 ? 's' : ''}` : ''}`;
  $$('.mk-soap').forEach((li) => {
    const k = li.dataset.key, n = count(k);
    $('.mk-qty__n', li).textContent = n;
    li.classList.toggle('is-on', n > 0);
    $('[data-act="minus"]', li).disabled = n === 0;
    $('[data-act="plus"]', li).disabled = missing === 0;
  });
  $('#mkExtraCap').textContent = `opcional · até ${cap()}`;
  $$('.mk-extra').forEach((b) => {
    const on = state.extras.includes(b.dataset.id);
    b.setAttribute('aria-pressed', String(on));
    b.disabled = !on && state.extras.length >= cap();
  });
  $$('.mk-size').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.size === state.size)));
  // resumo
  const groups = [...new Set(state.picks)].map((k) => `<li><b>${count(k)} ×</b> Sabonete Vegetal de ${nameOf(k)} <small>90 g</small></li>`);
  const ex = state.extras.map((id) => `<li><b>1 ×</b> ${ITEM_INFO[id].name}${ITEM_INFO[id].sub ? ` <small>${ITEM_INFO[id].sub}</small>` : ''}</li>`);
  $('#mkList').innerHTML = [`<li><b>1 ×</b> Caixa de presente para ${state.size} sabonetes</li>`, ...groups, ...ex].join('');
  const close = $('#mkClose');
  close.disabled = missing > 0;
  $('span', close).textContent = missing > 0 ? `Faltam ${missing} sabonete${missing > 1 ? 's' : ''}` : 'Fechar a caixa';
  showDone(false);
}
function showDone(on) {
  $('#mkClose').hidden = on;
  $('#mkDone').hidden = !on;
}

/* ---------------- Eventos ---------------- */
$('.mk-sizes').addEventListener('click', (e) => {
  const b = e.target.closest('.mk-size'); if (!b) return;
  state.size = +b.dataset.size;
  state.picks = state.picks.slice(0, state.size); // se diminuir, sai o que foi escolhido por último
  state.extras = state.extras.slice(0, cap());
  sync();
});
$('.mk-soaps').addEventListener('click', (e) => {
  const b = e.target.closest('.mk-qty__btn'); if (!b) return;
  const k = b.closest('.mk-soap').dataset.key;
  if (b.dataset.act === 'plus' && state.picks.length < state.size) state.picks.push(k);
  if (b.dataset.act === 'minus') { const i = state.picks.lastIndexOf(k); if (i >= 0) state.picks.splice(i, 1); }
  sync();
});
$('#mkSurprise').addEventListener('click', () => {
  // completa os encaixes vazios variando os sabonetes (evita repetir o mesmo em sequência)
  const pool = SOAPS.map((s) => s.key);
  while (state.picks.length < state.size) {
    const opts = pool.filter((k) => k !== state.picks[state.picks.length - 1]);
    state.picks.push(opts[Math.floor(Math.random() * opts.length)]);
  }
  sync();
});
$('#mkClear').addEventListener('click', () => { state.picks = []; sync(); });
$('.mk-extras').addEventListener('click', (e) => {
  const b = e.target.closest('.mk-extra'); if (!b || b.disabled) return;
  const id = b.dataset.id;
  state.extras = state.extras.includes(id) ? state.extras.filter((x) => x !== id) : [...state.extras, id];
  sync();
});
$('#mkClose').addEventListener('click', () => {
  builder.close();
  showDone(true);
  $('#mkAdd').focus();
});
$('#mkReopen').addEventListener('click', () => { builder.open(); showDone(false); $('#mkClose').focus(); });
$('#mkAdd').addEventListener('click', () => {
  const groups = [...new Set(state.picks)].map((k) => `${count(k)} ${nameOf(k)}`);
  const extras = state.extras.map((id) => ITEM_INFO[id].name);
  const n = addToBag({
    name: `Kit Monte o seu · ${state.size} sabonetes`,
    variant: [groups.join(' · '), extras.length ? `+ ${extras.join(', ')}` : ''].filter(Boolean).join(' '),
    img: builder.snapshot(),
  });
  $('#bagCount').textContent = n;
  const t = $('#mkToast');
  t.innerHTML = `Seu kit foi para a sacola. <a href="/?sacola">Ver sacola ${arrow}</a>`;
  t.hidden = false;
  if (!reduced) gsap.fromTo(t, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: EASE.enter });
  clearTimeout(t._h); t._h = setTimeout(() => { t.hidden = true; }, 6000);
});

/* ---------------- Página ---------------- */
$('#bagCount').textContent = loadBag().length;
sync();

let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  if (import.meta.env.DEV) window.__lenis = lenis;
}
const header = $('#header');
ScrollTrigger.create({ start: 'top -160', end: 'max', onUpdate: (s) => header.classList.toggle('is-hidden', s.direction === 1) });
if (finePointer) $$('[data-magnetic]').forEach((el) => magnetic(el));
if (finePointer && !reduced) {
  const cursor = $('.cursor'), label = $('.cursor__label');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
  addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const big = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button');
    cursor.classList.toggle('is-big', !!big && !link);
    cursor.classList.toggle('is-link', !!link);
    if (big) label.textContent = big.dataset.cursor;
  });
}
if (!reduced) {
  const split = SplitText.create('.mk-title', { type: 'words,chars', mask: 'lines' });
  gsap.timeline({ defaults: { ease: EASE.enter } })
    .from(split.chars, { yPercent: 110, duration: 1.2, stagger: 0.025 }, 0.1)
    .from('.mk-head .eyebrow, .mk-sub, .mk-head .kp-crumbs', { y: 16, opacity: 0, duration: 0.8, stagger: 0.06, ease: EASE.soft }, 0.3)
    .from('.mk-stage', { y: 40, opacity: 0, duration: 1.1 }, 0.4)
    .from('.mk-step', { y: 24, opacity: 0, duration: 0.8, stagger: 0.08, ease: EASE.soft }, 0.55);
}
document.fonts.ready.then(() => ScrollTrigger.refresh());

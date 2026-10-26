import { setImageSource } from './imageSizes.js';
import { kitMetadata } from './seo.js';
import { kitRenderer } from './kitMarkup.js';
import { lightMode } from './experience.js';
import './light.css';
import './navigation.js';
// Página de cada kit: /kit.html?k=<slug>[&v=<combinação>]
// Mesma direção de movimento da landing (MOTION.md · "papel que se desembrulha").
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { KIT_PAGES, SOAP_INFO, ITEM_INFO, variantsOf, soapVarieties, careOf } from './kitPages.js';
import { KITS, shopUrl, priceText } from './kits.js';
import { tilt, magicCard, magnetic } from './fx.js';
import { decorateSections } from './decor.js';
import { initWhatsApp } from './whatsapp.js';
import { lazyScene, idleTask, warmUpScenes } from './lazy.js';

const { initKitViewer, initSoapStage, initModelViewer } = await (lightMode ? import('./lightScenes.js') : import('./fullScenes.js'));

gsap.registerPlugin(ScrollTrigger, SplitText);

const EASE = { enter: 'expo.out', soft: 'power3.out', exit: 'power3.in', inOut: 'power3.inOut' };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = lightMode || matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = !lightMode && matchMedia('(hover: hover) and (pointer: fine)').matches;

const params = new URLSearchParams(location.search);
const slug = document.querySelector('#kitRoot')?.dataset.slug || params.get('k');
const page = KIT_PAGES[slug];
const { render, listHTML, hotspotsHTML, piecesOf, icon } = page ? kitRenderer(page) : {};


/* ---------------- Montagem e melhoria progressiva ---------------- */
function build() {
  const { html, variants, vi } = render(params.get('v'), lightMode);
  const root = $('#kitRoot');
  // Reuse build-time HTML for the default view; preserve links without JavaScript.
  if (!root.dataset.rendered || vi !== 0 || lightMode) root.innerHTML = html;
  if (!root.dataset.rendered) {
    document.title = kitMetadata(page).title;
    $('meta[name="description"]').content = kitMetadata(page).description;
  }
  if (page.draft) $('#footNote').textContent = 'Conceito interativo · texto deste kit em revisão';
  document.documentElement.style.setProperty('--tone', page.tone);
  document.documentElement.style.setProperty('--kbg', page.bg);
  document.documentElement.style.setProperty('--kink', page.ink);
  decorateSections();
  initWhatsApp();

  wire(variants, vi);
}

/* ---------------- Interações ---------------- */
function wire(variants, vi) {
  // Lenis + âncoras
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    if (import.meta.env.DEV) window.__lenis = lenis;
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(t, { offset: -70, duration: 1.4 }); else t.scrollIntoView();
  }));

  // Header some ao descer
  const header = $('#header');
  ScrollTrigger.create({ start: 'top -160', end: 'max', onUpdate: (s) => header.classList.toggle('is-hidden', s.direction === 1) });

  // Efeitos (Magic UI / 21st, portados em fx.js)
  $$('.magic-card').forEach(magicCard);
  if (finePointer) $$('[data-magnetic]').forEach((el) => magnetic(el));
  const visual = $('.kp-hero__visual');
  tilt(visual, { max: 9 });

  // 3D: um canvas por modelo, criado só quando a combinação tem modelo
  const viewers = {};
  const badge = $('.kp-hero__badge');
  function show3d(v) {
    $$('.kp-hero__gl').forEach((c) => {
      const on = c.dataset.model === v.model;
      c.hidden = !on;
      if (on && !viewers[v.model]) viewers[v.model] = initKitViewer(c, v.model, { reduced });
      else if (on) viewers[v.model].replayIntro();
    });
    if (badge) badge.hidden = !v.model || viewers[v.model]?.available === false;
    // a foto real fica visível até a textura da frente chegar; depois o 3D assume (sem pedestal vazio)
    visual.classList.remove('is-3d');
    if (!v.model || viewers[v.model]?.available === false) return;
    if (v.model === 'cinco-oleos') {
      viewers[v.model].ready.then(() => {
        if (variants[cur] === v && viewers[v.model].available) visual.classList.add('is-3d');
      });
      return;
    }
    const pre = new Image();
    pre.onload = () => setTimeout(() => { if (variants[cur] === v) visual.classList.add('is-3d'); }, 250);
    pre.src = `/kit3d/${v.model}-front.webp`;
  }
  let cur = vi;
  show3d(variants[vi]);

  // Lista: acordeão (um aberto por vez) + hotspots ligados aos itens
  const list = $('#kpList');
  const hotWrap = $('.kp-hotspots');
  function openItem(id, { scroll = false } = {}) {
    $$('.kp-item', list).forEach((li) => {
      const on = li.dataset.id === id && li.querySelector('[aria-expanded]').getAttribute('aria-expanded') !== 'true';
      const head = li.querySelector('.kp-item__head');
      const det = li.querySelector('.kp-item__detail');
      head.setAttribute('aria-expanded', String(on));
      li.classList.toggle('is-open', on);
      if (on) {
        det.hidden = false;
        if (!reduced) gsap.fromTo(det, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: EASE.enter, clearProps: 'height' });
        if (scroll && lenis) lenis.scrollTo(li, { offset: -140, duration: 1 });
        else if (scroll) li.scrollIntoView({ block: 'nearest' });
      } else if (!det.hidden) {
        if (reduced) det.hidden = true;
        else gsap.to(det, { height: 0, opacity: 0, duration: 0.32, ease: EASE.exit, onComplete: () => { det.hidden = true; gsap.set(det, { clearProps: 'all' }); } });
      }
    });
    $$('.kp-hot', hotWrap).forEach((h) => h.classList.toggle('is-on', h.dataset.id === id && list.querySelector(`[data-id="${id}"]`)?.classList.contains('is-open')));
  }
  list.addEventListener('click', (e) => { const h = e.target.closest('.kp-item__head'); if (h) openItem(h.closest('.kp-item').dataset.id); });
  hotWrap.addEventListener('click', (e) => { const h = e.target.closest('.kp-hot'); if (h) openItem(h.dataset.id, { scroll: true }); });
  const hover = (id) => $$('.kp-hot', hotWrap).forEach((h) => h.classList.toggle('is-hover', h.dataset.id === id));
  list.addEventListener('pointerover', (e) => hover(e.target.closest('.kp-item')?.dataset.id));
  list.addEventListener('pointerleave', () => hover(null));
  list.addEventListener('focusin', (e) => hover(e.target.closest('.kp-item')?.dataset.id));

  // a moldura da foto acompanha a proporção da imagem (hotspots ficam no lugar certo)
  const boxImg = $('.kp-box__pic img');
  const fitPic = () => boxImg.naturalWidth && boxImg.parentElement.style.setProperty('--ar', boxImg.naturalWidth / boxImg.naturalHeight);
  boxImg.addEventListener('load', fitPic); fitPic();

  // Troca de combinação: foto, 3D, lista e hotspots
  $$('.variant[data-v]').forEach((b) => b.addEventListener('click', () => {
    const j = +b.dataset.v;
    const v = variants[j];
    cur = j;
    const kit = KITS.find((k) => k.id === page.kitId);
    $('#kpShop').href = shopUrl(kit, kit?.variants[j]);
    $('.kp-price').textContent = priceText(kit, kit?.variants[j]);
    $$('.variant[data-v]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    const img = $('.kp-hero__img');
    setImageSource(img, v.img); img.alt = v.title || `${page.name}: ${v.label}`;
    if (!reduced) gsap.fromTo(img, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7, ease: EASE.enter, overwrite: true });
    show3d(v);
    setImageSource(boxImg, v.open || v.img); boxImg.alt = `Caixa aberta do ${v.title || `${page.name}: ${v.label}`}`;
    if (v.title) {
      $('#kpTitle').textContent = v.title;
      $('#kpCrumb').textContent = v.title;
      $('.kp-hero__tag').textContent = v.tag;
      // Variant UI shares the parent page's stable canonical and metadata.
    }
    $('.kp-box__photo figcaption').textContent = `${page.box.label} · ${v.label}`;
    hotWrap.innerHTML = hotspotsHTML(v);
    list.innerHTML = listHTML(v);
    const u = new URL(location.href); u.searchParams.set('v', j); history.replaceState(null, '', u);
  }));

  // Vitrine: sabonete 3D, foto do item (vela, óleos, bucha) ou ilustração, conforme o texto passa pelo centro da tela
  const stageEl = $('.kp-stage');
  const firstSoap = $('.kp-soap[data-kind="soap"]');
  // a vitrine (e as texturas dos sabonetes) só nasce quando a seção chega perto da tela
  const stage = lazyScene($('.kp-soaps'), () => {
    const s = initSoapStage($('#kpSoapGL'), { initial: firstSoap ? firstSoap.dataset.key : 'aroeira', reduced });
    // os sabonetes do kit entram um por vez, antes de a rolagem chegar neles (sem soluço ao trocar)
    $$('.kp-soap[data-kind="soap"]').forEach((a) => idleTask(() => s.preload([a.dataset.key])));
    return s;
  });
  // a cortina de entrada (0,9 s) esconde a montagem da vitrine: monta logo, antes de a rolagem chegar
  // Below-fold stages are prepared only near the viewport.
  const info = Object.fromEntries(piecesOf(soapVarieties(page)).map((p) => [p.id, p]));
  let inSection = false, onSoap = false;
  const runSoap = () => { if (!stage) return; if (reduced) stage.renderOnce(); else if (inSection && onSoap) stage.start(); else stage.stop(); };
  ScrollTrigger.create({ trigger: '.kp-soaps', start: 'top bottom', end: 'bottom top', onToggle: (s) => { inSection = s.isActive; runSoap(); } });
  const arts = $$('.kp-soap');
  let activeKey = null;
  const pick = () => {
    const line = innerHeight * 0.6;
    const a = arts.find((el) => { const r = el.getBoundingClientRect(); return r.top <= line && r.bottom > line; })
      || (arts[0].getBoundingClientRect().top > line ? arts[0] : arts[arts.length - 1]);
    const k = a.dataset.key;
    if (k === activeKey) return;
    activeKey = k;
    const p = info[k];
    const layer = p.kind === 'soap' ? 'soap' : p.model ? k : p.photo ? 'photo' : 'flat';
    if (p.model) { const cv = $(`canvas[data-layer="${k}"]`, stageEl); if (!cv._viewer) cv._viewer = initModelViewer(cv, p.model, { reduced }); }
    if (p.kind === 'soap') stage?.show(k);
    if (layer === 'flat') $('.kp-stage__flat').innerHTML = icon(p.icon);
    if (layer === 'photo') { const im = $('.kp-stage__photo'); setImageSource(im, p.photo); im.alt = p.name; }
    $$('.kp-layer', stageEl).forEach((el) => {
      const on = el.dataset.layer === layer;
      if (el.id === 'kpSoapGL') el.classList.toggle('is-off', !on); // o canvas do sabonete fica no lugar (mantém o tamanho)
      else el.hidden = !on;
    });
    onSoap = layer === 'soap'; runSoap();
    stageEl.classList.toggle('is-flat', layer === 'flat' || layer === 'photo'); // sem 'arraste para girar'
    stageEl.style.setProperty('--stage', p.color);
    $('#kpStageKicker').textContent = p.kicker;
    $('#kpSoapName').textContent = p.name;
    $('#kpSoapSci').textContent = p.line;
    arts.forEach((o) => o.classList.toggle('is-active', o === a));
    if (!reduced) gsap.fromTo(stageEl.querySelector(`[data-layer="${layer}"]`), { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: EASE.enter, overwrite: true, clearProps: 'transform,opacity' });
  };
  arts.forEach((a) => ScrollTrigger.create({ trigger: a, start: 'top 60%', end: 'bottom 60%', onToggle: pick }));
  ScrollTrigger.addEventListener('refresh', pick);
  pick();

  // Cursor
  if (finePointer && !reduced) {
    const cursor = $('.cursor'), label = $('.cursor__label');
    const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
    const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
    addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
    document.addEventListener('pointerover', (e) => {
      const big = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, summary');
      cursor.classList.toggle('is-big', !!big && !link);
      cursor.classList.toggle('is-link', !!link);
      if (big) label.textContent = big.dataset.cursor;
    });
  }

  motion();
}

/* ---------------- Movimento ---------------- */
function motion() {
  const curtain = $('.kp-curtain');
  if (reduced) { curtain.remove(); return; }

  curtain.remove(); // Main product information is visible from first paint.

  // Títulos por palavra
  $$('.reveal-title').forEach((t) => {
    const s = SplitText.create(t, { type: 'words', mask: 'words' });
    gsap.from(s.words, { yPercent: 110, duration: 1.1, ease: EASE.enter, stagger: 0.06, scrollTrigger: { trigger: t, start: 'top 85%' } });
  });

  gsap.from('.kp-intro__lead', { y: 40, opacity: 0, duration: 1.2, ease: EASE.enter, scrollTrigger: { trigger: '.kp-intro', start: 'top 80%' } });
  gsap.from('.kp-intro__more', { y: 30, opacity: 0, duration: 1, delay: 0.15, ease: EASE.enter, scrollTrigger: { trigger: '.kp-intro', start: 'top 80%' } });

  // Caixa: a foto abre como papel (clip) e os itens entram em fila; os números pulam no lugar
  gsap.from('.kp-box__frame', { clipPath: 'inset(0 50% 0 50% round 24px)', duration: 1.3, ease: EASE.inOut, scrollTrigger: { trigger: '.kp-box__grid', start: 'top 75%' } });
  gsap.from('.kp-hot', { scale: 0, opacity: 0, duration: 0.6, stagger: 0.08, delay: 0.8, ease: EASE.enter, scrollTrigger: { trigger: '.kp-box__grid', start: 'top 75%' } });
  gsap.from('.kp-item', { y: 16, opacity: 0, duration: 0.6, stagger: 0.06, ease: EASE.soft, scrollTrigger: { trigger: '#kpList', start: 'top 80%' } });

  // Sabonetes: cada bloco desliza para dentro
  $$('.kp-soap').forEach((a) => gsap.from(a.children, { y: 24, opacity: 0, duration: 0.8, stagger: 0.06, ease: EASE.soft, scrollTrigger: { trigger: a, start: 'top 80%' } }));

  // Extras e cards
  gsap.from('.kp-gift__photo img', { scale: 1.15, duration: 2, ease: EASE.enter, scrollTrigger: { trigger: '.kp-gift', start: 'top 75%' } });
  gsap.from('.kp-chips li', { y: 10, opacity: 0, duration: 0.5, stagger: 0.05, ease: EASE.soft, scrollTrigger: { trigger: '.kp-chips', start: 'top 90%' } });
  gsap.from('.kp-card', { y: 40, opacity: 0, duration: 0.9, stagger: 0.08, ease: EASE.soft, scrollTrigger: { trigger: '.kp-more__grid', start: 'top 85%' } });

  // Text Reveal (Magic UI): a frase final acende palavra por palavra com a rolagem
  gsap.to('.kp-w__ink', { opacity: 1, stagger: 0.5, ease: 'none', scrollTrigger: { trigger: '.kp-reveal', start: 'top top', end: 'bottom bottom', scrub: true } });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

if (!page && params.has('k')) location.replace('/404.html');
else if (page) {
  try { build(); } catch (err) { document.querySelector('.kp-curtain')?.remove(); throw err; }
}

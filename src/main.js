import { setImageSource } from './imageSizes.js';
import { lightMode } from './experience.js';
import './light.css';
import './heroColagem.css'; // hero "colagem" (para voltar ao antigo: ver backup-hero-antigo/)
import { initHeroColagem } from './heroColagem.js';
import { initHeroBg } from './heroBg.js';
import './navigation.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import Lenis from 'lenis';
import { renderKits, renderIngredients, findKit, KITS, shopUrl, priceText } from './kits.js';
import { sparkles, magicCard, tilt, magnetic } from './fx.js';
import { lazyScene, idleTask, warmUpScenes } from './lazy.js';
import { loadBag, saveBag } from './bag.js';
import { initHeroDecor } from './heroDecor.js';
import { initKitStage } from './kitStage.js';
import { decorateSections } from './decor.js';
import { initWhatsApp } from './whatsapp.js';

const { initUnbox, RITUAL_KITS, initSoapStage, SOAP_KEYS, initKitViewer } = await (lightMode ? import('./lightScenes.js') : import('./fullScenes.js'));

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);
// ?lento desacelera tudo para revisar a coreografia
if (new URLSearchParams(location.search).has('lento')) gsap.globalTimeline.timeScale(0.25);

// Tokens de movimento (ver MOTION.md)
const EASE = { enter: 'expo.out', soft: 'power3.out', exit: 'power3.in', inOut: 'power3.inOut', swing: 'elastic.out(1, 0.35)' };
const DUR = { micro: 0.15, exit: 0.32, enter: 0.8, hero: 1.4 };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = lightMode || matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = !lightMode && matchMedia('(hover: hover) and (pointer: fine)').matches;

if (!$('#kitTrack').querySelector('.kit')) renderKits($('#kitTrack'));
// desktop com movimento: palco 3D único + trilho (kitStage.js); celular, modo leve e reduced: lista de kits
const stageMode = !reduced && matchMedia('(min-width: 1024px)').matches;
if (!$('#ingGrid').querySelector('.ing-card')) renderIngredients($('#ingGrid'));
decorateSections();
initWhatsApp();
if (lightMode) {
  $('.monte-cta .section-sub').textContent = 'Caixa de 3, 6 ou 9 sabonetes, do jeito que você quiser, com essências, óleos e vela. A prévia mostra cada item na caixa.';
  $('.ingredients .section-sub').textContent = 'Sabonetes vegetais de 90 g. Escolha um ingrediente para conhecer os detalhes e encontrar o seu favorito.';
  $$('[data-cursor]').forEach((el) => el.removeAttribute('data-cursor'));
}

/* ---------------- Lenis + ScrollTrigger ---------------- */
let lenis = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  if (import.meta.env.DEV) window.__lenis = lenis;
}
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const target = $(id);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { offset: id === '#inicio' ? -200 : 0, duration: 1.6 });
  else target.scrollIntoView();
}));

/* ---------------- Cenas WebGL ---------------- */
const heroDecor = initHeroDecor($('.hero__decor'), { reduced, finePointer });
initHeroColagem($('.hero--colagem'), { reduced, finePointer });
if (!reduced) $('.hero')?.addEventListener('pointerenter', () => initHeroBg($('.hero__bg')), { once: true });
const choiceEl = $('#ritualChoice');
// cenas abaixo da dobra: só nascem quando a seção chega perto (lazyScene)
const unbox3d = lazyScene($('.ritual'), () => initUnbox($('#ritualStage'), {
  onChoice: (i) => {
    choiceEl.textContent = RITUAL_KITS[i].name;
    if (!reduced) gsap.fromTo(choiceEl, { yPercent: 60, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.5, ease: EASE.enter });
  },
}));

function runWhileVisible(el, scene) {
  if (!scene) return;
  if (reduced) { scene.renderOnce(); return; }
  ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? scene.start() : scene.stop()) });
}

/* ---------------- Efeitos Magic UI / 21st ---------------- */
$$('[data-sparkles]').forEach((el) => sparkles(el));
$$('.magic-card').forEach(magicCard);
$$('.kit:not(.kit--3d) .kit__visual').forEach((v) => tilt(v)); // nas caixas 3D a foto fica escondida: sem trabalho à toa no mouse
// cada caixa 3D da coleção nasce perto da tela (a trilha é horizontal no desktop: margem lateral grande)
// a foto fica até a textura da frente chegar; aí o 3D assume (sem arco vazio enquanto baixa)
const kitViewers = stageMode ? [] : $$('.kit[data-model]').map((k) => ({ el: k, viewer: lazyScene(k, () => {
  const v = initKitViewer($('.kit__gl', k), k.dataset.model, { reduced });
  if (v.available === false) return v;
  if (k.dataset.model === 'cinco-oleos') {
    v.ready.then(() => { if (v.available) k.classList.add('gl-ready'); });
    return v;
  }
  const pre = new Image();
  pre.onload = () => setTimeout(() => k.classList.add('gl-ready'), 250);
  pre.src = `/kit3d/${k.dataset.model}-front.webp`;
  return v;
}, { rootMargin: '200% 200%' }) })); // trilha horizontal no desktop: margem lateral grande
const kitStage = stageMode ? initKitStage({ section: $('#colecao'), kitsData: KITS, initKitViewer, lenis, EASE }) : null;
if (import.meta.env.DEV) window.__kitViewers = kitViewers;
// Kit do hero em 3D: a foto fica até a textura da frente chegar, depois o 3D assume
const heroKit = $('.hero__kit');
const heroKitGL = $('.hero__kit-gl', heroKit);
if (heroKitGL && !reduced) {
  let activated = false;
  const activate = () => {
  if (activated) return;
  activated = true;
  const heroViewer = initKitViewer(heroKitGL, 'feliz-natal', { reduced });
  const pre = new Image();
  pre.onload = () => { if (heroViewer.available !== false) setTimeout(() => heroKit.classList.add('is-3d'), 300); };
  if (heroViewer.available !== false) pre.src = '/kit3d/feliz-natal-front.webp';
  };
  heroKitGL.tabIndex = 0;
  heroKit.addEventListener('pointerenter', activate, { once: true });
  heroKit.addEventListener('focusin', activate, { once: true });
}
if (finePointer) $$('[data-magnetic]').forEach((el) => magnetic(el));

/* ---------------- Vídeo do topo ---------------- */
// Só no modo completo (no leve e em reduced motion fica o pôster, que é o 1º quadro); pausa fora da tela.
const heroVideo = $('video.hero__photo');
if (heroVideo?.dataset.src && !reduced) {
  heroVideo.preload = 'auto';
  heroVideo.src = heroVideo.dataset.src;
  let inView = false;
  const sync = () => (inView && !document.hidden ? heroVideo.play().catch(() => {}) : heroVideo.pause());
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync(); }).observe(heroVideo);
  document.addEventListener('visibilitychange', sync); // volta a tocar quando a aba reaparece
}

/* ---------------- Vídeos em loop das polaroides (.js-loop) ---------------- */
// Carregam perto da tela e tocam só visíveis; no leve e em reduced motion fica o pôster (1º quadro).
if (!reduced) {
  const loops = $$('video.js-loop');
  const vis = new Set();
  const sync = (v) => (vis.has(v) && !document.hidden ? v.play().catch(() => {}) : v.pause());
  const near = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.preload = 'auto'; e.target.src = e.target.dataset.src; near.unobserve(e.target);
  }), { rootMargin: '300px 0px' });
  const seen = new IntersectionObserver((es) => es.forEach((e) => { e.isIntersecting ? vis.add(e.target) : vis.delete(e.target); sync(e.target); }));
  loops.forEach((v) => { near.observe(v); seen.observe(v); });
  document.addEventListener('visibilitychange', () => loops.forEach(sync));
}

/* ---------------- Cursor ---------------- */
if (finePointer && !reduced) {
  const cursor = $('.cursor');
  const label = $('.cursor__label');
  const cx = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' });
  const cy = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' });
  addEventListener('pointermove', (e) => { cx(e.clientX); cy(e.clientY); }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const big = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button, input, textarea, select, summary');
    cursor.classList.toggle('is-big', !!big);
    cursor.classList.toggle('is-link', !big && !!link);
    if (big) label.textContent = big.dataset.cursor;
  });
}

/* ---------------- Sacola ---------------- */
const bag = { items: loadBag() }; // guardada no navegador: o kit montado em /monte.html aparece aqui
const bagEl = $('#bag'), scrim = $('#bagScrim'), bagBtn = $('#bagBtn');
function renderBag() {
  saveBag(bag.items);
  $('#bagCount').textContent = bag.items.length;
  $('#bagEmpty').hidden = bag.items.length > 0;
  $('#bagList').innerHTML = bag.items.map((it, i) => `
    <li class="bag__item"><img src="${it.img}" alt="" /><div><h3>${it.name}</h3><p>${it.variant}</p></div>
    <button type="button" data-remove="${i}">Remover</button></li>`).join('');
}
$('#bagList').addEventListener('click', (e) => {
  const b = e.target.closest('[data-remove]');
  if (!b) return;
  bag.items.splice(+b.dataset.remove, 1);
  renderBag();
});
let lastFocus = null;
function openBag() {
  lastFocus = document.activeElement;
  scrim.hidden = false;
  bagEl.removeAttribute('inert');
  bagEl.setAttribute('aria-hidden', 'false');
  bagBtn.setAttribute('aria-expanded', 'true');
  lenis?.stop();
  gsap.to(bagEl, { x: 0, duration: reduced ? 0 : 0.7, ease: EASE.enter });
  gsap.fromTo(scrim, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  gsap.fromTo('.bag__item', { x: 40, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.06, delay: 0.15, duration: 0.6, ease: EASE.soft });
  $('#bagClose').focus();
}
function closeBag() {
  gsap.to(bagEl, { xPercent: 0, x: () => bagEl.offsetWidth, duration: reduced ? 0 : 0.45, ease: EASE.exit });
  gsap.to(scrim, { opacity: 0, duration: 0.3, onComplete: () => { scrim.hidden = true; } });
  bagEl.setAttribute('inert', '');
  bagEl.setAttribute('aria-hidden', 'true');
  bagBtn.setAttribute('aria-expanded', 'false');
  lenis?.start();
  lastFocus?.focus();
}
gsap.set(bagEl, { x: () => bagEl.offsetWidth + 40 });
bagBtn.addEventListener('click', openBag);
$('#bagClose').addEventListener('click', closeBag);
scrim.addEventListener('click', closeBag);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && bagEl.getAttribute('aria-hidden') === 'false') closeBag(); });


/* ---------------- Kits: variantes e giro (o botão leva à loja Shopify) ---------------- */
$$('.kit').forEach((kitEl) => {
  const visual = $('.kit__visual', kitEl);
  const tiltEl = $('.kit__tilt', kitEl);
  const front = $('.kit__img--front', kitEl);
  const angle = $('.kit__img--angle', kitEl);
  const kit = findKit(kitEl.dataset.kit);
  let current = kit.variants[0];

  // com 3D ligado a caixa já mostra todos os lados; sem 3D, a foto troca de ângulo no hover/toque
  const is3d = () => kitEl.classList.contains('kit--3d');
  if (finePointer) {
    visual.addEventListener('pointerenter', () => { if (!is3d()) kitEl.classList.add('is-flipped'); });
    visual.addEventListener('pointerleave', () => kitEl.classList.remove('is-flipped'));
  } else {
    visual.addEventListener('click', () => { if (!is3d()) kitEl.classList.toggle('is-flipped'); });
  }

  $$('.variant', kitEl).forEach((btn) => btn.addEventListener('click', () => {
    if (btn.getAttribute('aria-checked') === 'true') return;
    $$('.variant', kitEl).forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
    current = kit.variants.find((v) => v.front === btn.dataset.front);
    $('.kit__add', kitEl).href = shopUrl(kit, current); // cada combinação leva ao seu produto na loja
    $('.kit__price', kitEl).textContent = priceText(kit, current);
    // combinação com modelo 3D liga a vitrine; as outras voltam para a foto
    const want3d = btn.dataset['3d'] === 'true';
    if (want3d) kitEl.dataset.model = btn.dataset.model; // o palco do desktop lê a caixa da combinação atual
    const kv = kitViewers.find((x) => x.el === kitEl);
    if (want3d && kv) kv.viewer.setModel(btn.dataset.model); // cada combinação pode ter a sua caixa 3D
    if (want3d !== is3d()) {
      kitEl.classList.remove('is-flipped');
      kitEl.classList.toggle('kit--3d', want3d);
      if (want3d) kv?.viewer.replayIntro();
    }
    // giro de cartão: some de lado, troca a foto, volta do outro lado (continuidade de objeto)
    const swap = () => {
      // o nome do kit e a lista de itens acompanham a opção escolhida
      if (kit.itemsFor) {
        $('.kit__info h3', kitEl).textContent = current.label;
        $('.kit__tag', kitEl).textContent = current.tag;
        const more = $('.kit__more', kitEl);
        if (more) { const u = new URL(more.href); u.searchParams.set('v', kit.variants.indexOf(current)); more.href = u.pathname + u.search; }
        $('.kit__items ul', kitEl).innerHTML = kit.itemsFor(current).map((it) => `<li>${it}</li>`).join('');
      }
      setImageSource(front, `/kits/${btn.dataset.front}.webp`);
      if (angle) setImageSource(angle, `/kits/${btn.dataset.angle}.webp`);
      front.alt = kit.itemsFor ? btn.dataset.label : `${kit.name}: ${btn.dataset.label}`;
      kitStage?.sync(kitEl);
    };
    if (reduced) { swap(); return; }
    gsap.timeline()
      .to(tiltEl, { rotationY: 90, scale: 0.92, duration: 0.28, ease: EASE.exit })
      .add(swap)
      .fromTo(tiltEl, { rotationY: -90 }, { rotationY: 0, scale: 1, duration: 0.7, ease: EASE.enter });
  }));

});

/* ---------------- Ingredientes: card escolhe o sabonete 3D ---------------- */
const soapStage = lazyScene($('.ingredients'), () => {
  const s = initSoapStage($('#soapGL'), { initial: 'aroeira', reduced });
  // os outros sabonetes entram um por vez, em momentos ociosos (todos juntos travavam a rolagem)
  SOAP_KEYS.forEach((k) => idleTask(() => s.preload([k])));
  return s;
});
const stageEl = $('.soap-stage');
function selectSoap(card) {
  $$('.ing-card').forEach((c) => c.classList.toggle('is-selected', c === card));
  stageEl.style.setProperty('--stage', getComputedStyle(card).getPropertyValue('--ing'));
  soapStage.show(card.dataset.key);
  const nameEl = $('#soapName'), lineEl = $('#soapLine');
  const swapText = () => { nameEl.textContent = card.dataset.name; lineEl.textContent = card.dataset.line; };
  if (reduced) { swapText(); return; }
  gsap.timeline()
    .to([nameEl, lineEl], { yPercent: -40, opacity: 0, filter: 'blur(6px)', duration: 0.25, ease: EASE.exit, stagger: 0.04 })
    .add(swapText)
    .fromTo([nameEl, lineEl], { yPercent: 40, opacity: 0, filter: 'blur(6px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: EASE.enter, stagger: 0.06 });
}
$$('.ing-card').forEach((c) => c.addEventListener('click', () => {
  if (!c.classList.contains('is-selected')) selectSoap(c);
  else c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true'));
}));
stageEl.style.setProperty('--stage', '#a8323e');

/* ---------------- Formulário empresas ---------------- */
// Fundo animado da seção empresas: pó de ouro subindo + pausa tudo quando a seção sai da tela
if (!reduced) {
  const corpBg = $('.corp__bg');
  const n = matchMedia('(max-width: 760px)').matches ? 14 : 26;
  const rnd = (a, b) => a + Math.random() * (b - a);
  corpBg.insertAdjacentHTML('beforeend', Array.from({ length: n }, () =>
    `<span class="corp__spark" style="--x:${rnd(0, 100).toFixed(1)}%;--s:${rnd(2, 5).toFixed(1)}px;--d:${rnd(14, 26).toFixed(1)}s;--delay:-${rnd(0, 26).toFixed(1)}s;--sway:${rnd(-40, 40).toFixed(0)}px;--o:${rnd(.35, .9).toFixed(2)}"></span>`).join(''));
}
new IntersectionObserver(([e]) => $('.corp').classList.toggle('is-offscreen', !e.isIntersecting)).observe($('.corp'));

// Prévia do cartão: muda enquanto a pessoa preenche a empresa, a mensagem e a quantidade
const corpForm = $('#corpForm');
const gc = { seal: $('#gcSeal'), msg: $('#gcMsg'), from: $('#gcFrom'), qty: $('#gcQty'), card: $('.corp__card') };
const gcDefaultMsg = gc.msg.textContent;
function updateCard(e) {
  const company = $('#cCompany').value.trim();
  const msg = $('#cMsg').value.trim() || gcDefaultMsg;
  const qty = new FormData(corpForm).get('qty');
  const changed = [];
  const set = (el, txt) => { if (el.textContent !== txt) { el.textContent = txt; changed.push(el); } };
  set(gc.from, company || 'a sua empresa');
  set(gc.seal, (company[0] || 'A').toUpperCase());
  set(gc.msg, msg);
  set(gc.qty, qty);
  // pulso curto só onde mudou (micro 150 ms); digitar não fica piscando: só o selo e a quantidade pulsam
  if (!reduced && e) changed.filter((el) => el === gc.seal || el === gc.qty)
    .forEach((el) => gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.45, ease: 'back.out(1.7)' }));
}
corpForm.addEventListener('input', updateCard);
corpForm.addEventListener('change', updateCard);

// Envio real: o Web3Forms repassa o pedido por e-mail para vendas@ (site estático, sem servidor próprio).
// A chave é pública por design: só permite enviar para o e-mail cadastrado nela.
const CORP_ENDPOINT = 'https://api.web3forms.com/submit';
const CORP_KEY = 'ac579162-e3de-4fc5-aeb9-a8519078da10';
let corpSending = false;
corpForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (corpSending) return;
  const name = $('#cName'), email = $('#cEmail');
  const errs = [];
  const setErr = (input, errEl, msg) => {
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    $(errEl).textContent = msg;
    if (msg) errs.push(input);
  };
  setErr(name, '#cNameErr', name.value.trim() ? '' : 'Conte pra gente o seu nome.');
  setErr(email, '#cEmailErr', /^\S+@\S+\.\S+$/.test(email.value) ? '' : 'Use um e-mail válido, como nome@empresa.com.br.');
  const status = $('#corpStatus');
  if (errs.length) {
    errs[0].focus();
    status.textContent = '';
    if (!reduced) gsap.fromTo(errs[0], { x: -10 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' });
    return;
  }
  const data = new FormData(corpForm);
  const qty = data.get('qty');
  if (data.get('_honey')) return; // robô de spam preencheu o campo escondido
  const btn = $('button[type="submit"]', corpForm), label = $('.btn-shimmer__label', btn);
  corpSending = true; btn.disabled = true; label.textContent = 'Enviando…';
  status.textContent = '';
  try {
    const res = await fetch(CORP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: CORP_KEY,
        subject: `Pedido Kit Presente (site) – ${$('#cCompany').value.trim() || name.value.trim()} – ${qty} presentes`,
        from_name: 'Pedido Kit Presente',
        replyto: email.value.trim(),
        Nome: name.value.trim(),
        'E-mail': email.value.trim(),
        Empresa: $('#cCompany').value.trim() || '—',
        'Mensagem do cartão': $('#cMsg').value.trim() || '—',
        Quantidade: qty,
      }),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.success) throw new Error(out.message || res.status);
  } catch (err) {
    status.innerHTML = 'Não conseguimos enviar agora. Tente de novo ou <a href="https://wa.me/5511990007047">fale com a Alquiverde pelo WhatsApp</a>.';
    return;
  } finally {
    corpSending = false; btn.disabled = false; label.textContent = 'Quero uma proposta';
  }
  const first = name.value.trim().split(' ')[0];
  $('#corpDoneTitle').textContent = `Obrigada, ${first}!`;
  $('#corpDoneText').textContent = `Pedido de proposta para ${qty.toLowerCase()} presentes enviado. A equipe responde no seu e-mail em até 1 dia útil.`;
  const fields = $('.corp__fields', corpForm), done = $('#corpDone');
  const showDone = () => {
    corpForm.style.minHeight = `${corpForm.offsetHeight}px`; // a caixa não encolhe na troca (sem pulo de layout)
    fields.hidden = true; done.hidden = false;
    $('#corpDoneTitle').focus();
  };
  gc.card.classList.add('is-sent'); // o carimbo cai no cartão
  if (reduced) { showDone(); return; }
  // saída rápida (280 ms) → o check se desenha (700 ms) → texto entra (550 ms, expo.out)
  const path = $('.corp__check path', done), ring = $('.corp__check circle', done);
  const pl = path.getTotalLength(), rl = ring.getTotalLength();
  gsap.timeline()
    .to(fields.children, { y: -16, opacity: 0, duration: 0.28, stagger: 0.03, ease: 'power3.in' })
    .add(showDone)
    .set(fields.children, { clearProps: 'all' })
    .fromTo(ring, { strokeDasharray: rl, strokeDashoffset: rl }, { strokeDashoffset: 0, duration: 0.7, ease: 'power3.inOut' })
    .fromTo(path, { strokeDasharray: pl, strokeDashoffset: pl }, { strokeDashoffset: 0, duration: 0.45, ease: 'power2.out' }, '-=0.25')
    .fromTo($$('.corp__done > p, .corp__done > button', done), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, stagger: 0.045, ease: 'expo.out' }, '-=0.2');
});
$('#corpAgain').addEventListener('click', () => {
  corpForm.reset();
  updateCard();
  gc.card.classList.remove('is-sent');
  corpForm.style.minHeight = '';
  $('#corpDone').hidden = true;
  $('.corp__fields').hidden = false;
  $('#cName').focus();
});

renderBag();

/* =====================================================================
   ANIMAÇÕES
   ===================================================================== */
function heroIntro() {
  const title = $('.hero__title');
  const split = SplitText.create(title.querySelectorAll('.line'), { type: 'chars', mask: 'lines' });
  const tl = gsap.timeline({ defaults: { ease: EASE.enter } });
  tl.from(split.chars, { yPercent: 115, rotationX: -80, transformOrigin: '50% 100% -20', opacity: 0, stagger: 0.025, duration: DUR.hero }, 0)
    .add(() => split.masks?.forEach((m) => (m.style.overflow = 'visible')), 1.5)
    .from('.hero__eyebrow', { y: 20, opacity: 0, duration: DUR.enter }, 0.1)
    .from('.hero__sub, .hero__ctas', { y: 30, opacity: 0, stagger: 0.12, duration: 1 }, 0.55)
    .from('.hero__bow path, .hero__bow ellipse', { drawSVG: 0, duration: 1 }, 0.6)
    .fromTo('.hero__arch', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' }, 0.25)
    .from('.hero__photo', { scale: 1.3, duration: 2.2 }, 0.3)
    // colagem: as polaroides caem na mesa, cada uma girando um pouco; a fita se desenha
    .from('.collage-pol', { y: -90, scale: 0.7, opacity: 0, rotation: (i) => (i % 2 ? 1 : -1) * 18, duration: 1.3, stagger: 0.1, ease: 'back.out(1.5)' }, 0.5)
    .from('.collage-ribbon path', { drawSVG: 0, duration: 1.8, ease: 'power2.inOut' }, 0.4)
    .from('.hero__kit', { y: 160, rotation: 10, opacity: 0, duration: 1.6 }, 0.9)
    .from('.hero__tag', { y: -140, rotation: -50, opacity: 0, duration: 1.8, ease: 'elastic.out(1, 0.45)' }, 1.05)
    .from('.hero__star', { scale: 0, rotation: -180, duration: 1.2, ease: 'back.out(2)' }, 1.3)
    .from('.hero__caption', { opacity: 0, y: 10, duration: 0.8 }, 1.5)
    .from('.decor-hang', { yPercent: -110, duration: 1.8, stagger: 0.14, ease: 'elastic.out(1, 0.5)' }, 0.5)
    .from('.decor-lights', { opacity: 0, y: -30, duration: 1.2 }, 0.3)
    .from('.decor-pine', { xPercent: -60, rotation: -20, opacity: 0, duration: 1.6, ease: 'expo.out' }, 0.4)
    .from('.decor-sprig, .decor-spice, .decor-holly, .decor-orange, .decor-gift', { scale: 0.4, opacity: 0, rotation: -12, duration: 1.4, stagger: 0.12, ease: 'back.out(1.6)' }, 0.8)
    .from('.decor-spark', { scale: 0, opacity: 0, duration: 0.6, stagger: 0.08 }, 1.2);
  // camada ambiente contínua
  gsap.to('.spin-star', { rotation: 360, duration: 8, repeat: -1, ease: 'none' });
  gsap.to('.hero__star', { rotation: '+=360', duration: 14, repeat: -1, ease: 'none', delay: 2.5 });
  gsap.to('.hero__tag', { rotation: -4, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 3 });
  gsap.to('.hero__bow', { y: -8, rotation: 4, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  return tl;
}

function initScroll() {
  if (lightMode) return;
  // Hero: parallax em camadas + decoração sobe
  gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } })
    .to('.hero__photo', { yPercent: 14, ease: 'none' }, 0)
    .to('.hero__kit', { yPercent: -45, rotation: -6, ease: 'none' }, 0)
    .to('.hero__tag', { yPercent: -60, ease: 'none' }, 0)
    .to('.hero__copy', { yPercent: -30, opacity: 0.2, ease: 'none' }, 0)
    .to('.collage-pol', { yPercent: (i, el) => -40 * el.dataset.depth, ease: 'none' }, 0)
    .to('.decor-item', { yPercent: (i, el) => -120 * el.dataset.depth, rotation: (i, el) => (i % 2 ? 1 : -1) * 14 * el.dataset.depth, ease: 'none' }, 0)
    .to('.decor-spark', { y: (i) => -80 - (i % 4) * 60, ease: 'none' }, 0);
  runWhileVisible('.hero', heroDecor);

  // Header: esconde ao descer, volta ao subir
  const header = $('#header');
  ScrollTrigger.create({ start: 'top -160', end: 'max', onUpdate: (s) => header.classList.toggle('is-hidden', s.direction === 1) });
  ['colecao', 'ritual', 'ingredientes', 'empresas'].forEach((id) => {
    ScrollTrigger.create({ trigger: `#${id}`, start: 'top center', end: 'bottom center', toggleClass: { targets: `.nav a[href="#${id}"]`, className: 'is-active' } });
  });

  // Marquee infinito que acelera e inclina com a velocidade da rolagem
  const mq = $('.marquee__inner');
  mq.innerHTML += mq.innerHTML;
  const loop = gsap.to(mq, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  const skew = gsap.quickTo(mq, 'skewX', { duration: 0.5, ease: 'power3.out' });
  const clampV = gsap.utils.clamp(-12, 12);
  ScrollTrigger.create({
    trigger: '.marquee', start: 'top bottom', end: 'bottom top',
    onUpdate: (s) => {
      const v = s.getVelocity();
      skew(clampV(v / -180));
      gsap.to(loop, { timeScale: (s.direction === 1 ? 1 : -1) * (1 + Math.min(Math.abs(v) / 400, 4)), duration: 0.3, overwrite: true });
    },
  });

  // Títulos revelados por palavra
  $$('.reveal-title').forEach((t) => {
    const s = SplitText.create(t, { type: 'words', mask: 'words' });
    gsap.from(s.words, { yPercent: 110, duration: 1.1, ease: EASE.enter, stagger: 0.06, scrollTrigger: { trigger: t, start: 'top 85%' } });
  });

  // Coleção
  const mm = gsap.matchMedia();
  const kits = $$('.kit');
  const collection = $('.collection');
  if (kitStage) kitStage.scroll();
  mm.add('(max-width: 1023px)', () => {
    kits.forEach((k) => {
      gsap.from($('.kit__tilt', k), { y: 80, rotationX: 25, opacity: 0, duration: 1.2, ease: EASE.enter, scrollTrigger: { trigger: k, start: 'top 80%' } });
      gsap.from($$('.kit__info > *', k), { y: 30, opacity: 0, stagger: 0.06, duration: 0.8, ease: EASE.soft, scrollTrigger: { trigger: k, start: 'top 70%' } });
      ScrollTrigger.create({ trigger: k, start: 'top center', end: 'bottom center', onToggle: (s) => s.isActive && gsap.to(collection, { backgroundColor: k.dataset.bg, duration: 0.6 }) });
    });
  });

  // Como funciona, em três atos: escolher → o que vem → comprar (a cena 3D lê o progresso)
  const words = $$('.ritual__words .word');
  const descs = $$('.ritual__panel');
  const steps = $$('.ritual__steps li');
  const ritual = $('.ritual');
  const bgLayers = $$('.ritual__bg-layer');
  let act = 0;
  gsap.set(words.slice(1), { opacity: 0, yPercent: 60, filter: 'blur(8px)' });
  gsap.set(descs.slice(1), { autoAlpha: 0, y: 14 });
  const setAct = (i) => {
    if (i === act) return;
    const dir = i > act ? 1 : -1;
    gsap.to(words[act], { opacity: 0, yPercent: -60 * dir, filter: 'blur(10px)', duration: 0.45, ease: EASE.exit, overwrite: true });
    gsap.fromTo(words[i], { opacity: 0, yPercent: 60 * dir, filter: 'blur(10px)' }, { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.8, ease: EASE.enter, overwrite: true });
    gsap.to(descs[act], { autoAlpha: 0, y: -10 * dir, duration: 0.3, ease: EASE.exit, overwrite: true });
    gsap.fromTo(descs[i], { autoAlpha: 0, y: 14 * dir }, { autoAlpha: 1, y: 0, duration: 0.7, delay: 0.1, ease: EASE.soft, overwrite: true });
    // os itens entram um a um, como coisas sendo postas na caixa
    gsap.fromTo($$('.ritual__facts li, .ritual__links', descs[i]), { opacity: 0, x: -12 }, { opacity: 1, x: 0, stagger: 0.07, duration: 0.6, delay: 0.18, ease: EASE.enter, overwrite: true });
    descs.forEach((el, j) => el.classList.toggle('is-active', j === i));
    steps.forEach((el, j) => el.classList.toggle('is-active', j === i));
    act = i;
  };
  const prox = { p: 0 };
  gsap.timeline({
    scrollTrigger: { trigger: '.ritual__pin', pin: true, start: 'top top', end: '+=340%', scrub: 1.2 },
  })
    .to(prox, { p: 1, duration: 1, ease: 'none', onUpdate: () => {
      const p = prox.p;
      unbox3d.progress = p;
      setAct(p < 0.3 ? 0 : p < 0.62 ? 1 : 2);
      ritual.classList.toggle('is-dark', p > 0.7);
      const bgAct = p < 0.3 ? 0 : p <= 0.7 ? 1 : 2; // o fundo da festa entra junto com o vinho
      if (bgAct !== ritual._bgAct) { ritual._bgAct = bgAct; bgLayers.forEach((el, j) => el.classList.toggle('is-active', j === bgAct)); }
      ritual.style.setProperty('--spot', String(gsap.utils.clamp(0, 0.9, (p - 0.68) * 6)));
    } }, 0)
    .to('.ritual__bar i', { scaleY: 1, duration: 1, ease: 'none' }, 0)
    .to(ritual, { backgroundColor: '#4f1d27', color: '#fffcf5', duration: 0.08, ease: 'none' }, 0.69)
    .to('.ritual__end', { opacity: 1, y: -10, duration: 0.08 }, 0.88);
  ScrollTrigger.create({ trigger: '.ritual', start: 'top bottom', end: 'bottom top', onToggle: (st) => (st.isActive ? unbox3d.start() : unbox3d.stop()) });

  // Vitrine 3D: roda enquanto visível e gira um pouco com a rolagem
  runWhileVisible('.ingredients', soapStage);
  ScrollTrigger.create({ trigger: '.ingredients', start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: (s) => { soapStage.scrollSpin = (s.progress - 0.45) * Math.PI * 0.7; } });

  // Ingredientes
  ScrollTrigger.batch('.ing-card', {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.from(els, { y: 80, rotationX: -18, opacity: 0, stagger: 0.08, duration: 1.1, ease: EASE.enter, transformPerspective: 900 }),
  });

  // Galeria espalhada: cada cartão sobe numa velocidade (profundidade), o traço de marca-texto se desenha
  // e, com mouse, os cartões seguem o cursor de leve (os mais "perto" mexem mais)
  if (!reduced) {
    const items = $$('.scatter__item');
    const amp = matchMedia('(max-width: 760px)').matches ? 14 : 35; // no celular sobra menos espaço em volta do título
    items.forEach((el) => {
      const d = Number(el.dataset.depth) || 1;
      gsap.fromTo(el, { yPercent: amp * d }, { yPercent: -amp * d, ease: 'none',
        scrollTrigger: { trigger: '.scatter', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });
    gsap.from('.scatter__card', { opacity: 0, y: 40, scale: 0.9, stagger: 0.07, duration: 1, ease: EASE.enter, scrollTrigger: { trigger: '.scatter', start: 'top 70%' } });
    const mark = $('.scatter__mark path');
    const len = mark.getTotalLength();
    gsap.fromTo(mark, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.2, delay: 0.3, ease: 'power2.inOut', scrollTrigger: { trigger: '.scatter__copy', start: 'top 75%' } });
    if (finePointer) {
      const stage = $('.scatter__stage');
      const movers = items.map((el) => {
        const card = $('.scatter__card', el), d = Number(el.dataset.depth) || 1;
        return { d, x: gsap.quickTo(card, 'x', { duration: 0.9, ease: 'power3.out' }), y: gsap.quickTo(card, 'y', { duration: 0.9, ease: 'power3.out' }) };
      });
      stage.addEventListener('pointermove', (e) => {
        const r = stage.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
        movers.forEach((m) => { m.x(nx * -26 * m.d); m.y(ny * -20 * m.d); });
      });
      stage.addEventListener('pointerleave', () => movers.forEach((m) => { m.x(0); m.y(0); }));
    }
  }

  // Empresas
  // Passos: a linha dourada liga os três números com a rolagem (na horizontal; no celular, na vertical)
  const corpSteps = $$('.corp__step');
  const vertical = matchMedia('(max-width: 760px)').matches;
  gsap.to('.corp__connector i', { [vertical ? 'scaleY' : 'scaleX']: 1, ease: 'none',
    scrollTrigger: { trigger: '.corp__track', start: vertical ? 'top 70%' : 'top 75%', end: vertical ? 'bottom 55%' : 'top 35%', scrub: 0.5,
      onUpdate: (st) => corpSteps.forEach((li, i) => li.classList.toggle('is-on', st.progress >= i / (corpSteps.length - 1) - 0.02)) } });
  gsap.from(corpSteps, { y: 40, opacity: 0, stagger: 0.08, duration: 0.55, ease: 'expo.out', scrollTrigger: { trigger: '.corp__track', start: 'top 82%' } });
  gsap.from('.corp__perks li', { y: 14, opacity: 0, stagger: 0.045, duration: 0.55, ease: 'expo.out', scrollTrigger: { trigger: '.corp__intro', start: 'top 85%' } });
  // Cartão: entra girando como se fosse colocado na mesa; depois inclina com o mouse
  gsap.from('.corp__card', { y: 80, rotation: -14, opacity: 0, duration: 1.1, ease: EASE.enter, scrollTrigger: { trigger: '.corp__deal', start: 'top 80%' } });
  if (finePointer) tilt($('.corp__card-wrap'), { max: 8 });
  // Formulário: o cartão sobe e os campos entram em cascata (tokens: enter 550 ms, stagger 45 ms)
  gsap.timeline({ scrollTrigger: { trigger: '.corp__form', start: 'top 85%' } })
    .from('.corp__form', { y: 60, opacity: 0, duration: 1.1, ease: EASE.enter })
    .from('.corp__fields > *', { y: 22, opacity: 0, duration: 0.55, stagger: 0.045, ease: 'expo.out' }, 0.25)
    .from('.corp__chips label', { scale: 0.85, opacity: 0, duration: 0.5, stagger: 0.045, ease: 'back.out(1.7)' }, 0.55);

  // Rodapé: frase se preenche com a rolagem
  gsap.to('.footer__big', { backgroundPosition: '0% 0', ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top 85%', end: 'bottom bottom', scrub: true } });
}

/* ---------------- Preloader ---------------- */
function preload(srcs, onProgress) {
  let done = 0;
  return Promise.all(srcs.map((src) => new Promise((res) => {
    const im = new Image();
    im.onload = im.onerror = () => { onProgress(++done / srcs.length); res(); };
    im.src = src;
  })));
}

const params = new URLSearchParams(location.search);
async function boot() {
  const loader = $('#loader');
  // só o que aparece na primeira tela (os kits da coleção são 3D e carregam perto da tela)
  const assets = ['/video/topo-presente-poster.webp', '/kits/feliz-aroeira-calendula-angulo.webp', '/logo-alquiverde.webp'];

  if (reduced || !params.has('abertura')) {
    loader.remove();
    lenis?.start();
    heroDecor.start();
    if (reduced) unbox3d.progress = 1; // sem rolagem guiada: mostra o fim
    initScroll();
    await document.fonts.ready;
    ScrollTrigger.refresh();
    if (params.has('sacola')) openBag();
    return;
  }

  // ?rapido pula o preloader (útil para revisar seções)
  if (new URLSearchParams(location.search).has('rapido')) {
    loader.remove();
    lenis?.start();
    await document.fonts.ready;
    heroIntro();
    heroDecor.start();
    initScroll();
    await document.fonts.ready;
    ScrollTrigger.refresh();
    if (params.has('sacola')) openBag();
    return;
  }

  document.body.classList.add('is-loading');
  // enquanto o laço se abre, monta as cenas mais vistas (ritual e caixas da coleção), uma por vez:
  // o "soluço" de montar cada cena fica escondido pela abertura. As texturas seguem baixando depois;
  // a abertura não espera por elas (cada caixa mostra a foto até a textura 3D chegar).
  // Keep below-fold scenes lazy even while replaying the optional opening.
  const brandImg = $('.brand img');
  gsap.set(brandImg, { opacity: 0 });
  const paths = $$('.loader__bow .draw');
  paths.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
  const pct = { v: 0 };
  const pctEl = $('.loader__pct');

  // entrada: fitas cruzam, selo aparece, logo é escrito, laço é desenhado, brilho passa
  const intro = gsap.timeline();
  intro.from('.loader__ribbon--v', { scaleY: 0, duration: 0.9, ease: EASE.inOut }, 0)
    .from('.loader__ribbon--h', { scaleX: 0, duration: 0.9, ease: EASE.inOut }, 0.1)
    .from('.loader__seal', { scale: 0, rotation: -25, duration: 1, ease: 'back.out(1.6)' }, 0.45)
    .from('.loader__ring', { rotation: -120, opacity: 0, duration: 1.6, ease: EASE.enter }, 0.6)
    .to('.loader__logo', { '--rev': '115%', duration: 1.5, ease: 'power2.inOut' }, 0.85)
    .from('.loader__logo', { y: 10, duration: 1.5, ease: EASE.soft }, 0.85)
    .to(paths, { strokeDashoffset: 0, duration: 1.1, stagger: 0.12, ease: 'power2.inOut' }, 1.5)
    .from('.loader__tagline', { opacity: 0, y: 8, duration: 0.6, ease: EASE.soft }, 1.9)
    .to('.loader__sheen', { backgroundPosition: '-30% 0', duration: 1.1, ease: 'power2.inOut' }, 2.05)
    .from('.loader__label', { opacity: 0, y: 10, duration: 0.5, ease: EASE.soft }, 0.7);
  gsap.to('.loader__ring', { rotation: '+=360', duration: 30, repeat: -1, ease: 'none' });

  const cap = new Promise((r) => setTimeout(r, 2600));
  await Promise.race([cap, Promise.all([
    preload(assets, (p) => gsap.to(pct, { v: p * 100, duration: 0.4, onUpdate: () => (pctEl.textContent = Math.round(pct.v)) })),
    document.fonts.ready,
  ])]);
  await new Promise((r) => (intro.progress() === 1 ? r() : intro.eventCallback('onComplete', r)));
  gsap.killTweensOf(pct);
  pctEl.textContent = '100';

  // saída: laço se desfaz, o logo voa até o menu (match-move), fitas soltam e o papel abre
  const logoEl = $('.loader__logo');
  const from = logoEl.getBoundingClientRect();
  const to = brandImg.getBoundingClientRect();
  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const out = gsap.timeline({ defaults: { ease: EASE.inOut } });
  out.to('.loader__label, .loader__tagline', { opacity: 0, y: 10, duration: 0.3, ease: EASE.exit })
    .to('.loader__bow', { scale: 1.2, rotation: -8, duration: 0.3, ease: 'power2.out' }, '<')
    .to('.loader__bow', { scale: 0, rotation: 50, y: -40, opacity: 0, duration: 0.45, ease: EASE.exit })
    .addLabel('fly', '-=0.1')
    .to('.loader__seal', { background: 'rgba(255,253,246,0)', boxShadow: '0 0 0 rgba(0,0,0,0), inset 0 0 0 0 rgba(0,0,0,0)', duration: 0.6, ease: 'power1.in' }, 'fly+=0.35')
    .to('.loader__ring', { scale: 1.6, opacity: 0, duration: 0.6, ease: EASE.exit }, 'fly')
    .to(logoEl, { x: dx, y: dy, scale: to.width / from.width, duration: 1.2, ease: 'expo.inOut' }, 'fly+=0.15')
    .to('.loader__ribbon--v', { yPercent: -110, duration: 0.8 }, 'fly')
    .to('.loader__ribbon--h', { xPercent: 110, duration: 0.8 }, 'fly+=0.06')
    .to('.loader__flap--tl', { xPercent: -100, yPercent: -100, rotation: -8, duration: 1.1 }, 'fly+=0.05')
    .to('.loader__flap--tr', { xPercent: 100, yPercent: -100, rotation: 8, duration: 1.1 }, '<0.04')
    .to('.loader__flap--bl', { xPercent: -100, yPercent: 100, rotation: 8, duration: 1.1 }, '<0.04')
    .to('.loader__flap--br', { xPercent: 100, yPercent: 100, rotation: -8, duration: 1.1 }, '<0.04')
    .add(() => {
      gsap.set(brandImg, { opacity: 1 });
      gsap.set(logoEl, { opacity: 0 });
      document.body.classList.remove('is-loading');
      lenis?.start();
    }, 'fly+=1.35')
    .add(heroIntro(), 'fly+=0.55')
    .add(() => loader.remove())
    .add(() => { if (params.has('sacola')) openBag(); });

  heroDecor.start();
  initScroll();
  ScrollTrigger.refresh();
}

boot();

// depois da abertura, prepara as cenas 3D restantes em segundo plano (a rolagem já as encontra prontas)
// Scenes now initialize near the viewport through IntersectionObserver.

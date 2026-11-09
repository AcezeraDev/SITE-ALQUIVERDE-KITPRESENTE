// Black Friday 2026: mesmas informações do banner da loja Shopify.
// Frete grátis e entrega no mesmo dia na Grande SP, para compras de segunda a sexta, até as 12h.
// Coreografia (tese "papel que se desembrulha", ver MOTION.md): o cartão se abre como papel, o título sobe letra a letra,
// o sublinhado dourado é desenhado, a etiqueta cai pendurada e balança com mola, a faixa de ofertas corre.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MAX_OFF, discountedKits } from './kits.js';
import { sparkles } from './fx.js';
import './bf.css';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

const CUTOFF = 12; // horas, horário de Brasília
const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

// hora atual em São Paulo, independente do fuso do visitante
const spNow = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return { wd, h: +parts.hour, m: +parts.minute, s: +parts.second };
};

// ainda dá para receber hoje? quanto falta? quando é a próxima janela?
export const bfStatus = () => {
  const { wd, h, m, s } = spNow();
  if (wd >= 1 && wd <= 5 && h < CUTOFF) {
    const left = (CUTOFF - h) * 3600 - m * 60 - s;
    const hh = Math.floor(left / 3600), mm = Math.floor((left % 3600) / 60);
    if (!hh && mm < 2) return { open: true, left, text: 'Peça agora e receba hoje' };
    const t = hh ? `${hh}h${mm ? ` ${String(mm).padStart(2, '0')}min` : ''}` : `${mm} min`;
    return { open: true, left, text: `Peça nas próximas ${t} e receba hoje` };
  }
  const next = wd >= 1 && wd <= 4 ? wd + 1 : 1; // depois do corte: próximo dia útil
  const quando = next === wd + 1 ? 'amanhã' : DAYS[next];
  return { open: false, left: 0, text: `Próxima entrega no mesmo dia: ${quando}, pedidos até 12h` };
};

const pad = (n) => String(n).padStart(2, '0');
let lastText = '';
const fillStatus = (root, animate) => {
  const st = bfStatus();
  // a frase muda no máximo uma vez por minuto (leitor de tela não fica repetindo)
  if (st.text !== lastText) {
    lastText = st.text;
    root.querySelectorAll('[data-bf-status]').forEach((el) => {
      el.textContent = st.text;
      el.closest('.bf-live')?.classList.toggle('is-open', st.open);
    });
  }
  // relógio de contagem regressiva (só enquanto vale a entrega no mesmo dia)
  root.querySelectorAll('.bf__digits').forEach((box) => {
    box.hidden = !st.open;
    if (!st.open) return;
    const v = { h: pad(Math.floor(st.left / 3600)), m: pad(Math.floor((st.left % 3600) / 60)), s: pad(st.left % 60) };
    box.querySelectorAll('[data-bf-u]').forEach((el) => {
      const nv = v[el.dataset.bfU];
      if (el.textContent === nv) return;
      el.textContent = nv;
      if (animate) { el.classList.remove('is-tick'); void el.offsetWidth; el.classList.add('is-tick'); }
    });
  });
};

// faixa de ofertas: kits com desconto, com foto, preço de/por e selo
function renderDeals(track) {
  const deals = discountedKits();
  track.innerHTML = deals.map((d) => `
    <li><a class="bf-deal" href="${d.href}">
      <img src="${d.img}" alt="" width="46" height="46" loading="lazy" decoding="async" />
      <span class="bf-deal__txt"><span class="bf-deal__name">${d.name}</span><span class="bf-deal__price"><s>${d.was}</s>${d.now}</span></span>
      <b class="bf-deal__off">−${d.off}%</b>
    </a></li>`).join('');
  return deals.length;
}

export function initBlackFriday({ reduced = false } = {}) {
  document.querySelectorAll('[data-bf-off]').forEach((el) => { el.textContent = MAX_OFF; });
  const sec = document.querySelector('.bf');
  const track = sec?.querySelector('[data-bf-deals]');
  if (track) renderDeals(track);
  fillStatus(document, false);
  setInterval(() => fillStatus(document, !reduced), 1000);
  if (!sec || reduced) return;

  const card = sec.querySelector('.bf__card');
  const title = sec.querySelector('.bf__title');
  const underline = sec.querySelector('.bf__underline path');
  const tagwrap = sec.querySelector('.bf__tagwrap');
  const tag = sec.querySelector('.bf__tag');
  const num = sec.querySelector('.bf__num [data-bf-off]');
  const ins = sec.querySelectorAll('.bf__in');
  const pill = sec.querySelector('.bf__pill');
  const rail = sec.querySelector('.bf__rail');

  sparkles(sec.querySelector('.bf__sparks'), { count: 10, colors: ['#e9d6a6', '#c9a868', '#fff3d0'] });

  // ---- entrada (uma vez, quando o cartão aparece) ----
  const split = SplitText.create(title.querySelectorAll('.bf__split'), { type: 'chars,words', aria: 'auto' });
  gsap.set(card, { clipPath: 'inset(10% 6% 10% 6% round 40px)', y: 50 });
  gsap.set(split.chars, { yPercent: 110, rotateX: -60, opacity: 0, transformOrigin: '50% 100%' });
  gsap.set(underline, { drawSVG: '0%' });
  gsap.set([pill, ...ins], { y: 24, opacity: 0 });
  gsap.set(tagwrap, { y: -260, rotation: -16, opacity: 0 });
  gsap.set(rail, { opacity: 0, x: 80 });
  const counter = { v: 0 };
  if (num) num.textContent = '0';

  const intro = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } })
    .to(card, { clipPath: 'inset(0% 0% 0% 0% round 32px)', y: 0, duration: 1.2, ease: 'power3.inOut' })
    .to(pill, { y: 0, opacity: 1, duration: 0.7, ease: 'back.out(2)' }, 0.55)
    .to(split.chars, { yPercent: 0, rotateX: 0, opacity: 1, duration: 0.9, stagger: 0.022 }, 0.65)
    .to(underline, { drawSVG: '100%', duration: 0.9, ease: 'power2.inOut' }, '>-0.35')
    .to(ins, { y: 0, opacity: 1, duration: 0.8, stagger: 0.09 }, '<-0.3')
    // a etiqueta cai pendurada e balança até parar (mola)
    .to(tagwrap, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.in' }, 0.75)
    .to(tagwrap, { rotation: 0, duration: 2.2, ease: 'elastic.out(1.1, 0.25)' }, '>-0.05')
    .to(counter, { v: MAX_OFF, duration: 1.6, ease: 'expo.out', onUpdate: () => { if (num) num.textContent = Math.round(counter.v); } }, '<0.1')
    .to(rail, { opacity: 1, x: 0, duration: 1 }, '<0.2')
    .add(() => idle(), '-=0.6');

  ScrollTrigger.create({ trigger: sec, start: 'top 75%', once: true, onEnter: () => intro.play() });

  // ---- depois de pousar: a etiqueta respira de leve ----
  let sway;
  const idle = () => { sway = gsap.to(tagwrap, { rotation: 2.4, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }); };

  // ---- parallax com a rolagem (aurora mais devagar, etiqueta mais rápida) ----
  gsap.to(sec.querySelector('.bf__aurora'), { yPercent: 12, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
  gsap.fromTo(tag, { y: 30 }, { y: -30, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });

  // ---- faixa de ofertas em loop; desacelera com o mouse em cima e para com o foco do teclado ----
  if (track && track.children.length) {
    const copy = track.innerHTML;
    track.insertAdjacentHTML('beforeend', copy); // segunda volta, só visual
    [...track.children].slice(track.children.length / 2).forEach((li) => { li.setAttribute('aria-hidden', 'true'); li.querySelector('a').tabIndex = -1; });
    const loop = gsap.to(track, { xPercent: -50, duration: track.children.length * 2.6, ease: 'none', repeat: -1 });
    const speed = (s) => gsap.to(loop, { timeScale: s, duration: 0.6, ease: 'power2.out', overwrite: true });
    rail.addEventListener('pointerenter', () => speed(0.15));
    rail.addEventListener('pointerleave', () => speed(1));
    rail.addEventListener('focusin', () => speed(0));
    rail.addEventListener('focusout', () => speed(1));
    ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: (s) => (s.isActive ? loop.resume() : loop.pause()) });
  }

  // ---- ponteiro: luz no cartão e etiqueta que se inclina na direção do mouse ----
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const qx = gsap.quickTo(card, '--mx', { duration: 0.6, ease: 'power3.out' });
    const qy = gsap.quickTo(card, '--my', { duration: 0.6, ease: 'power3.out' });
    const ry = gsap.quickTo(tag, 'rotationY', { duration: 0.8, ease: 'power3.out' });
    const rx = gsap.quickTo(tag, 'rotationX', { duration: 0.8, ease: 'power3.out' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
      qx(nx * 100); qy(ny * 100);
      ry((nx - 0.5) * 18); rx((0.5 - ny) * 10);
    });
    card.addEventListener('pointerleave', () => { ry(0); rx(0); });
    // tocar a etiqueta: ela balança de novo
    tag.addEventListener('pointerenter', () => {
      if (intro.progress() < 1) return;
      sway?.pause();
      gsap.fromTo(tagwrap, { rotation: -7 }, { rotation: 0, duration: 1.8, ease: 'elastic.out(1.2, 0.22)', overwrite: true, onComplete: () => sway?.restart() });
    });
  }
}

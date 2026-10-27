// Cena "Como funciona" sem WebGL: fotos reais dos kits num palco de CSS/SVG, guiadas pela rolagem (p: 0 → 1).
//  I.  Escolha     — três kits em leque se revezam na frente (com mola: back.out)
//  II. Por dentro  — o escolhido vai ao centro e os itens da caixa aparecem como etiquetas
//  III. Presenteie — ele sobe, o laço dourado se desenha e o brilho estoura
// Mesma interface da cena 3D antiga (progress, start, stop, renderOnce), mas só transform/opacity:
// nenhum contexto WebGL, nenhuma textura extra (as fotos já são as da coleção).
import { gsap } from 'gsap';
import { setImageSource } from './imageSizes.js';

export const RITUAL_KITS = [
  { name: 'Raio de Sol', photo: '/kits/raio-de-sol-frente.webp' },
  { name: 'Presente Variado', photo: '/kits/presente-variado-frente.webp' },
  { name: 'Kit Clássico', photo: '/kits/feliz-aroeira-calendula-frente.webp' },
];
const TAGS = ['Sabonetes vegetais 90 g', 'Essências e vela', 'Bucha vegetal', 'Caixa com visor'];

// posições do leque: frente, esquerda, direita
const SLOT = [
  { xPercent: 0, yPercent: 0, rotation: -2, scale: 1, opacity: 1 },
  { xPercent: -38, yPercent: 5, rotation: -11, scale: 0.8, opacity: 0.92 },
  { xPercent: 38, yPercent: 5, rotation: 10, scale: 0.8, opacity: 0.92 },
];
const Z = [3, 2, 1];
// quem está em cada lugar a cada troca (índices de RITUAL_KITS)
const ORDER = [[0, 2, 1], [1, 0, 2], [2, 1, 0]];
const SWAP = [0.07, 0.17]; // inícios das trocas no ato I
const choiceAt = (p) => (p < SWAP[0] + 0.05 ? 0 : p < SWAP[1] + 0.05 ? 1 : 2);

export function initRitualStage(el, { onChoice } = {}) {
  el.classList.add('rstage');
  el.innerHTML = `
    <div class="rstage__halo"></div>
    <svg class="rstage__orbit" viewBox="0 0 400 400"><ellipse cx="200" cy="200" rx="188" ry="150" /><ellipse class="rstage__orbit-b" cx="200" cy="200" rx="150" ry="188" /></svg>
    <span class="rstage__ball rstage__ball--1"></span><span class="rstage__ball rstage__ball--2"></span><span class="rstage__ball rstage__ball--3"></span><span class="rstage__ball rstage__ball--4"></span>
    <div class="rstage__plinth"></div>
    <div class="rstage__deck">
      ${RITUAL_KITS.map((k) => `<figure class="rstage__card"><img alt="" decoding="async" /></figure>`).join('')}
      <svg class="rstage__bow" viewBox="0 0 160 90"><path d="M80 52C58 20 18 16 16 40s38 22 64 12M80 52c22-32 62-36 64-12s-38 22-64 12M80 52 62 86M80 52l18 34" /><circle cx="80" cy="52" r="6" /></svg>
    </div>
    <ul class="rstage__tags">${TAGS.map((t) => `<li>${t}</li>`).join('')}</ul>
    <div class="rstage__sparks">${Array.from({ length: 14 }, (_, i) => `<i style="--a:${(i / 14) * 360}deg;--d:${0.6 + (i % 4) * 0.18}"></i>`).join('')}</div>`;

  const q = (s) => [...el.querySelectorAll(s)];
  const cards = q('.rstage__card');
  cards.forEach((c, i) => setImageSource(c.querySelector('img'), RITUAL_KITS[i].photo));
  const tags = q('.rstage__tags li');
  const bowPaths = q('.rstage__bow path, .rstage__bow circle');
  bowPaths.forEach((p) => { const L = p.getTotalLength?.() || 300; gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.to({}, { duration: 1 }, 0); // a linha do tempo vale exatamente 0 → 1
  ORDER[0].forEach((card, slot) => gsap.set(cards[card], { ...SLOT[slot], zIndex: Z[slot] }));
  // I. trocas do leque: a carta de trás pula para a frente com sobra de mola
  SWAP.forEach((t, k) => ORDER[k + 1].forEach((card, slot) => {
    tl.to(cards[card], { ...SLOT[slot], duration: 0.08, ease: 'back.out(1.7)' }, t);
    tl.set(cards[card], { zIndex: Z[slot] }, t + 0.03);
  }));
  // II. o escolhido (Kit Clássico) fica sozinho no centro; os itens entram um a um
  const [chosen, ...others] = ORDER[2].map((i) => cards[i]);
  tl.to(others[0], { xPercent: -70, yPercent: 10, rotation: -18, scale: 0.6, opacity: 0, duration: 0.1, ease: 'power2.in' }, 0.32)
    .to(others[1], { xPercent: 70, yPercent: 10, rotation: 16, scale: 0.6, opacity: 0, duration: 0.1, ease: 'power2.in' }, 0.32)
    .to(chosen, { rotation: 0, scale: 1.08, duration: 0.12, ease: 'back.out(1.5)' }, 0.34)
    .fromTo(tags, { opacity: 0, scale: 0.4, y: 18 }, { opacity: 1, scale: 1, y: 0, stagger: 0.035, duration: 0.07, ease: 'back.out(2)' }, 0.38)
  // III. os itens saem, o kit sobe, o laço se desenha e a órbita acende
    .to(tags, { opacity: 0, y: -16, scale: 0.9, stagger: 0.015, duration: 0.05, ease: 'power2.in' }, 0.62)
    .to(chosen, { yPercent: -8, scale: 1.16, duration: 0.14, ease: 'back.out(1.4)' }, 0.68)
    .to(bowPaths, { strokeDashoffset: 0, duration: 0.12, stagger: 0.02, ease: 'power2.out' }, 0.72)
    .to(q('.rstage__orbit, .rstage__halo'), { scale: 1.08, opacity: 1, duration: 0.14, ease: 'power2.out' }, 0.7);

  let choice = 0;
  let p = 0;
  const apply = () => {
    tl.progress(p);
    el.classList.toggle('is-party', p > 0.74); // brilho em CSS: só roda quando chega no ato III
    const c = choiceAt(p);
    if (c !== choice) { choice = c; onChoice?.(c); }
  };
  return {
    available: true,
    get progress() { return p; },
    set progress(v) { p = Math.min(1, Math.max(0, v)); apply(); },
    // os enfeites em loop (CSS) param fora da tela
    start() { el.classList.remove('is-paused'); },
    stop() { el.classList.add('is-paused'); },
    renderOnce() { apply(); },
  };
}

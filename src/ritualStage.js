// Cena "Como funciona" sem WebGL: fotos reais dos kits num palco de CSS/SVG, guiadas pela rolagem (p: 0 → 1).
//  I.  Escolha     — três kits em leque se revezam: o de trás encolhe (antecipação), sobe em arco e pousa na frente
//  II. Por dentro  — a caixa "respira" e os itens saem de dentro dela até as etiquetas, ligadas por fios dourados
//  III. Presenteie — os itens voltam para a caixa, a fita passa, o laço se desenha e dá um pulo, um brilho
//                    atravessa e o kit sobe com a poeira dourada
// Três camadas de movimento: principal (kits), secundária (sombra, fios, fita) e ambiente (órbita, bolas,
// respiração e paralaxe do mouse). Personalidade: premium com um toque lúdico (sobra de mola pequena, 3–10%).
// Mesma interface da cena 3D antiga (progress, start, stop, renderOnce); só transform/opacity, sem WebGL.
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
  { xPercent: -38, yPercent: 5, rotation: -11, scale: 0.8, opacity: 0.9 },
  { xPercent: 38, yPercent: 5, rotation: 10, scale: 0.8, opacity: 0.9 },
];
const Z = [3, 2, 1];
// quem está em cada lugar a cada troca (índices de RITUAL_KITS)
const ORDER = [[0, 2, 1], [1, 0, 2], [2, 1, 0]];
const SWAP = [0.06, 0.16]; // inícios das trocas no ato I (cada troca dura 0.09)
const choiceAt = (p) => (p < SWAP[0] + 0.045 ? 0 : p < SWAP[1] + 0.045 ? 1 : 2);
const EASE = { land: 'back.out(1.35)', move: 'power3.inOut', out: 'power3.out', in: 'power2.in', pop: 'back.out(2.2)' };

export function initRitualStage(el, { onChoice } = {}) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  el.classList.add('rstage');
  el.innerHTML = `
    <div class="rstage__halo"></div>
    <svg class="rstage__orbit" viewBox="0 0 400 400"><ellipse class="rstage__orbit-a" cx="200" cy="200" rx="188" ry="150" pathLength="1" /><ellipse class="rstage__orbit-b" cx="200" cy="200" rx="150" ry="188" /></svg>
    <div class="rstage__amb"><span class="rstage__ball rstage__ball--1"></span><span class="rstage__ball rstage__ball--2"></span><span class="rstage__ball rstage__ball--3"></span><span class="rstage__ball rstage__ball--4"></span></div>
    <div class="rstage__plinth"></div>
    <div class="rstage__shadow"></div>
    <div class="rstage__float">
      <div class="rstage__deck">
        ${RITUAL_KITS.map(() => '<figure class="rstage__card"><img alt="" decoding="async" /></figure>').join('')}
      </div>
    </div>
    <svg class="rstage__leaders" viewBox="0 0 100 100" preserveAspectRatio="none">${TAGS.map(() => '<line pathLength="1" />').join('')}</svg>
    <ul class="rstage__tags">${TAGS.map((t) => `<li>${t}</li>`).join('')}</ul>
    <div class="rstage__sparks">${Array.from({ length: 16 }, (_, i) => `<i style="--a:${(i / 16) * 360}deg;--d:${0.6 + (i % 4) * 0.18}"></i>`).join('')}</div>`;

  const q = (s) => [...el.querySelectorAll(s)];
  const $1 = (s) => el.querySelector(s);
  const cards = q('.rstage__card');
  cards.forEach((c, i) => setImageSource(c.querySelector('img'), RITUAL_KITS[i].photo));
  // fita, brilho e laço moram dentro do kit escolhido: acompanham a escala e o "respiro" dele
  cards[ORDER[2][0]].insertAdjacentHTML('beforeend', `
    <div class="rstage__wrap">
      <i class="rstage__ribbon rstage__ribbon--v"></i><i class="rstage__ribbon rstage__ribbon--h"></i>
      <span class="rstage__sheen"><i class="rstage__glint"></i></span>
      <svg class="rstage__bow" viewBox="0 0 160 90"><path d="M80 52C58 20 18 16 16 40s38 22 64 12M80 52c22-32 62-36 64-12s-38 22-64 12M80 52 62 86M80 52l18 34" /><circle cx="80" cy="52" r="6" /></svg>
    </div>`);
  const tags = q('.rstage__tags li');
  const leaders = q('.rstage__leaders line');
  const wrap = $1('.rstage__wrap');
  const bow = $1('.rstage__bow');
  const bowPaths = q('.rstage__bow path, .rstage__bow circle');
  const shadow = $1('.rstage__shadow');
  bowPaths.forEach((p) => { const L = p.getTotalLength?.() || 300; gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
  gsap.set([...leaders, $1('.rstage__orbit-a')], { strokeDasharray: 1, strokeDashoffset: 1 });

  // geometria que depende do tamanho: a caixa dentro da foto (object-fit: contain) e o centro de onde os itens saem
  const geo = { tags: [] };
  const chosenImg = cards[ORDER[2][0]].querySelector('img');
  const deckEl = $1('.rstage__deck');
  const measure = () => {
    const W = el.offsetWidth, H = el.offsetHeight;
    if (!W) return;
    // a fita e o laço abraçam a caixa de verdade, não o quadro da foto (object-fit: contain, encostada embaixo)
    const dw = deckEl.offsetWidth, dh = deckEl.offsetHeight;
    const r = chosenImg.naturalWidth ? chosenImg.naturalWidth / chosenImg.naturalHeight : 1.3;
    const w = Math.min(dw, dh * r);
    const h = w / r;
    wrap.style.cssText = `left:${(dw - w) / 2}px;top:${dh - h}px;width:${w}px;height:${h}px`;
    geo.cx = deckEl.offsetLeft; // o deck é centrado com translate -50%
    geo.cy = deckEl.offsetTop + dh - h * 0.55;
    geo.tags = tags.map((t) => ({ x: t.offsetLeft + t.offsetWidth / 2, y: t.offsetTop + t.offsetHeight / 2 }));
    // distância de cada etiqueta até a caixa: a linha do tempo só anima o fator --k (0 = dentro da caixa, 1 = no lugar)
    tags.forEach((t, i) => { t.style.setProperty('--bx', `${geo.cx - geo.tags[i].x}px`); t.style.setProperty('--by', `${geo.cy - geo.tags[i].y}px`); });
    leaders.forEach((l, i) => {
      const t = geo.tags[i];
      l.setAttribute('x1', (geo.cx / W) * 100); l.setAttribute('y1', (geo.cy / H) * 100);
      l.setAttribute('x2', (t.x / W) * 100); l.setAttribute('y2', (t.y / H) * 100);
    });
  };
  measure();

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.to({}, { duration: 1 }, 0); // a linha do tempo vale exatamente 0 → 1
  ORDER[0].forEach((card, slot) => gsap.set(cards[card], { ...SLOT[slot], zIndex: Z[slot] }));

  // ambiente: a órbita se desenha logo na entrada
  tl.to($1('.rstage__orbit-a'), { strokeDashoffset: 0, duration: 0.12, ease: EASE.out }, 0);

  // I. trocas do leque
  SWAP.forEach((t, k) => ORDER[k + 1].forEach((card, slot) => {
    const c = cards[card];
    if (slot === 0) {
      // antecipação → arco por cima → pouso com sobra pequena
      const from = SLOT[ORDER[k].indexOf(card)];
      tl.to(c, { keyframes: [
        { scale: from.scale * 0.92, yPercent: from.yPercent + 4, duration: 0.02, ease: EASE.in },
        { xPercent: from.xPercent * 0.45, yPercent: -16, rotation: from.rotation * 0.4, scale: 0.94, opacity: 1, duration: 0.03, ease: 'power2.out' },
        { ...SLOT[0], duration: 0.04, ease: EASE.land },
      ] }, t);
      tl.set(c, { zIndex: Z[0] }, t + 0.03);
    } else {
      tl.to(c, { ...SLOT[slot], duration: 0.07, ease: EASE.move }, t + 0.015);
      tl.set(c, { zIndex: Z[slot] }, t + 0.03);
    }
  }));
  // secundária: a sombra encolhe enquanto o kit está no ar
  SWAP.forEach((t) => tl.to(shadow, { keyframes: [
    { scaleX: 0.72, opacity: 0.45, duration: 0.035, ease: 'power2.out' },
    { scaleX: 1, opacity: 1, duration: 0.04, ease: EASE.land },
  ] }, t + 0.02));

  // II. o escolhido fica sozinho; os outros saem para trás (staging), a caixa respira e solta os itens
  const [chosen, ...others] = ORDER[2].map((i) => cards[i]);
  tl.to(others, { xPercent: (i) => (i ? 46 : -46), yPercent: 18, rotation: (i) => (i ? 14 : -14), scale: 0.55, opacity: 0, duration: 0.09, ease: EASE.in, stagger: 0.012 }, 0.3)
    .to(chosen, { rotation: 0, scale: 1.08, duration: 0.1, ease: EASE.land }, 0.32)
    .to(chosen, { keyframes: [
      { scaleX: 1.12, scaleY: 1.03, duration: 0.02, ease: 'power2.out' },
      { scaleX: 1.08, scaleY: 1.08, duration: 0.03, ease: EASE.land },
    ] }, 0.4)
    .fromTo(tags, { '--k': 0 }, { '--k': 1, duration: 0.08, stagger: 0.03, ease: EASE.pop }, 0.41)
    .to(leaders, { strokeDashoffset: 0, duration: 0.06, stagger: 0.03, ease: EASE.out }, 0.45)
  // III. os itens voltam para a caixa, a fita passa, o laço se desenha e pula, o brilho atravessa e o kit sobe
    .to(leaders, { strokeDashoffset: -1, duration: 0.04, stagger: 0.01, ease: EASE.in }, 0.6)
    .to(tags, { '--k': 0, duration: 0.06, stagger: 0.015, ease: EASE.in }, 0.61)
    .to(chosen, { keyframes: [
      { scaleX: 1.04, scaleY: 1.1, duration: 0.02, ease: 'power2.out' },
      { scaleX: 1.08, scaleY: 1.08, duration: 0.03, ease: EASE.land },
    ] }, 0.665)
    .fromTo('.rstage__ribbon--v', { scaleY: 0 }, { scaleY: 1, duration: 0.05, ease: EASE.out }, 0.68)
    .fromTo('.rstage__ribbon--h', { scaleX: 0 }, { scaleX: 1, duration: 0.05, ease: EASE.out }, 0.71)
    .fromTo(bow, { scale: 0.4, yPercent: 20 }, { scale: 1, yPercent: 0, duration: 0.07, ease: EASE.pop }, 0.745)
    .to(bowPaths, { strokeDashoffset: 0, duration: 0.08, stagger: 0.012, ease: EASE.out }, 0.745)
    .fromTo('.rstage__glint', { xPercent: -160 }, { xPercent: 260, duration: 0.08, ease: 'power2.inOut' }, 0.83)
    .to('.rstage__deck', { yPercent: -7, scale: 1.07, duration: 0.12, ease: EASE.land }, 0.8)
    .to(shadow, { scaleX: 0.7, opacity: 0.5, duration: 0.12, ease: EASE.out }, 0.8)
    .to('.rstage__halo', { scale: 1.1, opacity: 1, duration: 0.14, ease: EASE.out }, 0.78)
    .to('.rstage__orbit', { opacity: 1, duration: 0.14, ease: EASE.out }, 0.78);

  let choice = 0;
  let p = 0;
  const apply = () => {
    tl.progress(p);
    el.classList.toggle('is-party', p > 0.84); // a poeira dourada (CSS) só roda depois do laço
    const c = choiceAt(p);
    if (c !== choice) { choice = c; onChoice?.(c); }
  };
  const refresh = () => { measure(); apply(); }; // só geometria em CSS: a linha do tempo não precisa ser refeita
  if (!chosenImg.complete) chosenImg.addEventListener('load', refresh, { once: true });
  let rz;
  addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(refresh, 150); });

  // ambiente: paralaxe do mouse em três profundidades (as bolas vão no sentido contrário)
  let parallax = false;
  if (finePointer && !reduced) {
    const host = el.closest('section') || el;
    const layers = [
      [$1('.rstage__float'), 14, 8], [$1('.rstage__amb'), -22, -12], [$1('.rstage__halo'), 6, 4], [$1('.rstage__orbit'), -8, -5],
    ].map(([node, ax, ay]) => ({ x: gsap.quickTo(node, 'x', { duration: 0.9, ease: 'power3.out' }), y: gsap.quickTo(node, 'y', { duration: 0.9, ease: 'power3.out' }), ax, ay }));
    host.addEventListener('pointermove', (e) => {
      if (!parallax) return;
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      layers.forEach((l) => { l.x(nx * l.ax); l.y(ny * l.ay); });
    });
  }

  return {
    available: true,
    get progress() { return p; },
    set progress(v) { p = Math.min(1, Math.max(0, v)); apply(); },
    // os enfeites em loop (CSS) e a paralaxe param fora da tela
    start() { el.classList.remove('is-paused'); parallax = true; },
    stop() { el.classList.add('is-paused'); parallax = false; },
    renderOnce() { apply(); },
  };
}

// Efeitos portados do Magic UI (sparkles-text, magic-card) e do 21st (3d-tilt-card) para JS puro + GSAP.
import { gsap } from 'gsap';

const STAR = 'M9.825.844a.72.72 0 0 1 1.35 0l.687 1.876c.539 1.472.53 3.672 1.638 4.78s3.308 1.099 4.78 1.638l1.876.687a.72.72 0 0 1 0 1.35l-1.876.688c-1.472.538-3.672.53-4.78 1.637s-1.099 3.308-1.638 4.78l-.687 1.877a.72.72 0 0 1-1.35 0l-.687-1.876c-.539-1.473-.53-3.673-1.638-4.78-1.108-1.109-3.308-1.1-4.78-1.638l-1.876-.688a.72.72 0 0 1 0-1.35l1.876-.687c1.472-.539 3.672-.53 4.78-1.638S8.6 4.192 9.138 2.72z';

/** Sparkles Text (Magic UI): estrelas que nascem, giram e somem em posições aleatórias. */
export function sparkles(el, { count = 9, colors = ['#b39360', '#d8a24a', '#752f3b'] } = {}) {
  if (document.documentElement.classList.contains('is-light')) return;
  const rnd = gsap.utils.random;
  for (let i = 0; i < count; i++) {
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 21 21');
    s.setAttribute('aria-hidden', 'true');
    s.classList.add('sparkle');
    s.innerHTML = `<path d="${STAR}" fill="${colors[i % colors.length]}"/>`;
    el.appendChild(s);
    const place = () => gsap.set(s, { left: `${rnd(-4, 100)}%`, top: `${rnd(-20, 90)}%`, scale: 0, rotation: 75 });
    place();
    const peak = rnd(0.35, 1.15);
    gsap.timeline({ repeat: -1, delay: rnd(0, 2.4), repeatDelay: rnd(0.2, 1.4), onRepeat: place })
      .to(s, { scale: peak, opacity: 1, rotation: 120, duration: 0.4, ease: 'power2.out' })
      .to(s, { scale: 0, opacity: 0, rotation: 150, duration: 0.4, ease: 'power2.in' });
  }
}

/** Magic Card (Magic UI): holofote dourado que acompanha o ponteiro e acende a borda. */
export function magicCard(el) {
  if (document.documentElement.classList.contains('is-light')) return;
  // proxy numérico suavizado pelo GSAP, escrito em variáveis CSS (equivale ao useSpring do original)
  const proxy = { x: -300, y: -300 };
  const apply = () => { el.style.setProperty('--mx', `${proxy.x}px`); el.style.setProperty('--my', `${proxy.y}px`); };
  el.addEventListener('pointermove', (e) => {
    const r = el.getBoundingClientRect();
    gsap.to(proxy, { x: e.clientX - r.left, y: e.clientY - r.top, duration: 0.3, ease: 'power3.out', overwrite: true, onUpdate: apply });
  });
  el.addEventListener('pointerleave', () => gsap.to(proxy, { x: -300, y: -300, duration: 0.6, ease: 'power2.in', overwrite: true, onUpdate: apply }));
}

/** 3D Tilt (21st.dev · avanishverma4/3d-tilt-card) refeito com quickTo: inclina, sombra oposta e brilho. */
export function tilt(visual, { max = 12 } = {}) {
  if (document.documentElement.classList.contains('is-light')) return;
  const card = visual.querySelector('.kit__tilt');
  const shadow = visual.querySelector('.kit__shadow');
  const glare = visual.querySelector('.kit__glare');
  gsap.set(card, { transformPerspective: 1100 });
  const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
  const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
  const sx = gsap.quickTo(shadow, 'x', { duration: 0.6, ease: 'power3.out' });
  const ss = gsap.quickTo(shadow, 'scaleX', { duration: 0.6, ease: 'power3.out' });
  visual.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = visual.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    ry(nx * max * 2);
    rx(-ny * max * 1.4);
    sx(-nx * 40);
    ss(1 + Math.abs(nx) * 0.25);
    glare.style.setProperty('--gx', `${(nx + 0.5) * 100}%`);
    glare.style.setProperty('--gy', `${(ny + 0.5) * 100}%`);
  });
  visual.addEventListener('pointerleave', () => { rx(0); ry(0); sx(0); ss(1); });
}

/** Botões e links magnéticos. */
export function magnetic(el, strength = 0.28) {
  if (document.documentElement.classList.contains('is-light')) return;
  const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
  const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = el.getBoundingClientRect();
    x((e.clientX - (r.left + r.width / 2)) * strength);
    y((e.clientY - (r.top + r.height / 2)) * strength);
  });
  el.addEventListener('pointerleave', () => {
    gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)', overwrite: true });
  });
}

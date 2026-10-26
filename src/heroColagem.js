// Hero "colagem": as peças com data-depth se mexem em profundidade com o mouse (as mais "próximas" andam mais).
import { gsap } from 'gsap';

export function initHeroColagem(hero, { reduced = false, finePointer = false } = {}) {
  if (!hero || reduced || !finePointer) return;
  const items = [...hero.querySelectorAll('.collage-item[data-depth]')];
  const movers = items.map((el) => {
    const q = (prop) => gsap.quickTo(el, prop, { duration: 1.2, ease: 'power3.out' });
    return { x: q('x'), y: q('y'), r: q('rotation'), k: +el.dataset.depth };
  });
  hero.addEventListener('pointermove', (e) => {
    const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
    movers.forEach((m) => { m.x(nx * m.k * 46); m.y(ny * m.k * 32); m.r(nx * m.k * 3); });
  });
  hero.addEventListener('pointerleave', () => movers.forEach((m) => { m.x(0); m.y(0); m.r(0); }));
}

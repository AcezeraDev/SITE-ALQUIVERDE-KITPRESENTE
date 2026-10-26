// Decoração do hero em SVG + CSS (substitui a cena 3D): bolas penduradas, eucalipto, especiarias,
// azevinho, brilhos e poeira dourada. As animações contínuas são CSS; aqui só a paralaxe do mouse
// e a pausa quando o hero sai da tela.
import { gsap } from 'gsap';

export function initHeroDecor(root, { reduced = false, finePointer = false } = {}) {
  const items = [...root.querySelectorAll('[data-depth]')];

  // poeira dourada: poucos pontos, cada um com tempo e posição próprios
  const dust = root.querySelector('.decor-dust');
  if (dust && !reduced) {
    dust.innerHTML = Array.from({ length: 26 }, (_, i) => {
      const x = (i * 61 + 7) % 100, d = 11 + (i * 7) % 9, delay = -((i * 3.7) % d), s = 2 + (i % 3);
      return `<i style="--x:${x}%;--d:${d}s;--delay:${delay}s;--s:${s}px"></i>`;
    }).join('');
  }

  // luzinhas distribuídas ao longo do fio (coordenadas do viewBox → % do bloco)
  const lights = root.querySelector('.decor-lights');
  const wire = lights?.querySelector('.decor-lights__wire');
  if (wire) {
    const len = wire.getTotalLength(), n = 22, colors = ['#f0c56a', '#e8775f', '#fff1c9', '#9fc48f'];
    lights.insertAdjacentHTML('beforeend', Array.from({ length: n }, (_, i) => {
      const p = wire.getPointAtLength(((i + 0.5) / n) * len);
      return `<i style="--x:${(p.x / 14.4).toFixed(2)}%;--y:${(p.y / 1.4).toFixed(2)}%;--c:${colors[i % 4]};--r:${(i % 2 ? 8 : -8)}deg;--t:${-((i * 0.37) % 2.6).toFixed(2)}s"></i>`;
    }).join(''));
  }

  if (finePointer && !reduced) {
    const q = (el, prop) => gsap.quickTo(el, prop, { duration: 1.1, ease: 'power3.out' });
    const movers = items.map((el) => ({ x: q(el, 'x'), y: q(el, 'y'), r: q(el, 'rotation'), k: +el.dataset.depth }));
    root.closest('.hero').addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      movers.forEach((m) => { m.x(nx * m.k * -110); m.y(ny * m.k * -70); m.r(nx * m.k * 6); });
    });
  }

  // mesma interface que as cenas (intro, start/stop, setScroll, renderOnce)
  return {
    available: true, intro: 1,
    start() { root.classList.remove('is-paused'); },
    stop() { root.classList.add('is-paused'); },
    setScroll() {}, renderOnce() {},
  };
}

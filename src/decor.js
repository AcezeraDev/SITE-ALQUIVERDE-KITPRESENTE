// Decoração natalina das seções (os mesmos desenhos do hero): bolas penduradas, azevinho, eucalipto,
// pinheiro, especiarias, laranja, presentinho e estrelinhas. Cada seção recebe uma camada absoluta com
// itens nas bordas, atrás do conteúdo. Animações contínuas em CSS; pausam fora da tela.
// No celular ficam só as bolas e as estrelinhas; modo leve e reduced motion: decoração parada.
import { DEFS, ART } from './decorArt.js';
import './decor.css';

const SPARK = '<svg viewBox="0 0 24 24"><use href="#dSpark"/></svg>';
const W = { hang1: 'clamp(54px, 5.4vw, 96px)', hang2: 'clamp(40px, 4vw, 70px)', hang3: 'clamp(32px, 3vw, 54px)' };

// [desenho, { posição (left/right/top/bottom), w, rot, flip, t }]; `spark` é a estrelinha
const s = (left, top, w, t) => ['spark', { left, top, w, t }];
const PRESETS = {
  '.monte-cta': [
    ['hang1', { left: '7%', top: '0' }], ['hang3', { left: '14%', top: '-30px', t: -1.6 }], ['hang2', { right: '9%', top: '-20px', t: -2.4 }],
    ['holly', { left: '3%', bottom: '10%', w: 'clamp(80px, 8vw, 130px)', rot: -12 }],
    ['gift', { right: '6%', bottom: '12%', w: 'clamp(64px, 5.6vw, 100px)', rot: 8 }],
    s('22%', '28%', '16px', -0.4), s('78%', '60%', '12px', -1.8), s('30%', '78%', '10px', -2.6), s('70%', '22%', '14px', -1.1), s('88%', '40%', '9px', -3),
  ],
  '.ritual__pin': [
    ['pine', { right: '-3%', top: '9%', w: 'clamp(150px, 15vw, 250px)', flip: true }],
    ['orange', { left: '4%', bottom: '16%', w: 'clamp(46px, 4vw, 70px)', rot: -10 }],
    ['anise', { left: '10%', bottom: '11%', w: 'clamp(36px, 3vw, 52px)' }],
    s('8%', '24%', '12px', -0.6), s('46%', '14%', '10px', -2.1), s('40%', '86%', '14px', -1.3),
  ],
  '.ingredients': [
    ['sprig', { right: '2%', top: '2%', w: 'clamp(110px, 10vw, 180px)', rot: 10 }],
    ['anise', { left: '3%', bottom: '4%', w: 'clamp(44px, 3.6vw, 64px)' }],
    ['cinnamon', { right: '4%', bottom: '5%', w: 'clamp(100px, 9vw, 150px)', rot: -8 }],
    ['hang2', { right: '15%', top: '-50px', t: -1.2 }],
    s('12%', '10%', '12px', -0.8), s('90%', '30%', '14px', -2.2), s('6%', '58%', '10px', -1.4), s('94%', '70%', '9px', -3.1),
  ],
  '.scatter': [
    ['anise', { left: '47%', top: '5%', w: 'clamp(40px, 3.4vw, 58px)' }],
    ['orange', { right: '28%', bottom: '20%', w: 'clamp(44px, 3.8vw, 66px)', rot: 14 }],
    ['holly', { left: '26%', bottom: '18%', w: 'clamp(70px, 6vw, 110px)', rot: 10 }],
    s('36%', '12%', '12px', -0.5), s('62%', '84%', '14px', -1.9), s('55%', '30%', '9px', -2.7),
  ],
  '.corp': [
    ['holly', { left: '5%', bottom: '5%', w: 'clamp(90px, 8vw, 140px)', rot: -10 }],
    ['gift', { left: '17%', bottom: '4%', w: 'clamp(54px, 4.6vw, 84px)', rot: 6 }],
    ['anise', { left: '28%', bottom: '9%', w: 'clamp(34px, 2.8vw, 48px)' }],
    s('92%', '40%', '12px', -0.7), s('48%', '6%', '10px', -2.3), s('4%', '62%', '14px', -1.5), s('70%', '92%', '9px', -2.9),
  ],
  '.footer': [
    ['hang1', { left: '5%', top: '0' }], ['hang2', { right: '6%', top: '-24px', t: -2 }], ['hang3', { right: '13%', top: '0', t: -1.1 }],
    ['holly', { left: '3%', bottom: '30%', w: 'clamp(70px, 6vw, 110px)', rot: -14 }],
    s('18%', '30%', '14px', -0.9), s('82%', '62%', '12px', -2.4), s('50%', '8%', '10px', -1.6),
  ],
  '.kp-hero': [
    ['hang2', { right: '4%', top: '0' }], ['hang3', { right: '10%', top: '-30px', t: -1.7 }],
    ['holly', { left: '2%', bottom: '4%', w: 'clamp(70px, 6.4vw, 110px)', rot: -12 }],
    s('46%', '12%', '12px', -0.6), s('94%', '58%', '10px', -2), s('6%', '30%', '14px', -1.3),
  ],
  '.kp-box': [
    ['sprig', { right: '1%', top: '4%', w: 'clamp(100px, 9vw, 160px)', rot: 12 }],
    s('8%', '12%', '12px', -0.8), s('92%', '78%', '10px', -2.2),
  ],
  '.kp-gift': [
    ['gift', { right: '4%', bottom: '8%', w: 'clamp(56px, 5vw, 90px)', rot: 8 }],
    ['anise', { left: '3%', top: '10%', w: 'clamp(38px, 3.2vw, 56px)' }],
    s('14%', '80%', '12px', -1.2), s('88%', '16%', '14px', -0.4),
  ],
  '.kp-reveal': [
    ['holly', { left: '4%', top: '12%', w: 'clamp(70px, 6vw, 110px)', rot: -16 }],
    ['orange', { right: '5%', bottom: '12%', w: 'clamp(44px, 3.8vw, 66px)', rot: 12 }],
    s('86%', '20%', '12px', -1), s('12%', '78%', '10px', -2.5),
  ],
  '.kp-more': [
    ['hang1', { left: '4%', top: '0' }], ['hang2', { right: '5%', top: '-20px', t: -2.1 }],
    s('20%', '40%', '12px', -0.7), s('84%', '70%', '10px', -1.8),
  ],
  '.mk-head': [
    ['hang1', { right: '22%', top: '0' }], ['hang3', { right: '15%', top: '-30px', t: -1.4 }], ['hang2', { right: '8%', top: '-10px', t: -2.2 }],
    ['holly', { right: '3%', bottom: '6%', w: 'clamp(70px, 6vw, 110px)', rot: 10, flip: true }],
    s('64%', '30%', '14px', -0.5), s('80%', '70%', '12px', -1.9), s('94%', '18%', '10px', -2.8),
  ],
};

function ensureDefs() {
  if (document.getElementById('dHolly')) return;
  document.body.insertAdjacentHTML('afterbegin', `<svg class="decor-defs" width="0" height="0" aria-hidden="true" style="position:absolute"><defs>${DEFS}</defs></svg>`);
}

const io = 'IntersectionObserver' in window
  ? new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-off', !e.isIntersecting)), { rootMargin: '10% 0px' })
  : null;

function decorate(el, items) {
  if (el.querySelector(':scope > .sdecor')) return;
  const layer = document.createElement('div');
  layer.className = 'sdecor';
  layer.setAttribute('aria-hidden', 'true');
  layer.innerHTML = items.map(([kind, o]) => {
    const pos = ['left', 'right', 'top', 'bottom'].filter((k) => o[k] != null).map((k) => `${k}:${o[k]}`).join(';');
    const art = kind === 'spark' ? SPARK : ART[kind];
    return `<div class="sdecor__i sdecor__i--${kind}" style="${pos};width:${o.w || W[kind]};--rot:${o.rot || 0}deg;--sx:${o.flip ? -1 : 1};--t:${o.t || 0}s">${art}</div>`;
  }).join('');
  el.classList.add('has-sdecor');
  el.prepend(layer);
  io?.observe(layer);
}

/** Decora as seções presentes na página (chamar depois de o conteúdo estar no DOM). */
export function decorateSections(root = document) {
  ensureDefs();
  for (const [sel, items] of Object.entries(PRESETS)) root.querySelectorAll(sel).forEach((el) => decorate(el, items));
}

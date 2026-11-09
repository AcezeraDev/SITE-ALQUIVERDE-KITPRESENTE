// Black Friday 2026: mesmas informações do banner da loja Shopify.
// Frete grátis e entrega no mesmo dia na Grande SP, para compras de segunda a sexta, até as 12h.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MAX_OFF } from './kits.js';
import './bf.css';

gsap.registerPlugin(ScrollTrigger);

const CUTOFF = 12; // horas, horário de Brasília
const DAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

// hora atual em São Paulo, independente do fuso do visitante
const spNow = () => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return { wd, h: +parts.hour, m: +parts.minute };
};

// frase de status: ainda dá para receber hoje? quando é a próxima janela?
export const bfStatus = () => {
  const { wd, h, m } = spNow();
  const util = wd >= 1 && wd <= 5;
  if (util && h < CUTOFF) {
    const left = (CUTOFF - h) * 60 - m;
    const hh = Math.floor(left / 60), mm = left % 60;
    const t = hh ? `${hh}h${mm ? ` ${String(mm).padStart(2, '0')}min` : ''}` : `${mm} min`;
    return { open: true, text: `Peça nas próximas ${t} e receba hoje` };
  }
  const next = wd >= 1 && wd <= 4 ? wd + 1 : 1; // depois do corte: próximo dia útil
  const quando = next === wd + 1 ? 'amanhã' : DAYS[next];
  return { open: false, text: `Próxima entrega no mesmo dia: ${quando}, pedidos até 12h` };
};

const fillStatus = (root) => {
  const s = bfStatus();
  root.querySelectorAll('[data-bf-status]').forEach((el) => {
    el.textContent = s.text;
    el.closest('.bf-live')?.classList.toggle('is-open', s.open);
  });
};

export function initBlackFriday({ reduced = false } = {}) {
  document.querySelectorAll('[data-bf-off]').forEach((el) => { el.textContent = MAX_OFF; });
  fillStatus(document);
  setInterval(() => fillStatus(document), 30_000);

  const sec = document.querySelector('.bf');
  if (!sec || reduced) return;

  // entrada com mola: o cartão assenta com leve overshoot, o texto vem em fila, o número conta
  const card = sec.querySelector('.bf__card');
  const lines = sec.querySelectorAll('.bf__in');
  const num = sec.querySelector('.bf__num [data-bf-off]');
  gsap.set(card, { y: 60, scale: 0.94, opacity: 0 });
  gsap.set(lines, { y: 28, opacity: 0 });
  const counter = { v: 0 };
  ScrollTrigger.create({
    trigger: sec, start: 'top 78%', once: true,
    onEnter: () => {
      const tl = gsap.timeline();
      tl.to(card, { y: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'elastic.out(1, 0.6)' })
        .to(lines, { y: 0, opacity: 1, duration: 0.8, ease: 'expo.out', stagger: 0.08 }, 0.15);
      if (num) tl.to(counter, { v: MAX_OFF, duration: 1.4, ease: 'expo.out', onUpdate: () => { num.textContent = Math.round(counter.v); } }, 0.3);
    },
  });

  // luz que segue o ponteiro no cartão (vidro sobre verde-escuro)
  if (matchMedia('(pointer: fine)').matches) {
    gsap.set(card, { '--mx': 70, '--my': 20 });
    const qx = gsap.quickTo(card, '--mx', { duration: 0.6, ease: 'power3.out' });
    const qy = gsap.quickTo(card, '--my', { duration: 0.6, ease: 'power3.out' });
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      qx(((e.clientX - r.left) / r.width) * 100);
      qy(((e.clientY - r.top) / r.height) * 100);
    });
  }
}

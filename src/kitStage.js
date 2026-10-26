import { setImageSource } from './imageSizes.js';
// Coleção no desktop: um palco 3D fixo + trilho com as miniaturas dos kits.
// A rolagem (seção presa) escolhe o kit; o trilho pula direto para qualquer um. Uma única cena WebGL
// troca a caixa (setModel) em vez de uma cena por kit. Os <article class="kit"> continuam sendo a fonte
// do texto, das combinações e dos botões: aqui eles ficam empilhados e só o ativo aparece.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lazyScene } from './lazy.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pad = (n) => String(n).padStart(2, '0');

// Decoração do palco: usa os símbolos e gradientes do hero (#dWine, #dGoldBall, #dForest, #dCap, #dHolly, #dSpark)
const bauble = (fill) => `<svg viewBox="0 0 60 220"><line x1="30" y1="0" x2="30" y2="150" stroke="#b39360" stroke-width="1.2"/><path d="M25 151q5-9 10 0" fill="none" stroke="#b39360" stroke-width="1.6"/><rect x="23" y="149" width="14" height="11" rx="2" fill="url(#dCap)"/><circle cx="30" cy="185" r="26" fill="url(#${fill})"/><path d="M6 178q24 10 48 0" fill="none" stroke="#f3dfb0" stroke-width="1.4" opacity=".55"/><ellipse cx="21" cy="174" rx="7" ry="4" fill="#fff" opacity=".4" transform="rotate(-30 21 174)"/></svg>`;
const holly = '<svg viewBox="-110 -70 220 140"><use href="#dHolly" transform="rotate(-150) translate(8 0)" fill="#2f5a38"/><use href="#dHolly" transform="rotate(-30) translate(8 0)" fill="#3c6b44"/><circle cx="-7" cy="-6" r="10" fill="#a8323e"/><circle cx="9" cy="-3" r="9" fill="#b8333f"/><circle cx="1" cy="10" r="8" fill="#922633"/><g fill="#fff" opacity=".5"><circle cx="-10" cy="-9" r="2.4"/><circle cx="6" cy="-6" r="2"/></g></svg>';
const SPARKS = [[12, 22, 16, -0.4], [84, 18, 12, -1.6], [8, 62, 10, -2.4], [90, 56, 18, -0.9], [22, 84, 11, -2.9], [78, 80, 13, -1.2], [50, 9, 9, -2]];
const SEAL = `<svg class="collection__seal" viewBox="0 0 120 120" aria-hidden="true">
  <defs><path id="sealRing" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0"/></defs>
  <circle cx="60" cy="60" r="57" fill="none" stroke="currentColor" stroke-width=".7" opacity=".45"/>
  <circle cx="60" cy="60" r="33" fill="none" stroke="currentColor" stroke-width=".7" opacity=".45"/>
  <g class="collection__seal-text"><text font-size="9.2" letter-spacing="2.4" fill="currentColor"><textPath href="#sealRing">FEITO À MÃO ✳ NATAL 2026 ✳ ALQUIVERDE ✳</textPath></text></g>
  <use href="#dSpark" transform="translate(45 45) scale(1.25)" class="collection__seal-star"/>
</svg>`;

export function initKitStage({ section, kitsData, initKitViewer, lenis, EASE }) {
  const pin = $('.collection__pin', section);
  const kits = $$('.kit', section);
  const N = kits.length;
  section.classList.add('collection--stage');

  // palco: arco (fica parado, dá continuidade) + objeto que troca (foto e canvas 3D)
  const stage = document.createElement('div');
  stage.className = 'stage';
  stage.innerHTML = `
    <div class="stage__plinth" aria-hidden="true"></div>
    <div class="stage__decor" aria-hidden="true">
      <span class="stage__frame"></span>
      <div class="stage__hang stage__hang--1">${bauble('dWine')}</div>
      <div class="stage__hang stage__hang--2">${bauble('dGoldBall')}</div>
      <div class="stage__hang stage__hang--3">${bauble('dForest')}</div>
      ${SPARKS.map(([x, y, w, t]) => `<svg class="decor-spark" viewBox="0 0 24 24" style="--x:${x}%;--y:${y}%;--w:${w}px;--t:${t}s"><use href="#dSpark"/></svg>`).join('')}
      <div class="stage__holly stage__holly--l">${holly}</div>
      <div class="stage__holly stage__holly--r">${holly}</div>
    </div>
    <div class="stage__obj" data-cursor="girar">
      <img class="stage__img" alt="" decoding="async" />
      <canvas class="stage__gl" role="img"></canvas>
    </div>
    <div class="stage__shadow" aria-hidden="true"></div>
    <p class="stage__hint" aria-hidden="true">Arraste para girar</p>`;
  pin.insertBefore(stage, $('.collection__track', pin));
  const obj = $('.stage__obj', stage);
  const img = $('.stage__img', stage);
  const canvas = $('.stage__gl', stage);

  // contador 01 / 11 (os números rolam no lugar)
  const count = document.createElement('p');
  count.className = 'collection__count';
  count.setAttribute('aria-hidden', 'true');
  const digit = (c) => `<span class="collection__digit"><span>${c}</span></span>`;
  count.innerHTML = `<span class="collection__count-cur">${[...pad(1)].map(digit).join('')}</span><svg class="collection__count-spark" viewBox="0 0 24 24"><use href="#dSpark"/></svg><span class="collection__count-tot">/ ${pad(N)}</span>`;
  $('.collection__head', section).insertAdjacentHTML('beforeend', SEAL);
  $('.collection__head', section).append(count);
  const hangs = $$('.stage__hang', stage);

  // trilho
  const rail = document.createElement('nav');
  rail.className = 'kit-rail';
  rail.setAttribute('aria-label', 'Kits da coleção');
  rail.innerHTML = `
    <div class="kit-rail__line" aria-hidden="true"><span class="kit-rail__fill"></span></div>
    <ol>${kits.map((k, i) => {
      const data = kitsData.find((d) => d.id === k.dataset.kit);
      return `<li><button type="button" class="kit-rail__btn" data-i="${i}" aria-current="${i === 0}" aria-label="Kit ${i + 1} de ${N}: ${data.name}">
        <span class="kit-rail__thumb"><img src="/kits/${data.variants[0].front}.webp" alt="" loading="lazy" decoding="async" /></span>
        <span class="kit-rail__name">${data.name}</span>
      </button></li>`;
    }).join('')}</ol>`;
  pin.append(rail);
  const btns = $$('.kit-rail__btn', rail);
  const fill = $('.kit-rail__fill', rail);

  const viewer = lazyScene(stage, () => initKitViewer(canvas, firstModel(), { reduced: false }), { rootMargin: '0px' });
  function firstModel() { return kits.find((k) => k.classList.contains('kit--3d'))?.dataset.model; }

  let cur = 0;
  let token = 0; // a última troca vence (a foto/3D de uma troca antiga não aparece depois)
  let tl = null;
  let enter = null; // entrada da caixa (espera a textura)
  let jumping = false;
  let st = null;

  const modelOf = (k) => (k.classList.contains('kit--3d') ? k.dataset.model : null);
  const name = (k) => $('.kit__info h3', k).textContent;

  /** Põe o kit no palco. Kit sem 3D: foto. Kit 3D: espera a textura da frente e troca a caixa (a foto não
   *  aparece por cima da caixa; só na primeira carga, até a cena ficar pronta). Devolve uma promessa. */
  function apply(k) {
    const t = ++token;
    const front = $('.kit__img--front', k);
    stage.style.setProperty('--tone', k.style.getPropertyValue('--tone'));
    stage.style.setProperty('--kbg', k.dataset.bg);
    stage.dataset.kit = k.dataset.kit;
    const model = modelOf(k);
    if (!model) {
      stage.classList.remove('is-3d', 'gl-ready');
      setImageSource(img, front.getAttribute('src'));
      img.alt = front.alt;
      return Promise.resolve();
    }
    canvas.setAttribute('aria-label', `${name(k)} em 3D. Arraste ou use as setas para girar.`);
    if (!stage.classList.contains('gl-ready')) { setImageSource(img, front.getAttribute('src')); img.alt = front.alt; }
    stage.classList.add('is-3d');
    return new Promise((res) => {
      let fired = false;
      const done = () => {
        if (fired) return;
        fired = true;
        if (t === token) {
          viewer.create();
          Promise.resolve(viewer.setModel(model)).then(() => {
            if (t === token) {
              stage.classList.toggle('gl-ready', viewer.available !== false);
              if (viewer.available === false) setImageSource(img, front.getAttribute('src'));
            }
            res();
          });
          return;
        }
        res();
      };
      const pre = new Image();
      pre.onload = pre.onerror = done;
      setTimeout(done, 900); // rede lenta: não segura a troca para sempre
      if (model === 'cinco-oleos') done();
      else pre.src = `/kit3d/${model}-front.webp`;
    });
  }

  // vizinhos já baixando: a próxima troca não espera a textura
  function prefetch(i) {
    [i - 1, i + 1].forEach((j) => {
      const m = kits[j] && modelOf(kits[j]);
      if (m && m !== 'cinco-oleos') new Image().src = `/kit3d/${m}-front.webp`;
    });
  }

  function setRail(i) {
    btns.forEach((b, j) => b.setAttribute('aria-current', String(j === i)));
  }

  // contador: cada dígito que muda vira em 3D (como relógio de virar); a estrelinha pisca a cada troca
  function setCount(i, dir) {
    const next = pad(i + 1);
    $$('.collection__digit', count).forEach((slot, d) => {
      const old = slot.lastElementChild;
      if (old.textContent === next[d]) return;
      const nu = document.createElement('span');
      nu.textContent = next[d];
      slot.append(nu);
      gsap.killTweensOf(slot.children);
      [...slot.children].slice(0, -2).forEach((x) => x.remove()); // trocas rápidas: só sobram a antiga e a nova
      gsap.to(old, { rotationX: 90 * dir, yPercent: -18 * dir, opacity: 0, filter: 'blur(4px)', duration: 0.38, delay: d * 0.06, ease: EASE.exit, onComplete: () => old.remove() });
      gsap.fromTo(nu, { rotationX: -90 * dir, yPercent: 18 * dir, opacity: 0, filter: 'blur(4px)' },
        { rotationX: 0, yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, delay: 0.16 + d * 0.06, ease: EASE.enter, clearProps: 'filter' });
    });
    gsap.fromTo($('.collection__count-spark', count), { scale: 0, rotation: -90, opacity: 1 },
      { scale: 1, rotation: 45, opacity: 0, duration: 1.1, delay: 0.2, ease: EASE.soft, overwrite: true });
  }

  function go(i) {
    i = gsap.utils.clamp(0, N - 1, i);
    if (i === cur) return;
    const dir = i > cur ? 1 : -1;
    const prev = kits[cur], next = kits[i];
    cur = i;
    tl?.progress(1).kill();
    enter?.progress(1).kill();
    setRail(i);
    setCount(i, dir);
    // as bolas balançam com a troca (o balanço contínuo é CSS, no svg de dentro)
    gsap.fromTo(hangs, { rotation: 7 * dir }, { rotation: 0, duration: 2.2, stagger: 0.08, ease: 'elastic.out(1, 0.3)', overwrite: true });
    gsap.to(section, { backgroundColor: next.dataset.bg, duration: 0.8, ease: EASE.soft, overwrite: 'auto' });
    prev.classList.remove('is-active');
    next.classList.add('is-active');
    const out = $$('.kit__info > *', prev);
    const inn = $$('.kit__info > *', next);
    // palavra que troca no lugar: a antiga sobe com desfoque, a nova vem de baixo (MOTION.md)
    tl = gsap.timeline()
      .to(out, { y: -26, opacity: 0, filter: 'blur(6px)', duration: 0.3, stagger: 0.025, ease: EASE.exit }, 0)
      .to(obj, { xPercent: -10 * dir, rotationY: -14 * dir, scale: 0.9, opacity: 0, duration: 0.32, ease: EASE.exit }, 0)
      .add(() => {
        gsap.set(prev, { autoAlpha: 0 }); gsap.set(out, { clearProps: 'all' }); gsap.set(next, { autoAlpha: 1 });
        // a caixa só volta quando a nova textura já está na placa de vídeo
        apply(next).then(() => {
          if (kits[cur] !== next) return;
          enter = gsap.fromTo(obj, { xPercent: 10 * dir, rotationY: 14 * dir, scale: 0.9, opacity: 0 }, { xPercent: 0, rotationY: 0, scale: 1, opacity: 1, duration: 0.95, ease: EASE.enter });
        });
      })
      .fromTo(inn, { y: 34, opacity: 0, filter: 'blur(6px)' }, { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, stagger: 0.05, ease: EASE.enter, clearProps: 'filter' });
    prefetch(i);
  }

  kits.forEach((k) => $('.kit__items ul', k)?.setAttribute('data-lenis-prevent', '')); // lista longa rola por dentro

  // estado inicial
  kits.forEach((k, i) => { gsap.set(k, { autoAlpha: i === 0 ? 1 : 0 }); k.classList.toggle('is-active', i === 0); });
  section.style.backgroundColor = kits[0].dataset.bg;
  apply(kits[0]);
  prefetch(0);

  const per = () => innerHeight * 0.7; // rolagem por kit

  // trilho: clique pula direto (sem passar por todos os kits do meio)
  btns.forEach((b) => b.addEventListener('click', () => {
    const i = +b.dataset.i;
    go(i);
    if (!st) return;
    const y = st.start + i * per();
    if (lenis) { jumping = true; lenis.scrollTo(y, { duration: 1.1, onComplete: () => { jumping = false; } }); }
    else scrollTo({ top: y });
  }));
  rail.addEventListener('keydown', (e) => {
    const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (!d || !e.target.closest('.kit-rail__btn')) return;
    e.preventDefault();
    const j = gsap.utils.clamp(0, N - 1, +e.target.dataset.i + d);
    btns[j].focus();
    btns[j].click();
  });

  // dica "arraste para girar" some depois do primeiro giro
  canvas.addEventListener('pointerdown', () => stage.classList.add('was-dragged'), { once: true });

  return {
    viewer,
    /** Chamado quando a combinação de um kit muda: se ele estiver no palco, a caixa/foto acompanha. */
    sync(k) {
      if (k !== kits[cur]) return;
      // giro de cartão: some de lado, troca, volta do outro lado
      enter?.kill();
      gsap.to(obj, { rotationY: 90, scale: 0.94, duration: 0.26, ease: EASE.exit, onComplete: () => apply(k).then(() => {
        enter = gsap.fromTo(obj, { rotationY: -90 }, { rotationY: 0, scale: 1, duration: 0.7, ease: EASE.enter });
      }) });
    },
    scroll() {
      // entrada: o arco sobe, o kit assenta, o trilho entra em fila
      gsap.timeline({ scrollTrigger: { trigger: section, start: 'top 70%' } })
        .from('.stage__plinth', { yPercent: 18, opacity: 0, duration: 1.2, ease: EASE.enter })
        .from(obj, { y: 60, opacity: 0, duration: 1.2, ease: EASE.enter }, 0.15)
        .from($$('.kit__info > *', kits[0]), { y: 30, opacity: 0, duration: 0.8, stagger: 0.06, ease: EASE.soft }, 0.3)
        .from(btns, { y: 24, opacity: 0, duration: 0.7, stagger: 0.04, ease: EASE.soft }, 0.4);
      // animações CSS da decoração só rodam com a seção na tela
      section.classList.add('is-off');
      ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top', onToggle: (s) => section.classList.toggle('is-off', !s.isActive) });
      st = ScrollTrigger.create({
        trigger: pin, pin: true, start: 'top top', end: () => `+=${per() * (N - 1)}`, invalidateOnRefresh: true,
        onEnter: () => viewer.replayIntro(),
        onUpdate: (s) => {
          gsap.set(fill, { scaleX: s.progress });
          if (!jumping) go(Math.round(s.progress * (N - 1)));
        },
      });
    },
  };
}

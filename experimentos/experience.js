import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { KITS } from '../src/kits.js';
import { pageForKit } from '../src/kitPages.js';
import { kitPath } from '../src/seo.js';
import { addToBag, loadBag } from '../src/bag.js';
import { createStage } from './stage.js';

gsap.registerPlugin(ScrollTrigger);
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const concept = document.body.dataset.concept;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const themes = {
  galeria: { name: 'Galeria Botânica', headline: 'Um presente.<br>Muitas formas de carinho.', order: [2, 0, 3, 1, 4], next: 'orbita' },
  orbita: { name: 'Órbita de Presentes', headline: 'Qual é o tamanho<br>do seu abraço?', order: [2, 3, 4, 0, 1], next: 'capitulos' },
  capitulos: { name: 'Capítulos de Natal', headline: 'Três sabonetes.<br>Um belo gesto.', order: [0, 2, 1, 3, 4], next: 'galeria' },
};
const theme = themes[concept];
const items = theme.order.map((index) => ({ ...KITS[index], model: KITS[index].model || KITS[index].variants[0].model, sourceIndex: index }));
let active = 0, currentVariant = 0, trigger, stage, scrollTween, caption;
const positions = { value: 0 };
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7"/></svg>';

$('#app').innerHTML = `
  <header class="lab-header">
    <a class="lab-brand" href="./index.html" aria-label="Ver os três conceitos">AlquiVerde<span>estudos de movimento</span></a>
    <nav class="lab-nav" aria-label="Conceitos">
      ${Object.entries(themes).map(([key, value], i) => `<a href="./${key}.html" ${key === concept ? 'aria-current="page"' : ''}>0${i + 1}<span>${value.name}</span></a>`).join('')}
    </nav>
    <a class="lab-bag" href="/?sacola" aria-label="Ver sacola">Sacola <b id="bagCount">${loadBag().length}</b></a>
  </header>
  <main>
    <section class="scroll-journey" id="experience" aria-label="${theme.name}: coleção de kits">
      <div class="experience">
        <div class="chapter-color" aria-hidden="true"></div>
        <div class="chapter-edge" aria-hidden="true"></div>
        <div class="chapter-turn" aria-hidden="true"></div>
        <div class="scene-ground" aria-hidden="true"></div>
        <h1 class="experience-title">${theme.headline}</h1>
        <div class="scene-wrap">
          <img class="scene-photo" id="scenePhoto" src="/kits/${items[0].variants[0].angle}.webp" alt="" />
          <canvas id="scene" tabindex="0" role="img" aria-label="Kit em 3D. Arraste ou use as setas do teclado para girar."></canvas>
          <span class="scene-loading" role="status">Preparando os presentes<span></span></span>
        </div>
        <div class="stage-tools">
          <button type="button" id="resetView" aria-label="Reiniciar o giro do kit"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8 10a10 10 0 1 1-2 11M3 10h6V4M12 15l4-3 4 3v7h-8z"/></svg><span>Reiniciar giro</span></button>
          <p>Role para escolher<span aria-hidden="true">↓</span></p>
        </div>
        <div class="product-info" aria-live="polite" aria-atomic="false">
          <div class="product-story">
            <h2 id="productName"></h2>
            <p id="productTag"></p>
          </div>
          <div class="product-selection">
            <div id="variants" class="variant-list" role="group" aria-label="Combinação do kit"></div>
            <p id="productComposition" class="composition"></p>
            <div class="product-actions">
              <button class="primary-action" id="addBag" type="button"><span>Quero presentear</span>${arrow}</button>
              <a class="detail-link" id="detailsLink">Conhecer o kit</a>
              <button class="contents-link" id="showContents" type="button" aria-haspopup="dialog">O que vem na caixa <span>+</span></button>
            </div>
          </div>
        </div>
        <div class="collection-controls">
          <button class="previous-kit round-button" type="button" aria-label="Kit anterior">${chevron}</button>
          <nav class="kit-rail" aria-label="Escolher kit">
            ${items.map((kit) => `<button type="button" data-kit-id="${kit.id}" aria-label="Selecionar ${kit.name}"><span class="rail-dot"></span><span class="rail-name">${kit.name}</span></button>`).join('')}
            <div class="rail-track" aria-hidden="true"><i></i></div>
          </nav>
          <button class="next-kit round-button" type="button" aria-label="Próximo kit">${chevron}</button>
          <span class="chapter-count" aria-label="Posição na coleção"><b id="chapterNumber">01</b> / 05</span>
        </div>
      </div>
    </section>
    <footer class="journey-end">
      <p>Um jeito diferente de<br><em>encontrar o seu presente.</em></p>
      <a href="./${theme.next}.html">Explorar ${themes[theme.next].name} ${arrow}</a>
      <a class="return-site" href="/">Voltar ao site atual</a>
    </footer>
  </main>
  <dialog class="contents-dialog" aria-labelledby="contentsTitle">
    <button class="dialog-close" type="button" aria-label="Fechar detalhes">×</button>
    <p>Por dentro do presente</p><h2 id="contentsTitle"></h2><ul id="contentsList"></ul>
    <a class="detail-link" id="dialogDetails">Conhecer cada detalhe ${arrow}</a>
  </dialog>
  <div class="lab-toast" role="status" hidden>Seu presente está na sacola. <a href="/?sacola">Ver sacola ${arrow}</a></div>
`;

const chapterHeadlines = ['Três sabonetes.<br>Um belo gesto.', 'Simples.<br>Cheio de carinho.', 'O cuidado ganha<br>um laço.', 'O Natal cabe<br>nesta caixa.', 'Um abraço<br>de especiarias.'];
const chapterColors = ['#a83436', '#355340', '#9e2835', '#752f3b', '#254838'];
function selectedVariant() { return items[active].variants[currentVariant]; }
function renderProduct({ animate = true } = {}) {
  caption?.kill();
  gsap.set(['.product-story p', '.product-selection'], { clearProps: 'transform,opacity' });
  const kit = items[active];
  const variant = selectedVariant();
  $('#productName').replaceChildren(...kit.name.split(' ').flatMap((word, i) => {
    const mask = document.createElement('span'); mask.className = 'name-word';
    const ink = document.createElement('span'); ink.textContent = word; mask.append(ink);
    return i ? [document.createTextNode(' '), mask] : [mask];
  }));
  $('#productTag').textContent = variant.tag || kit.tagline;
  $('#productComposition').textContent = variant.label;
  $('#variants').innerHTML = kit.variants.length > 1 ? kit.variants.map((v, i) => `<button type="button" data-variant="${i}" aria-pressed="${i === currentVariant}">${v.label}</button>`).join('') : '';
  $('#productComposition').hidden = kit.variants.length > 1;
  const details = `${kitPath(pageForKit(kit.id).slug)}?v=${currentVariant}`;
  $('#detailsLink').href = details;
  $('#dialogDetails').href = details;
  $('#scenePhoto').src = `/kits/${variant.angle}.webp`;
  $('#scenePhoto').alt = `${kit.name}: ${variant.label}`;
  $('#chapterNumber').textContent = String(active + 1).padStart(2, '0');
  $$('[data-kit-id]').forEach((button) => {
    const on = button.dataset.kitId === kit.id;
    if (on) button.setAttribute('aria-current', 'true'); else button.removeAttribute('aria-current');
  });
  $('.previous-kit').disabled = active === 0;
  $('.next-kit').disabled = active === items.length - 1;
  $('#scene').setAttribute('aria-label', `${kit.name} em 3D. Arraste ou use as setas para girar.`);
  if (concept === 'capitulos') {
    $('.experience-title').innerHTML = chapterHeadlines[kit.sourceIndex];
    if (reduced) $('.chapter-color').style.backgroundColor = chapterColors[kit.sourceIndex];
    else gsap.to('.chapter-color', { backgroundColor: chapterColors[kit.sourceIndex], duration: 0.6, overwrite: true });
  }
  if (animate && !reduced) {
    caption = gsap.timeline({ defaults: { ease: 'power3.out', overwrite: true } });
    caption.fromTo('.name-word span', { yPercent: 115, rotation: 4 }, { yPercent: 0, rotation: 0, duration: 0.8, stagger: 0.06 }, 0)
      .fromTo('.product-story p', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.12)
      .fromTo('.product-selection', { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.24);
    if (concept === 'capitulos') gsap.fromTo('.experience-title', { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', overwrite: true });
  }
}
function update(value) {
  // Cada capítulo reserva tempo de scroll para inspecionar o objeto antes de trocá-lo.
  // Curvas com velocidade zero nas pontas deixam a frente legível entre os gestos.
  const chapter = Math.min(items.length - 1, Math.max(0, Math.floor(value)));
  const phase = Math.min(1, Math.max(0, value - chapter));
  const smooth = (t) => { t = Math.min(1, Math.max(0, t)); return t * t * t * (t * (t * 6 - 15) + 10); };
  const turn = reduced ? 0 : smooth((phase - 0.04) / 0.64);
  const travel = chapter === items.length - 1 ? 0 : smooth((phase - 0.72) / 0.28);
  const scenePosition = chapter + travel;
  const next = Math.round(scenePosition);
  if (next !== active) { active = next; currentVariant = 0; renderProduct(); stage?.reset(); stage?.setModel(active, items[active].model); }
  stage?.setProgress(scenePosition, { chapter, turn, travel, progress: value });
  $('.rail-track i').style.transform = `scaleX(${Math.min(1, (value + 0.2) / items.length)})`;
  $('.experience').style.setProperty('--inspection', turn);
  if (concept === 'galeria') $('.experience').style.setProperty('--backdrop-y', `${-value * 1.2}%`);
  if (concept === 'capitulos') {
    gsap.set('.chapter-turn', { yPercent: reduced ? 100 : 100 - travel * 200 });
  }
}
function go(index) {
  index = Math.min(items.length - 1, Math.max(0, index));
  if (reduced || !trigger) { positions.value = index; update(index); return; }
  scrollTween?.kill();
  const from = { y: scrollY };
  scrollTween = gsap.to(from, { y: trigger.start + (trigger.end - trigger.start) * index / items.length, duration: 1.2, ease: 'power3.inOut', onUpdate: () => window.scrollTo(0, from.y) });
}
$$('[data-kit-id]').forEach((button) => button.addEventListener('click', () => go(items.findIndex((kit) => kit.id === button.dataset.kitId))));
$('.previous-kit').addEventListener('click', () => go(active - 1));
$('.next-kit').addEventListener('click', () => go(active + 1));
$('#variants').addEventListener('click', (event) => {
  const button = event.target.closest('[data-variant]'); if (!button) return;
  currentVariant = +button.dataset.variant;
  stage?.setModel(active, selectedVariant().model || items[active].model);
  renderProduct({ animate: false });
});
$('#resetView').addEventListener('click', () => { stage?.reset(); go(active); $('#scene').focus({ preventScroll: true }); });
$('#addBag').addEventListener('click', () => {
  const kit = items[active], variant = selectedVariant();
  $('#bagCount').textContent = addToBag({ name: kit.name, variant: variant.label, img: `/kits/${variant.front}.webp` });
  $('.lab-toast').hidden = false;
  clearTimeout(window.__conceptToast); window.__conceptToast = setTimeout(() => { $('.lab-toast').hidden = true; }, 5000);
  if (!reduced) gsap.fromTo('#addBag', { scale: 0.96 }, { scale: 1, duration: 0.4, ease: 'power2.out' });
});
$('#showContents').addEventListener('click', () => {
  const kit = items[active], variant = selectedVariant();
  $('#contentsTitle').textContent = kit.name;
  const contents = kit.itemsFor ? kit.itemsFor(variant) : kit.items;
  $('#contentsList').replaceChildren(...contents.map((text) => { const li = document.createElement('li'); li.textContent = text; return li; }));
  $('.contents-dialog').showModal();
});
$('.dialog-close').addEventListener('click', () => $('.contents-dialog').close());
$('.contents-dialog').addEventListener('click', (event) => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.currentTarget.close(); } });

renderProduct({ animate: false });
stage = createStage($('#scene'), { concept, items, reduced, onSelect: go });
if (!stage.available) { document.body.classList.add('photo-mode'); $('.scene-loading').hidden = true; $('.stage-tools').hidden = true; }
$('#scene').addEventListener('stageunavailable', () => { document.body.classList.add('photo-mode'); $('.stage-tools').hidden = true; });

// A frente fica fotografada enquanto as texturas chegam; só revela o palco pronto.
if (stage.available) {
  const first = new Image();
  first.onload = () => { document.body.classList.add('stage-ready'); $('.scene-loading').hidden = true; };
  first.onerror = () => { document.body.classList.add('stage-ready'); $('.scene-loading').hidden = true; };
  first.src = `/kit3d/${items[0].model}-front.webp`;
}

await document.fonts.ready;
if (!reduced) {
  const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
  entrance.from('.experience-title', { y: 34, opacity: 0, duration: 1.1 }, 0.05)
    .from('.scene-wrap', { y: 65, opacity: 0, scale: 0.95, duration: 1.4 }, 0.15)
    .from('.product-info', { y: 24, opacity: 0, duration: 0.9 }, 0.45)
    .from('.kit-rail button', { y: 14, opacity: 0, duration: 0.7, stagger: 0.06 }, 0.65);
  gsap.to(positions, {
    value: items.length, ease: 'none',
    scrollTrigger: {
      trigger: '.scroll-journey', start: 'top top', end: 'bottom bottom', scrub: 0.75,
      onRefresh: (self) => { trigger = self; },
    },
    onUpdate: () => update(positions.value),
  });
  trigger = ScrollTrigger.getAll().find((s) => s.trigger === $('.scroll-journey'));
  const resetScrollTween = () => scrollTween?.kill();
  addEventListener('wheel', resetScrollTween, { passive: true });
  addEventListener('touchstart', resetScrollTween, { passive: true });
  ScrollTrigger.refresh();
} else document.body.classList.add('reduced-motion');
update(positions.value);

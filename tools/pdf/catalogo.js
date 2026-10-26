// Monta o catálogo a partir dos mesmos dados do site (src/kits.js) e da mesma decoração (src/decorArt.js).
import { KITS as SITE_KITS, INGREDIENTS, priceText } from '../../src/kits.js';

// Textos próprios do catálogo, por cima dos do site: para quem é (for), frase (tagline) e, nas velas, itens sem a descrição do rótulo
const COPY = {
  'caixa-prata': { for: 'Para um ritual de banho', tagline: 'Seis sabonetes, três variedades e um presente cheio de cuidado.' },
  laco: { for: 'Para um ritual de banho', tagline: 'Um convite para transformar o banho em um momento de cuidado.' },
  'feliz-natal': { for: 'Presente completo', tagline: 'Um presente completo, do banho ao clima de Natal.' },
  'laco-tropical': { for: 'Para um ritual de banho', tagline: 'Coco, barbatimão e aroeira em uma combinação que leva cuidado ao banho.' },
  especiarias: { for: 'Para quem ama especiarias', tagline: 'Canela, cravo e panetone: aromas que entram no clima do Natal.' },
  'quarteto-aromas': { for: 'Para perfumar a casa', tagline: 'Cinco aromas para descobrir novas combinações e perfumar seus espaços.' },
  'aromas-jardim': { for: 'Para perfumar a casa', tagline: 'Entre notas florais, cítricas e herbais, um presente para explorar novos aromas.' },
  'aroma-dourado': { for: 'Para perfumar a casa', tagline: 'Um toque de alecrim para perfumar o cantinho favorito.' },
  'raio-de-sol': { for: 'Lembrança de Natal', tagline: 'O aroma da laranja encontra o cuidado do sabonete em uma pequena surpresa.' },
  'presente-variado': { for: 'Lembrança de Natal', tagline: 'Três variedades de sabonete para descobrir novos favoritos.' },
  'oleo-uva': { for: 'Para o cuidado diário', tagline: 'Um cuidado para incluir no ritual de todos os dias.' },
  'vela-panetone': { for: 'Para o clima de Natal', tagline: 'O aroma do panetone para acompanhar os encontros de Natal.', items: ['Vela aromática de panetone em copo de vidro', 'Caixa transparente'] },
  'vela-gingerbread': { for: 'Para o clima de Natal', tagline: 'Aroma de biscoito de gengibre: doçura e especiarias que combinam com o Natal.', items: ['Vela aromática de gingerbread em copo de vidro', 'Caixa transparente'] },
};
const KITS = SITE_KITS.map((k) => ({ ...k, ...COPY[k.id] }));
import { DEFS, ART } from '../../src/decorArt.js';

const R = (n) => `/tools/pdf/render/${n}.png`;
// foto 3D de cada kit (e de cada combinação)
const RENDER = {
  'caixa-prata': R('kit-caixa-prata'), laco: R('kit-laco'), 'laco-tropical': R('kit-laco-tropical'), especiarias: R('kit-especiarias'),
  'quarteto-aromas': R('kit-quarteto'), 'aroma-dourado': R('kit-aroma-dourado'),
  // Aromas do Jardim: foto real (caixa fechada; a aberta entra menor por cima, em pair())
  'aromas-jardim': '/kits/cinco-oleos-frente.webp',
  'raio-de-sol': R('kit-raio-de-sol'), 'presente-variado': R('kit-presente-variado'), 'oleo-uva': R('kit-oleo-uva-dourado'),
  'feliz-natal': R('kit-feliz-natal'),
  // as velas só existem em foto, com fundo branco (mescladas ao fundo com multiply)
  'vela-panetone': '/kits/vela-biscoitos-frente.webp', 'vela-gingerbread': '/kits/vela-natalina-frente.webp',
};
const FUNDO_BRANCO = (img) => img.includes('/kits/vela-');
const FELIZ = [R('kit-feliz-natal'), R('kit-feliz-aroeira-coco'), R('kit-feliz-barbatimao-propolis')];
const kit = (id) => KITS.find((k) => k.id === id);
const num = (id) => String(KITS.findIndex((k) => k.id === id) + 1).padStart(2, '0');
const price = (k, v = k.variants[0]) => priceText(k, v).replace('Preço em breve', 'Consulte o valor');
const items = (list) => `<ul class="items">${list.map((t) => `<li>${t}</li>`).join('')}</ul>`;
const spark = '<svg viewBox="0 0 24 24"><use href="#dSpark"/></svg>';

document.getElementById('decorDefs').innerHTML = DEFS;
const EXTENSO = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'catorze', 'quinze'];
document.querySelectorAll('[data-count]').forEach((el) => {
  const n = KITS.length, w = EXTENSO[n] || String(n);
  el.textContent = el.dataset.count.replace('#', n).replace('@', w[0].toUpperCase() + w.slice(1)).replace('&', w);
});
const decorate = (root) => root.querySelectorAll('[data-art]').forEach((el) => { el.innerHTML = ART[el.dataset.art] || ''; });

// visão geral: todas as caixas
document.getElementById('overview').innerHTML = KITS.map((k) => `
  <div class="ov glass" style="--tone:${k.tone}">
    <span class="ov__n">${num(k.id)}</span>
    <img src="${RENDER[k.id]}" alt="">
    <b>${k.name}</b>
    <i class="ov__t">${k.for || ''}</i>
    <span class="ov__p">${price(k)}</span>
  </div>`).join('');

function block(k, { side = 'left', size = 'half', img = RENDER[k.id], extra = '' } = {}) {
  return `
  <article class="kit ${size} ${side}" style="--tone:${k.tone};--kbg:${k.bg};--kink:${k.ink}">
    <div class="kit__visual">
      <span class="kit__num">${num(k.id)}</span>
      <div class="kit__plinth"></div>
      <img class="kit__img${FUNDO_BRANCO(img) ? ' photo-blend' : ''}" src="${img}" alt="${k.name}">
      ${extra}
    </div>
    <div class="kit__info">
      <p class="kit__for">${k.for || ''}</p>
      <h3>${k.name}</h3>
      <p class="kit__tag">${k.tagline}</p>
      ${items(k.items)}
      <p class="kit__price"><span>${price(k)}</span></p>
    </div>
  </article>`;
}

const runner = (t) => `<header class="runner"><span>${t}</span><span class="pg"></span></header>`;
const feliz = kit('feliz-natal');
const pages = [];

// Feliz Natal: página inteira com as três combinações
pages.push(`
<section class="page kitpage feature" style="--tone:${feliz.tone};--kbg:${feliz.bg};--kink:${feliz.ink}">
  ${runner('Feliz Natal')}
  <div class="art holly-tr" data-art="holly"></div>
  <div class="art hang h5" data-art="hang1"></div>
  <p class="eyebrow">Destaque da coleção</p>
  <h2>Feliz <em>Natal.</em></h2>
  <p class="feature__tag">${feliz.tagline}</p>
  <p class="feature__sub">Quatro sabonetes vegetais, duas essências, vela de panetone e bucha vegetal, reunidos em uma caixa pronta para presentear.</p>
  <div class="feature__hero"><div class="kit__plinth"></div><img src="${FELIZ[0]}" alt="Kit Feliz Natal"></div>
  <div class="feature__variants">
    ${feliz.variants.map((v, i) => `
    <div class="fv">
      <img src="${FELIZ[i]}" alt="${v.label}">
      <b>${v.label}</b>
      <p>${v.soaps.map((s) => s.replace(/sabonetes? vegeta(?:l|is) /i, '').replace(' 90 g', '')).join(' · ')}</p>
      <span class="pill">${price(feliz, v)}</span>
    </div>`).join('')}
  </div>
</section>`);

const EXTRA = { 'aromas-jardim': '<img class="kit__img2" src="/kits/cinco-oleos-aberta.webp" alt="">' };
const pair = (a, b, title, arts = '') => pages.push(`
<section class="page kitpage pair">
  ${runner(title)}
  ${arts}
  ${block(kit(a), { side: 'left', extra: EXTRA[a] || '' })}
  <div class="divider">${spark}</div>
  ${block(kit(b), { side: 'right' })}
</section>`);

pair('laco', 'laco-tropical', 'Caixas com laço', '<div class="art gift-br" data-art="gift"></div>');
pair('especiarias', 'quarteto-aromas', 'Especiarias e aromas', '<div class="art cinnamon-tr" data-art="cinnamon"></div><div class="art anise-bl" data-art="anise"></div>');
pair('aromas-jardim', 'aroma-dourado', 'Casa perfumada', '<div class="art sprig-tr" data-art="sprig"></div>');

// caixas altas em grade 2 × 2
const tall = ['caixa-prata', 'raio-de-sol', 'presente-variado', 'oleo-uva'].map(kit).filter(Boolean);
pages.push(`
<section class="page kitpage trio">
  ${runner('Caixas de mimo')}
  <div class="art orange-tr" data-art="orange"></div>
  <p class="eyebrow">Para agradecer, celebrar e surpreender</p>
  <h2>Pequenos <em>grandes mimos.</em></h2>
  <div class="trio__row">
    ${tall.map((k) => `
    <article class="kit col" style="--tone:${k.tone};--kbg:${k.bg};--kink:${k.ink}">
      <div class="kit__visual"><span class="kit__num">${num(k.id)}</span><div class="kit__plinth"></div><img class="kit__img" src="${RENDER[k.id]}" alt="${k.name}"></div>
      <p class="kit__for">${k.for || ''}</p>
      <h3>${k.name}</h3>
      <p class="kit__tag">${k.tagline}</p>
      <p class="kit__price"><span>${price(k)}</span></p>
    </article>`).join('')}
  </div>
</section>`);

pair('vela-panetone', 'vela-gingerbread', 'Velas de Natal', '<div class="art pine-br" data-art="pine"></div>');

document.getElementById('kitPages').outerHTML = pages.join('');

// sabonetes
const soapHtml = INGREDIENTS.map((g) => `
  <div class="soap" style="--ing:${g.color}">
    <div class="soap__img"><img src="${R(`sabonete-${g.img}`)}" alt="Sabonete ${g.name}"></div>
    <b>${g.name}</b>
    <p>${g.line}</p>
  </div>`).join('');
document.getElementById('soaps').innerHTML = soapHtml + `
  <div class="soap soap--cta"><b>Escolha os seus</b><p>Combine 3, 6 ou 9 sabonetes no Monte o seu kit.</p><span>alquiverde.com.br</span></div>`;
// óleos essenciais: foto real de cada frasco (tools/pdf/oleos) e os kits em que ele aparece
const OLEOS = [
  ['Alecrim', 'alecrim', '#9aa02a'], ['Canela', 'canela', '#7a5333'], ['Capim Limão', 'capim-limao', '#e0662a'],
  ['Cravo', 'cravo', '#6a4730'], ['Eucalipto', 'eucalipto', '#3a9f93'], ['Laranja', 'laranja', '#e8692c'],
  ['Lavanda', 'lavanda', '#6b3f97'], ['Limão Siciliano', 'limao-siciliano', '#9fae2a'], ['Tangerina', 'tangerina', '#ea6b36'],
];
document.getElementById('oils').innerHTML = OLEOS.map(([nome, slug, cor]) => {
  const em = KITS.filter((k) => k.items.some((i) => /^Óleo/.test(i) && i.includes(nome))).map((k) => k.name);
  return `
  <div class="oil" style="--oil:${cor}">
    <div class="oil__img"><img class="photo-blend" src="/tools/pdf/oleos/${slug}.jpg" alt="Óleo essencial de ${nome}"></div>
    <b>${nome}</b>
    <small>${em.join(' · ')}</small>
  </div>`;
}).join('');
document.getElementById('buildSoaps').innerHTML = INGREDIENTS.map((g) => `<img src="${R(`sabonete-${g.img}`)}" alt="">`).join('');

// brilhos espalhados (posições fixas para o PDF sair sempre igual)
const SP = [[8, 22, 14], [88, 9, 10], [72, 44, 18], [14, 61, 11], [93, 70, 13], [40, 8, 9], [60, 92, 12], [5, 88, 9], [80, 30, 8], [30, 40, 7]];
document.querySelectorAll('.sparks').forEach((el) => {
  el.innerHTML = SP.map(([x, y, w]) => `<svg style="left:${x}%;top:${y}%;width:${w}px" viewBox="0 0 24 24"><use href="#dSpark"/></svg>`).join('');
});
// guirlanda de luzinhas
const bulbs = Array.from({ length: 15 }, (_, i) => {
  const x = (i + 0.5) * (800 / 15);
  const y = 10 + Math.sin((i + 0.5) / 15 * Math.PI) * 58;
  const c = ['#e9c77b', '#c25a69', '#fff2cf', '#6f9a73'][i % 4];
  return `<g transform="translate(${x} ${y})"><rect x="-3" y="-2" width="6" height="6" rx="1" fill="#8f7040"/><ellipse cy="11" rx="5.5" ry="8.5" fill="${c}"/><ellipse cy="11" rx="14" ry="16" fill="${c}" opacity=".16"/></g>`;
}).join('');
document.querySelectorAll('.garland').forEach((el) => {
  el.innerHTML = `<svg viewBox="0 0 800 90" preserveAspectRatio="none"><path d="M-10 8Q400 140 810 8" fill="none" stroke="#b39360" stroke-width="1.2"/>${bulbs}</svg>`;
});

decorate(document);
document.querySelectorAll('.page').forEach((p, i) => { const pg = p.querySelector('.pg'); if (pg) pg.textContent = String(i + 1).padStart(2, '0'); });

document.querySelectorAll('[data-qr]').forEach((el) => {
  const qr = window.qrcode(0, 'M');
  qr.addData(el.dataset.qr); qr.make();
  el.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
});

// ?es: versão em espanhol (tools/pdf/es.js); o que ficar sem tradução vai para o build avisar
if (new URLSearchParams(location.search).has('es')) {
  const { traduzPagina } = await import('./es.js');
  window.__faltam = traduzPagina();
}

// ?leve: troca cada imagem pela cópia reduzida que o build-catalogo.mjs grava em tools/pdf/leve
if (new URLSearchParams(location.search).has('leve')) {
  document.documentElement.classList.add('leve');
  const mapa = await fetch('/tools/pdf/leve/mapa.json').then((r) => r.json());
  document.querySelectorAll('img').forEach((im) => { const p = decodeURIComponent(new URL(im.src).pathname); if (mapa[p]) im.src = mapa[p]; });
  document.querySelectorAll('[style*="--silk"]').forEach((el) => {
    const p = el.style.getPropertyValue('--silk').match(/\((.*)\)/)[1];
    if (mapa[p]) el.style.setProperty('--silk', `url(${mapa[p]})`);
  });
}
await Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
await document.fonts.ready;
window.__ready = true;

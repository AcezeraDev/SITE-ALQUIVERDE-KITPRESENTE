import { KIT_PAGES, SOAP_INFO, ITEM_INFO, variantsOf, soapVarieties, careOf } from './kitPages.js';
import { KITS, shopUrl, priceText } from './kits.js';

import { kitPath } from './seo.js';
import { sizeImages } from './imageSizes.js';

export function kitRenderer(page) {
/* ---------------- Ilustrações em linha dos itens que não são sabonete ---------------- */
const ICONS = {
  bottle: '<path d="M27 4h10v7l5 7v38a4 4 0 0 1-4 4H26a4 4 0 0 1-4-4V18l5-7z"/><path d="M22 28h20M22 46h20"/><path d="M32 33c-3 4-4 6-2 8s5 0 4-3z"/>',
  vial: '<rect x="25" y="4" width="14" height="11" rx="2"/><path d="M23 15h18v40a5 5 0 0 1-5 5h-8a5 5 0 0 1-5-5z"/><path d="M23 30h18v15H23z"/><path d="M28 37.5h8"/>',
  candle: '<path d="M16 26h32l-2.5 30a5 5 0 0 1-5 4.6H23.5a5 5 0 0 1-5-4.6z"/><path d="M32 26v-6"/><path d="M32 6c-4.5 5-4.5 9 0 11 4.5-2 4.5-6 0-11z"/><path d="M19 42h26"/>',
  cup: '<path d="M15 12h34l-3.5 43a5 5 0 0 1-5 4.6H23.5a5 5 0 0 1-5-4.6z"/><path d="m32 24 2 5 5 .5-4 3.3 1.3 5-4.3-2.8-4.3 2.8 1.3-5-4-3.3 5-.5z"/><path d="M19 46h26"/>',
  loofah: '<rect x="12" y="8" width="40" height="50" rx="16"/><path d="M18 18c6 4 22 4 28 0M16 28c8 4 24 4 32 0M16 38c8 4 24 4 32 0M18 48c6 4 22 4 28 0M24 10c-3 14-3 34 0 46M40 10c3 14 3 34 0 46"/>',
  plug: '<rect x="20" y="16" width="34" height="40" rx="6"/><path d="M20 26h-8v20h8"/><path d="M12 31H5M12 41H5"/><path d="M28 30h18M28 40h18"/><path d="M37 16c-3-5-3-8 0-11 3 3 3 6 0 11z"/>',
  soap: '<rect x="8" y="20" width="48" height="28" rx="9"/><path d="M8 40c10 4 38 4 48 0"/><path d="M18 30h16M18 35h10"/>',
  box: '<path d="M8 22h48v34H8z"/><path d="M6 14h52v8H6zM32 14v42"/><path d="M32 14c-6-10-16-8-14-2 1 3 8 3 14 2zm0 0c6-10 16-8 14-2-1 3-8 3-14 2z"/>',
};
const icon = (name) => `<svg viewBox="0 0 64 64" aria-hidden="true" class="kp-icon"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g></svg>`;
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const pad = (n) => String(n).padStart(2, '0');
// kit sortido: `pool` é quantos sabonetes vêm, entre as variedades listadas
const poolText = (n, total) => (!n ? '' : n === 1 ? `Vem 1 sabonete, de uma das ${total} variedades abaixo.` : `Vêm ${n} sabonetes diferentes, entre as ${total} variedades abaixo.`);

/** Linhas do "o que vem na caixa" para uma combinação. */
function entries(v) {
  const out = [];
  for (const c of page.contents) {
    if (c.pool) continue; // variedades possíveis de um kit sortido: não são itens da caixa
    if (c.key) out.push({ id: c.key, qty: c.qty, name: c.label, sub: c.weight, key: c.key, color: SOAP_INFO[c.key].color });
    else if (c.soaps) {
      const n = {};
      v.soaps.forEach((k) => { n[k] = (n[k] || 0) + 1; });
      Object.entries(n).forEach(([k, q]) => out.push({ id: k, qty: q, key: k, color: SOAP_INFO[k].color,
        name: q > 1 ? `Sabonetes Vegetais de ${SOAP_INFO[k].name}` : `Sabonete Vegetal de ${SOAP_INFO[k].name}`, sub: q > 1 ? '90 g cada' : '90 g' }));
    } else {
      const it = ITEM_INFO[c.item];
      out.push({ id: c.item, qty: c.qty, name: it.name, sub: it.sci || it.sub || '', icon: it.icon, color: it.color });
    }
  }
  out.push({ id: 'caixa', qty: 1, name: page.box.label, sub: 'Embalagem para presente', icon: 'box', color: page.tone });
  return out;
}

const soapsText = page ? Object.fromEntries(soapVarieties(page).map((s) => [s.key, s])) : {};
function detailOf(e) {
  if (e.key) return { text: soapsText[e.key].text, notes: soapsText[e.key].notes };
  if (e.id === 'caixa') return { text: 'Chega montada à mão e pronta para presentear. É só escrever o cartão.', notes: ['Pronta para presente'] };
  return { text: ITEM_INFO[e.id].text, notes: ITEM_INFO[e.id].notes };
}

function listHTML(v) {
  return entries(v).map((e, i) => {
    const d = detailOf(e);
    const photo = !e.key && ITEM_INFO[e.id]?.photo;
    const thumb = e.key
      ? `<img src="/soaps/${e.key}.webp" alt="" width="96" height="96" loading="lazy" decoding="async" />`
      : photo ? `<img src="${photo}" alt="" loading="lazy" decoding="async" />` : icon(e.icon);
    return `
    <li class="kp-item" data-id="${e.id}" style="--ing:${e.color}">
      <button type="button" class="kp-item__head" aria-expanded="false" aria-controls="kpd-${e.id}" id="kph-${e.id}">
        <span class="kp-item__num">${pad(i + 1)}</span>
        <span class="kp-item__thumb">${thumb}</span>
        <span class="kp-item__text"><b>${e.qty > 1 ? `${e.qty} × ` : ''}${e.name}</b><small>${e.sub}</small></span>
        <span class="kp-item__plus" aria-hidden="true"></span>
      </button>
      <div class="kp-item__detail" id="kpd-${e.id}" role="region" aria-labelledby="kph-${e.id}" hidden>
        <p>${d.text}</p>
        <ul class="kp-notes">${d.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
      </div>
    </li>`;
  }).join('');
}

function hotspotsHTML(v) {
  if (!v.hotspots) return '';
  const order = entries(v).map((e) => e.id);
  return Object.entries(v.hotspots).map(([id, [x, y]]) => {
    const e = entries(v).find((en) => en.id === id);
    return `<button type="button" class="kp-hot" data-id="${id}" style="left:${x * 100}%;top:${y * 100}%" aria-label="${e.name}"><span>${order.indexOf(id) + 1}</span></button>`;
  }).join('');
}

/** Todas as peças do kit na ordem da caixa: sabonetes (de todas as combinações) e os outros itens. */
function piecesOf(soaps) {
  const out = [];
  const single = variantsOf(page).length === 1;
  const qtyOf = (k) => variantsOf(page)[0].soaps.filter((x) => x === k).length;
  const pool = page.contents.some((c) => c.pool);
  const soap = (s) => ({ id: s.key, kind: 'soap', qty: single && !pool ? qtyOf(s.key) : 1, name: SOAP_INFO[s.key].name, color: SOAP_INFO[s.key].color,
    kicker: pool ? 'Pode vir no kit · 90 g' : 'Sabonete vegetal · 90 g', line: s.sci, text: s.text, notes: s.notes, inVariants: s.inVariants });
  for (const c of page.contents) {
    if (c.item) {
      const it = ITEM_INFO[c.item];
      out.push({ id: c.item, kind: 'item', qty: c.qty, name: it.name, color: it.color, icon: it.icon, photo: it.photo, model: it.model,
        kicker: [it.kind, it.sub].filter(Boolean).join(' · '), line: it.sci || '', text: it.text, notes: it.notes });
    } else if (c.key) {
      const s = soaps.find((x) => x.key === c.key);
      if (s && !out.some((o) => o.id === s.key)) out.push(soap(s));
    } else if (c.soaps) {
      soaps.forEach((s) => { if (!out.some((o) => o.id === s.key)) out.push(soap(s)); });
    }
  }
  return out;
}


function render(variant = 0, lightMode = false) {
  const variants = variantsOf(page).map((v, i) => {
    if (!lightMode) return v;
    const kit = KITS.find((k) => k.id === page.kitId);
    const photo = kit?.variants[i]?.front;
    return photo ? { ...v, img: `/kits/${photo}.webp` } : v;
  });
  const vi = Math.min(Math.max(0, Math.trunc(Number(variant)) || 0), variants.length - 1);
  const v0 = variants[vi];
  const models = [...new Set(variants.map((v) => v.model).filter(Boolean))];
  const soaps = soapVarieties(page);
  const pieces = piecesOf(soaps);
  const care = careOf(page);
  const others = Object.values(KIT_PAGES).filter((p) => p.slug !== page.slug);
  const closing = page.closing.split(' ');

  const html = `
  <section class="kp-hero" aria-labelledby="kpTitle">
    <nav class="kp-crumbs" aria-label="Você está em">
      <a href="/">Kits de Natal</a><span aria-hidden="true">/</span><span aria-current="page" id="kpCrumb">${v0.title || page.name}</span>
    </nav>
    <div class="kp-hero__grid">
      <div class="kp-hero__visual" data-cursor="girar">
        <div class="kp-hero__plinth" aria-hidden="true"></div>
        <div class="kit__tilt kp-hero__tilt">
          <img class="kp-hero__img" src="${v0.img}" alt="${v0.title || page.name}" decoding="async" fetchpriority="high" />
          <span class="kit__glare" aria-hidden="true"></span>
        </div>
        <div class="kit__shadow" aria-hidden="true"></div>
        ${models.map((m) => `<canvas class="kp-hero__gl" data-model="${m}" role="img" aria-label="${page.name} em 3D. Arraste ou use as setas para girar." hidden></canvas>`).join('')}
      </div>
      <div class="kp-hero__info">
        <p class="eyebrow kp-in">Kit de Natal 2026</p>
        <h1 id="kpTitle" class="kp-title">${v0.title || page.name}</h1>
        <p class="kp-hero__sub kp-in">${page.subtitle}</p>
        <p class="kp-hero__tag kp-in">${v0.tag || page.tagline}</p>
        ${variants.length > 1
          ? `<div class="variants kp-in" role="radiogroup" aria-label="${variants[0].title ? 'Escolha o kit' : 'Combinação de sabonetes'}">${variants.map((v, j) =>
              `<button type="button" role="radio" class="variant" aria-checked="${j === vi}" data-v="${j}">${v.label}</button>`).join('')}</div>`
          : `<p class="variant-fixed kp-in">${v0.label}</p>`}
        <ul class="kp-facts kp-in" aria-label="Resumo do kit">${page.facts.map((f) => `<li>${f}</li>`).join('')}</ul>
        <div class="kp-buy kp-in">
          <p class="kp-price">${priceText(KITS.find((k) => k.id === page.kitId), KITS.find((k) => k.id === page.kitId)?.variants[vi])}</p>
          <a class="kit__add" id="kpShop" href="${shopUrl(KITS.find((k) => k.id === page.kitId), KITS.find((k) => k.id === page.kitId)?.variants[vi])}"><span>Quero presentear</span>${arrow}</a>
          <a class="text-link" href="#caixa">Ver o que vem na caixa</a>
        </div>
      </div>
    </div>
  </section>

  <section class="kp-intro" aria-label="Sobre o kit">
    <div class="kp-wrap">
      <p class="kp-intro__lead">${page.intro[0]}</p>
      <p class="kp-intro__more">${page.intro[1]}</p>
    </div>
  </section>

  <section class="kp-box" id="caixa" aria-labelledby="boxTitle">
    <div class="section-head">
      <p class="eyebrow">O que vem na caixa</p>
      <h2 id="boxTitle" class="reveal-title">Abra a caixa, <em>item por item.</em></h2>
      <p class="section-sub">${page.totals ? `${page.totals.units} sabonetes · ${page.totals.weight} no total. ` : ''}Toque em cada item para conhecer.${v0.hotspots ? ' Os números na foto mostram onde cada um está.' : ''}</p>
    </div>
    <div class="kp-box__grid">
      <figure class="kp-box__photo">
        <div class="kp-box__frame">
          <div class="kp-box__pic">
            <img src="${v0.open || v0.img}" alt="Caixa aberta do ${v0.title || `${page.name}: ${v0.label}`}" loading="lazy" decoding="async" />
            <div class="kp-hotspots">${hotspotsHTML(v0)}</div>
          </div>
        </div>
        <figcaption>${page.box.label} · ${v0.label}</figcaption>
      </figure>
      <ol class="kp-list" id="kpList">${listHTML(v0)}</ol>
    </div>
  </section>

  ${page.video ? `  <section class="kp-video" aria-labelledby="videoTitle">
    <div class="kp-wrap kp-video__grid">
      <div class="kp-video__copy">
        <p class="eyebrow">Feito à mão</p>
        <h2 id="videoTitle" class="reveal-title">Veja a caixa <em>sendo montada.</em></h2>
        <p class="kp-video__p">Cada sabonete, cada vidrinho e a bucha vão para o lugar certo, um por um, antes de a tampa fechar e o laço ser dado.</p>
      </div>
      <div class="kp-video__frame">
        <video class="kp-video__video" controls playsinline preload="none" poster="${page.video.poster}" aria-label="Vídeo da montagem de um kit AlquiVerde">
          <source src="${page.video.src}" type="video/mp4" />
        </video>
      </div>
    </div>
  </section>` : ''}

  <section class="kp-soaps" aria-labelledby="soapsTitle">
    <div class="section-head">
      <p class="eyebrow">Tudo o que vem no kit</p>
      <h2 id="soapsTitle" class="reveal-title">Conheça cada <em>item.</em></h2>
      <p class="section-sub">${poolText(page.contents.find((c) => c.pool)?.pool, soaps.length) || `${pieces.length} itens, um por um.`} ${lightMode ? 'Fotos e detalhes para conhecer o seu presente.' : 'Os sabonetes estão em 3D: dá para arrastar e girar.'}</p>
    </div>
    <div class="kp-soaps__layout">
      <div class="soap-stage kp-stage" style="--stage:${pieces[0].color}">
        <span class="soap-stage__halo" aria-hidden="true"></span>
        <canvas class="soap-stage__gl kp-layer" id="kpSoapGL" data-layer="soap" role="img" aria-label="Sabonete em 3D. Arraste ou use as setas do teclado para girar."></canvas>
        ${pieces.filter((p) => p.model).map((p) => `<canvas class="soap-stage__gl kp-layer" data-layer="${p.id}" data-model="${p.model}" role="img" aria-label="${p.name} em 3D. Arraste ou use as setas para girar." hidden></canvas>`).join('')}
        <img class="kp-stage__photo kp-layer" data-layer="photo" alt="" decoding="async" hidden />
        <div class="kp-stage__flat kp-layer" data-layer="flat" aria-hidden="true" hidden></div>
        <div class="soap-stage__info" aria-live="polite">
          <p class="soap-stage__kicker" id="kpStageKicker">${pieces[0].kicker}</p>
          <p class="soap-stage__name" id="kpSoapName">${pieces[0].name}</p>
          <p class="soap-stage__line" id="kpSoapSci">${pieces[0].line}</p>
        </div>
        <p class="soap-stage__hint" aria-hidden="true"><span>↻</span> arraste para girar</p>
      </div>
      <div class="kp-soaps__list">
        ${pieces.map((p, i) => `
        <article class="kp-soap" data-key="${p.id}" data-kind="${p.kind}" style="--ing:${p.color}" aria-labelledby="piece-${p.id}">
          <p class="kp-soap__num">${pad(i + 1)} / ${pad(pieces.length)} · ${p.kicker}</p>
          <h3 id="piece-${p.id}">${p.qty > 1 ? `${p.qty} × ` : ''}${p.name}</h3>
          ${p.line ? `<p class="kp-soap__sci">${p.line}</p>` : ''}
          <p class="kp-soap__text">${p.text}</p>
          <ul class="kp-notes">${p.notes.map((n) => `<li>${n}</li>`).join('')}</ul>
          ${p.inVariants?.length ? `<p class="kp-soap__in">Vem ${variants[0].title ? 'no' : 'na combinação'} ${p.inVariants.join(' e ')}</p>` : ''}
        </article>`).join('')}
      </div>
    </div>
  </section>

  <section class="kp-gift" aria-labelledby="giftTitle">
    <div class="kp-wrap kp-gift__grid">
      <div class="kp-gift__photo"><img src="/photos/celebracao.webp" alt="" loading="lazy" decoding="async" /></div>
      <div>
        <p class="eyebrow eyebrow--light">Para quem</p>
        <h2 id="giftTitle" class="reveal-title">${page.giftTitle}</h2>
        ${page.gift.map((g) => `<p class="kp-gift__p">${g}</p>`).join('')}
        <ul class="kp-chips" aria-label="Ideal para">${page.giftFor.map((g) => `<li>${g}</li>`).join('')}</ul>
      </div>
    </div>
  </section>

  <section class="kp-howto" aria-label="Modo de uso e cuidados">
    <div class="kp-wrap kp-howto__grid">
      <div>
        <p class="eyebrow">Modo de uso</p>
        <h2 class="kp-h2s">Como usar <em>os produtos</em></h2>
        <p class="kp-howto__use">${page.use}</p>
      </div>
      <div>
        <p class="eyebrow">Cuidados</p>
        <ul class="kp-care">${care.map((c) => `<li>${c}</li>`).join('')}</ul>
        <p class="kp-disclaimer">Cosméticos para limpeza e cuidado da pele. Complementam a sua rotina e não substituem avaliação dermatológica.</p>
      </div>
    </div>
  </section>

  <section class="kp-reveal" aria-label="${page.closing}">
    <div class="kp-reveal__sticky">
      <p class="kp-reveal__text" aria-hidden="true">${closing.map((w) => `<span class="kp-w"><span class="kp-w__ghost">${w}</span><span class="kp-w__ink">${w}</span></span>`).join(' ')}</p>
    </div>
  </section>

  <section class="kp-more" aria-labelledby="moreTitle">
    <div class="section-head">
      <p class="eyebrow">Conheça também</p>
      <h2 id="moreTitle" class="reveal-title">Outros <em>abraços.</em></h2>
    </div>
    <div class="kp-more__grid">
      ${others.map((p) => {
        const k = KITS.find((kk) => kk.id === p.kitId);
        return `
      <a class="kp-card" href="${kitPath(p.slug)}" style="--tone:${p.tone};--kbg:${p.bg};--kink:${p.ink}">
        <span class="kp-card__img"><img src="${k ? `/kits/${k.variants[0].front}.webp` : p.box.img}" alt="" loading="lazy" decoding="async" /></span>
        <span class="kp-card__name">${p.name}</span>
        <span class="kp-card__tag">${p.tagline}</span>
        <span class="kp-card__go">Ver o kit ${arrow}</span>
      </a>`;
      }).join('')}
    </div>
  </section>`;
  return { html: sizeImages(html), variants, vi };
}
return { render, listHTML, hotspotsHTML, piecesOf, icon };
}

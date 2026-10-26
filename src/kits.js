// Dados dos kits (nomes provisórios) e renderização dos painéis e ingredientes.
import { pageForKit } from './kitPages.js';
import { kitPath } from './seo.js';
import { sizeImages } from './imageSizes.js';

// Loja Shopify: `shop` (na combinação ou no kit) é o handle do produto; sem produto, o botão leva para a coleção.
const LOJA = 'https://alquiverde.com.br';
export const SHOP_COLLECTION = `${LOJA}/collections/kits-presente-1`;
export const shopUrl = (kit, v) => {
  const h = v?.shop || kit?.shop;
  return h ? `${LOJA}/products/${h}` : SHOP_COLLECTION;
};

// Preços da loja Shopify (conferidos em 26/10/2026, produtos ativos na Loja Online). Chave = handle do produto.
// Mudou o preço na loja? Atualize aqui. Combinação sem produto na loja mostra "Preço em breve".
const PRICES = {
  'kit-classico-presente-natal-sabonetes-naturais-essencias-vela-e-bucha-vegetal': 44.5,
  'kit-natal-amendoa-doce-sabonetes-de-calendula-e-barbatimao-oleo-vegetal-e-bucha-vegetal': 31.5,
  'kit-natal-semente-de-uva-sabonetes-de-barbatimao-com-aroeira-e-coco-oleo-vegetal-e-bucha-vegetal': 40,
  'kit-natal-canela-e-cravo-sabonetes-naturais-oleos-essenciais-e-bucha-vegetal': 77,
  'kit-natal-quarteto-de-aromas-oleo-essencial-de-cravo-oleo-de-canela-e-2-oleos-aromaticos-de-10-ml': 90,
  'kit-5-oleos-essenciais-alquiverde-lavanda-capim-limao-alecrim-cravo-e-tangerina-caixa-dourada': 100,
  'kit-natal-aromatizador-eletrico-com-oleo-essencial-de-alecrim-10-ml': 30,
  'kit-natal-oleo-essencial-de-laranja-sabonete-vegetal-sortido-90-g-caixa-dourada': 30,
  'kit-natal-presente-variado-3-sabonetes-vegetais-sortidos-90-g-caixa-dourada': 26,
  'kit-natal-oleo-de-semente-de-uva-puro-e-natural-caixa-dourada': 30,
  'vela-aromatica-panetone-natal-perfumada-copo-de-vidro': 20,
  'vela-aromatica-gingerbread-natal-perfumada-copo-de-vidro': 20,
  'kit-natal-caixa-prata-6-sabonetes-vegetais-de-barbatimao-calendula-e-aroeira': 30,
};
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const priceText = (kit, v) => {
  const p = PRICES[v?.shop || kit?.shop];
  return p ? brl.format(p) : 'Preço em breve';
};

const FELIZ_RESTO = ['Essência Morango com Champanhe', 'Essência Natal', 'Vela aromática de Panetone', 'Bucha vegetal', 'Caixa vermelha com visor'];

export const KITS = [
  {
    id: 'caixa-prata', name: 'Caixa Prata', hug: 3,
    tagline: 'Seis sabonetes vegetais, dois de cada aroma, numa caixa prata com visor e laço verde de cetim.',
    tone: '#4f7a4a', bg: '#e9eee6', ink: '#2c4a29',
    variants: [{ label: '2 Barbatimão · 2 Calêndula · 2 Aroeira', front: 'caixa-prata-frente', angle: 'caixa-prata-angulo', model: 'caixa-prata', shop: 'kit-natal-caixa-prata-6-sabonetes-vegetais-de-barbatimao-calendula-e-aroeira' }],
    items: ['2 sabonetes vegetais Barbatimão 90 g', '2 sabonetes vegetais Calêndula 90 g', '2 sabonetes vegetais Aroeira 90 g', 'Caixa prata com visor e laço verde de cetim'],
    tall: true,
  },
  {
    id: 'laco', name: 'Laço de Natal', hug: 3,
    tagline: 'Um banho completo, com laço vermelho e tudo.',
    tone: '#b3262f', bg: '#f6e3dc', ink: '#6d1c22',
    variants: [{ label: 'Calêndula · Barbatimão e Aroeira', front: 'laco-frente', angle: 'laco-angulo', model: 'laco', shop: 'kit-natal-amendoa-doce-sabonetes-de-calendula-e-barbatimao-oleo-vegetal-e-bucha-vegetal' }],
    items: ['Sabonete vegetal Calêndula 90 g', 'Sabonete vegetal Barbatimão e Aroeira 90 g', 'Óleo de Amêndoa Doce', 'Bucha vegetal', 'Caixa vermelha com laço'],
  },
  {
    id: 'feliz-natal', name: 'Feliz Natal', hug: 4,
    tagline: 'Quatro sabonetes, essências e uma vela de panetone para perfumar o Natal.',
    tone: '#752f3b', bg: '#f3dfdc', ink: '#5a1f29',
    // cada combinação tem a sua caixa 3D (mesma caixa, frente com a foto da combinação)
    variants: [
      { label: 'Kit Clássico', tag: 'Sabonetes de Coco, Calêndula, Aroeira e Barbatimão, duas essências, vela de panetone e bucha vegetal.', soaps: ['Sabonete vegetal Coco 90 g', 'Sabonete vegetal Calêndula 90 g', 'Sabonete vegetal Aroeira 90 g', 'Sabonete vegetal Barbatimão 90 g'], front: 'feliz-aroeira-calendula-frente', angle: 'feliz-aroeira-calendula-angulo', model: 'feliz-natal', shop: 'kit-classico-presente-natal-sabonetes-naturais-essencias-vela-e-bucha-vegetal' },
      { label: 'Kit Delicado', tag: 'Dois sabonetes de Aroeira e dois de Coco, duas essências, vela de panetone e bucha vegetal.', soaps: ['2 sabonetes vegetais Aroeira 90 g', '2 sabonetes vegetais Coco 90 g'], front: 'feliz-aroeira-coco-frente', angle: 'feliz-aroeira-coco-angulo', model: 'feliz-aroeira-coco' },
      { label: 'Kit da Casa', tag: 'Sabonetes de Barbatimão, Própolis, Açafrão e Barbatimão com Aroeira, duas essências, vela de panetone e bucha vegetal.', soaps: ['Sabonete vegetal Barbatimão 90 g', 'Sabonete vegetal Própolis 90 g', 'Sabonete vegetal Açafrão 90 g', 'Sabonete vegetal Barbatimão e Aroeira 90 g'], front: 'feliz-barbatimao-propolis-frente', angle: 'feliz-barbatimao-propolis-angulo', model: 'feliz-barbatimao-propolis' },
    ],
    items: ['4 sabonetes vegetais 90 g', 'Essência Morango com Champanhe', 'Essência Natal', 'Vela aromática de Panetone', 'Bucha vegetal', 'Caixa vermelha com visor'],
    itemsFor: (v) => [...v.soaps, ...FELIZ_RESTO],
  },
  {
    id: 'laco-tropical', name: 'Laço Tropical', hug: 3,
    tagline: 'Coco, cerrado e óleo de uva: um banho inteiro, com laço vermelho.',
    tone: '#a3313b', bg: '#f7e4de', ink: '#62202a',
    variants: [{ label: 'Barbatimão e Aroeira · Coco', front: 'laco-tropical-frente', angle: 'laco-tropical-frente', model: 'laco-tropical', shop: 'kit-natal-semente-de-uva-sabonetes-de-barbatimao-com-aroeira-e-coco-oleo-vegetal-e-bucha-vegetal' }],
    items: ['Sabonete vegetal Barbatimão e Aroeira 90 g', 'Sabonete vegetal Coco 90 g', 'Bucha vegetal natural', 'Óleo de Semente de Uva com Vitamina E', 'Caixa vermelha metalizada com laço de cetim'],
  },
  {
    id: 'especiarias', name: 'Especiarias de Natal', hug: 5,
    tagline: 'O abraço mais apertado: quatro sabonetes, óleos de canela e cravo.',
    tone: '#284a31', bg: '#e3ebdf', ink: '#1d3523',
    variants: [
      { label: '2 Coco + 2 Calêndula', front: 'especiarias-frente', angle: 'especiarias-frente', model: 'especiarias', shop: 'kit-natal-canela-e-cravo-sabonetes-naturais-oleos-essenciais-e-bucha-vegetal' },
      { label: '4 Coco', front: 'especiarias-coco-frente', angle: 'especiarias-coco-frente', model: 'especiarias-coco' },
    ],
    items: ['4 sabonetes vegetais 90 g (2 Coco + 2 Calêndula ou 4 Coco)', 'Óleo de Canela 10 mL', 'Óleo Essencial de Cravo 10 mL', 'Vela aromática de Panetone', 'Bucha vegetal', 'Caixa vermelha com divisórias'],
  },
  {
    id: 'quarteto-aromas', name: 'Cinco Aromas', hug: 3,
    tagline: 'Cinco óleos essenciais enfileirados na vitrine, com laço de cetim: a casa inteira com cheiro de festa.',
    tone: '#a8121c', bg: '#f6e2d8', ink: '#5f161c',
    variants: [{ label: 'Limão · Eucalipto · Alecrim · Canela · Cravo', front: 'quarteto-frente', angle: 'quarteto-angulo', model: 'quarteto', shop: 'kit-natal-quarteto-de-aromas-oleo-essencial-de-cravo-oleo-de-canela-e-2-oleos-aromaticos-de-10-ml' }],
    items: ['Óleo Essencial de Limão Siciliano 10 mL', 'Óleo Essencial de Eucalipto 10 mL', 'Óleo Essencial de Alecrim 10 mL', 'Óleo Essencial de Canela 10 mL', 'Óleo Essencial de Cravo 10 mL', 'Caixa vermelha com visor e laço de cetim'],
  },
  {
    id: 'aromas-jardim', name: 'Aromas do Jardim', hug: 3,
    tagline: 'Lavanda, Capim Limão, Alecrim, Cravo e Tangerina: cinco óleos essenciais numa caixinha dourada com laço.',
    tone: '#6b7a3a', bg: '#eef0e0', ink: '#3a4418',
    variants: [{ label: 'Lavanda · Capim Limão · Alecrim · Cravo · Tangerina', front: 'cinco-oleos-frente', angle: 'cinco-oleos-frente', model: 'cinco-oleos', shop: 'kit-5-oleos-essenciais-alquiverde-lavanda-capim-limao-alecrim-cravo-e-tangerina-caixa-dourada' }],
    items: ['Óleo Essencial de Lavanda', 'Óleo Essencial de Capim Limão', 'Óleo Essencial de Alecrim', 'Óleo Essencial de Cravo', 'Óleo Essencial de Tangerina', 'Caixa dourada texturizada com laço'],
  },
  {
    id: 'aroma-dourado', name: 'Aroma Dourado', hug: 2,
    tagline: 'Um aromatizador de porcelana e óleo essencial de Alecrim: a casa perfumada, numa caixa dourada com laço.',
    tone: '#a87b1e', bg: '#f5ecd9', ink: '#5a4210',
    variants: [{ label: 'Aromatizador elétrico · Alecrim 10 mL', front: 'aroma-dourado-frente', angle: 'aroma-dourado-frente', model: 'aroma-dourado', shop: 'kit-natal-aromatizador-eletrico-com-oleo-essencial-de-alecrim-10-ml' }],
    items: ['Aromatizador elétrico de porcelana, de tomada', 'Óleo Essencial de Alecrim 10 mL', 'Caixa dourada com tampa transparente e laço de cetim'],
  },
  {
    id: 'raio-de-sol', name: 'Raio de Sol', hug: 2,
    tagline: 'Óleo essencial de Laranja e um sabonete vegetal sortido numa caixinha dourada com janela.',
    tone: '#c46a12', bg: '#f8ead8', ink: '#5e3208',
    variants: [{ label: 'Laranja · sabonete sortido', front: 'raio-de-sol-frente', angle: 'raio-de-sol-frente', model: 'raio-de-sol', shop: 'kit-natal-oleo-essencial-de-laranja-sabonete-vegetal-sortido-90-g-caixa-dourada' }],
    items: ['Óleo Essencial de Laranja', 'Sabonete vegetal 90 g de variedade sortida (Barbatimão, Barbatimão com Aroeira, Aroeira, Calêndula, Coco, Açafrão ou Própolis)', 'Caixa dourada com tampa transparente e laço dourado'],
    tall: true,
  },
  {
    id: 'presente-variado', name: 'Presente Variado', hug: 2,
    tagline: 'Três sabonetes vegetais, cada um de uma variedade, numa caixa dourada com visor. É só entregar.',
    tone: '#a8873f', bg: '#f4ead6', ink: '#55400f',
    variants: [{ label: '3 sabonetes sortidos', front: 'presente-variado-frente', angle: 'presente-variado-frente', model: 'presente-variado', shop: 'kit-natal-presente-variado-3-sabonetes-vegetais-sortidos-90-g-caixa-dourada' }],
    items: ['3 sabonetes vegetais de variedades diferentes, 90 g cada', 'Variedades sortidas entre Barbatimão, Barbatimão com Aroeira, Aroeira, Calêndula, Coco, Açafrão e Própolis', 'Caixa dourada com visor transparente', 'Laço de fita dourada'],
    tall: true,
  },
  {
    id: 'oleo-uva', name: 'Semente de Uva', hug: 1,
    tagline: 'Óleo vegetal de semente de uva, puro e natural, numa caixa dourada com tampa transparente.',
    tone: '#7c2f50', bg: '#f3e3ea', ink: '#4a1730',
    variants: [{ label: 'Óleo vegetal · caixa dourada', front: 'oleo-uva-frente', angle: 'oleo-uva-frente', model: 'oleo-uva-dourado', shop: 'kit-natal-oleo-de-semente-de-uva-puro-e-natural-caixa-dourada' }],
    items: ['Óleo de Semente de Uva (óleo vegetal), puro e natural', 'Frasco escuro com tampa preta', 'Caixa dourada texturizada com tampa transparente'],
    tall: true,
  },
  {
    id: 'vela-panetone', name: 'Vela de Panetone', hug: 1,
    tagline: 'Cheirinho de ceia de Natal: aroma doce e amanteigado de panetone num copo de vidro.',
    tone: '#b3262f', bg: '#f6e3dc', ink: '#6d1c22',
    variants: [{ label: 'Rótulo vermelho natalino', front: 'vela-biscoitos-frente', angle: 'vela-biscoitos-angulo', shop: 'vela-aromatica-panetone-natal-perfumada-copo-de-vidro' }],
    items: ['Vela aromática de panetone em copo de vidro', 'Rótulo vermelho com bengalinhas, biscoitos e flocos de neve', 'Caixa transparente'],
    tall: true,
  },
  {
    id: 'vela-gingerbread', name: 'Vela Gingerbread', hug: 1,
    tagline: 'Aroma doce e especiado de biscoito de gengibre, num copo de vidro com rótulo branco e dourado.',
    tone: '#4f6b45', bg: '#eaeee3', ink: '#2c4226',
    variants: [{ label: 'Rótulo branco e dourado', front: 'vela-natalina-frente', angle: 'vela-natalina-angulo', shop: 'vela-aromatica-gingerbread-natal-perfumada-copo-de-vidro' }],
    items: ['Vela aromática de gingerbread em copo de vidro', 'Rótulo branco e dourado com flor, pinha e ramos de pinheiro', 'Caixa transparente'],
    tall: true,
  },
];

export const INGREDIENTS = [
  { name: 'Aroeira', img: 'aroeira', color: '#a8323e', line: 'A pimenta-rosa dos quintais brasileiros.', kits: ['Caixa Prata', 'Kit Clássico', 'Kit Delicado', 'Presente Variado', 'Raio de Sol'] },
  { name: 'Barbatimão', img: 'barbatimao', color: '#2f5240', line: 'Árvore do cerrado, de casca generosa.', kits: ['Caixa Prata', 'Kit Clássico', 'Kit da Casa', 'Presente Variado', 'Raio de Sol'] },
  { name: 'Calêndula', img: 'calendula', color: '#d98d1f', line: 'Flor dourada, cor de sol de fim de tarde.', kits: ['Caixa Prata', 'Laço de Natal', 'Kit Clássico', 'Especiarias', 'Presente Variado', 'Raio de Sol'] },
  { name: 'Própolis', img: 'propolis', color: '#a87822', line: 'Um tesouro guardado pelas abelhas.', kits: ['Kit da Casa', 'Presente Variado', 'Raio de Sol'] },
  { name: 'Coco', img: 'coco', color: '#6f9238', line: 'Lembrança de praia em pleno dezembro.', kits: ['Kit Clássico', 'Kit Delicado', 'Laço Tropical', 'Especiarias', 'Presente Variado', 'Raio de Sol'] },
  { name: 'Açafrão', img: 'acafrao', color: '#c0602a', line: 'Raiz dourada, com cor de especiaria.', kits: ['Kit da Casa', 'Presente Variado', 'Raio de Sol'] },
  { name: 'Barbatimão e Aroeira', img: 'barbatimao-aroeira', color: '#7a2a2c', line: 'O encontro do cerrado com a pimenta-rosa, num só sabonete.', kits: ['Laço de Natal', 'Kit da Casa', 'Laço Tropical', 'Presente Variado', 'Raio de Sol'] },
];

const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
const leaf = '<svg class="ing-card__leaf" viewBox="0 0 120 160" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.3"><path d="M20 150C50 100 70 60 104 10"/><path d="M44 112c-20-10-26-30-20-48 16 10 25 28 20 48Zm16-30c-16-12-18-30-11-44 14 12 20 27 11 44Zm18-28c-12-12-14-27-6-40 12 10 16 24 6 40Zm-24 62c22 0 36-14 40-30-19-1-34 8-40 30Zm16-32c22-1 34-13 40-30-18 0-34 9-40 30Zm18-30c20-2 32-14 36-29-17 0-31 10-36 29Z"/></g></svg>';

export function renderKits(track) {
  track.innerHTML = sizeImages(KITS.map((k, i) => {
    const v = k.variants[0];
    const model = k.model || k.variants.find((x) => x.model)?.model; // modelo 3D do kit ou de alguma combinação
    const on3d = !!(k.model || v.model);
    const all3d = !!k.model || k.variants.every((x) => x.model); // todas as combinações em 3D: a foto de ângulo nunca aparece
    const chips = k.variants.length > 1
      ? `<div class="variants" role="radiogroup" aria-label="Combinação do ${k.name}">${k.variants.map((vv, j) =>
          `<button type="button" role="radio" class="variant" aria-checked="${j === 0}" data-front="${vv.front}" data-angle="${vv.angle}" data-label="${vv.label}" data-3d="${!!(k.model || vv.model)}" data-model="${k.model || vv.model || ''}">${vv.label}</button>`).join('')}</div>`
      : `<p class="variant-fixed">${v.label}</p>`;
    return `
    <article class="kit${on3d ? ' kit--3d' : ''}" data-kit="${k.id}"${model ? ` data-model="${model}"` : ''} data-bg="${k.bg}" style="--tone:${k.tone};--kbg:${k.bg};--kink:${k.ink}" aria-labelledby="kit-${k.id}">
      <div class="kit__visual" data-cursor="girar">
        <div class="kit__plinth" aria-hidden="true"></div>
        <div class="kit__tilt">
          <img class="kit__img kit__img--front" src="/kits/${v.front}.webp" alt="${k.name}: ${v.label}" loading="lazy" decoding="async" />
          ${all3d ? '' : `<img class="kit__img kit__img--angle" src="/kits/${v.angle}.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" />`}
          <span class="kit__glare" aria-hidden="true"></span>
        </div>
        ${model ? `<canvas class="kit__gl" role="img" aria-label="${k.name} em 3D. Arraste ou use as setas para girar."></canvas>` : ''}
        <div class="kit__shadow" aria-hidden="true"></div>
        <span class="kit__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      </div>
      <div class="kit__info">
        <h3 id="kit-${k.id}">${k.itemsFor ? v.label : k.name}</h3>
        <p class="kit__tag">${k.itemsFor ? v.tag : k.tagline}</p>
        ${chips}
        <details class="kit__items">
          <summary>O que vem na caixa <span aria-hidden="true">+</span></summary>
          <ul>${(k.itemsFor ? k.itemsFor(v) : k.items).map((it) => `<li>${it}</li>`).join('')}</ul>
        </details>
        <p class="kit__price">${priceText(k, v)}</p>
        <div class="kit__actions">
          <a class="kit__add" href="${shopUrl(k, v)}" data-add="${k.id}">
            <span>Quero presentear</span>${arrow}
          </a>
          ${pageForKit(k.id) ? `<a class="text-link kit__more" href="${kitPath(pageForKit(k.id).slug)}">Conhecer ${k.name}</a>` : ''}
        </div>
      </div>
    </article>`;
  }).join(''));
}

export function renderIngredients(grid) {
  grid.innerHTML = sizeImages(INGREDIENTS.map((g, i) => `
    <button type="button" class="ing-card magic-card${i === 0 ? ' is-selected' : ''}" data-key="${g.img}" data-name="${g.name}" data-line="${g.line}" style="--ing:${g.color}" aria-pressed="false" aria-label="${g.name}: ${g.line} ${g.kits.length ? `Presente nos kits ${g.kits.join(', ')}.` : 'Sabonete avulso.'}">
      <span class="ing-card__inner">
        <span class="ing-card__face ing-card__front">
          <span class="ing-card__idx">${String(i + 1).padStart(2, '0')}</span>
          ${leaf}
          <span class="ing-card__soap"><img src="/soaps/${g.img}.webp" alt="" loading="lazy" decoding="async" /></span>
          <span class="ing-card__name">${g.name}</span>
          <span class="ing-card__meta">Sabonete vegetal · 90 g</span>
        </span>
        <span class="ing-card__face ing-card__back">
          <span class="ing-card__line">${g.line}</span>
          <span class="ing-card__kits">${g.kits.length ? `<small>Vai nos kits</small>${g.kits.map((k) => `<b>${k}</b>`).join('')}` : '<small>Disponível</small><b>Sabonete avulso</b>'}</span>
        </span>
      </span>
    </button>`).join(''));
}

export const findKit = (id) => KITS.find((k) => k.id === id);

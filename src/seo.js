// Shared facts and metadata. No inferred stock, reviews, addresses or credentials.
export const kitPath = (slug) => `/kits/${slug}/`;
export const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const serializeJSON = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const TOPICS = {
  'caixa-prata': 'Kit presente com 6 sabonetes vegetais Caixa Prata',
  'laco-de-natal': 'Kit presente de banho com óleo de amêndoa Laço de Natal',
  'feliz-natal': 'Kit Clássico de Natal com sabonetes e vela',
  'laco-tropical': 'Kit presente de banho com óleo de uva Laço Tropical',
  'especiarias-de-natal': 'Kit de Natal com sabonetes, canela e cravo',
  'quarteto-de-aromas': 'Kit Cinco Aromas para perfumar a casa',
  'aromas-do-jardim': 'Kit Aromas do Jardim em caixa dourada',
  'aroma-dourado': 'Kit aromatizador elétrico e alecrim Aroma Dourado',
  'raio-de-sol': 'Kit óleo de laranja e sabonete Raio de Sol',
  'presente-variado': 'Kit presente com 3 sabonetes vegetais sortidos',
  'oleo-de-semente-de-uva': 'Óleo de semente de uva em caixa para presente',
  'vela-de-panetone': 'Vela aromática de panetone para o Natal',
  'vela-gingerbread': 'Vela aromática de gingerbread para o Natal',
};

export function kitMetadata(page) {
  return {
    title: `${TOPICS[page.slug] || page.name} | AlquiVerde`,
    description: `${page.subtitle}. Veja os itens, as opções de embalagem e os cuidados de uso.`,
    path: kitPath(page.slug),
    image: page.box.img,
    imageAlt: `${page.name}: ${page.subtitle}`,
    noindex: !!page.draft,
  };
}

export const HOME_META = {
  title: 'Kit presente: sabonetes, aromas e kits de Natal | AlquiVerde',
  description: 'Escolha seu kit presente AlquiVerde com sabonetes vegetais, óleos, essências e velas. Compare kits de Natal e opções de autocuidado ou monte sua caixa.',
  path: '/', image: '/kits/feliz-aroeira-calendula-angulo.webp',
  imageAlt: 'Kit AlquiVerde em caixa vermelha com sabonetes, essências, vela e bucha vegetal',
};
export const BUILDER_META = {
  title: 'Monte seu kit de sabonetes para presente | AlquiVerde',
  description: 'Monte seu kit AlquiVerde: escolha uma caixa de 3, 6 ou 9 sabonetes vegetais e combine essências, óleos, vela e bucha. Veja a composição antes de decidir.',
  path: '/monte.html', image: '/kits/caixa-prata-frente.webp',
  imageAlt: 'Caixa para presente AlquiVerde com sabonetes vegetais',
};

export function seoHead(meta, { siteUrl = '', indexable = false, graph = [] } = {}) {
  const absolute = (path) => new URL(path, siteUrl).href;
  const blocked = !indexable || meta.noindex;
  return `<!-- seo:start -->
  <title>${escapeHTML(meta.title)}</title>
  <meta name="description" content="${escapeHTML(meta.description)}" />
  <meta name="robots" content="${blocked ? 'noindex, follow' : 'index, follow, max-image-preview:large'}" />
  ${siteUrl ? `<link rel="canonical" href="${escapeHTML(absolute(meta.path))}" />` : ''}
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="pt_BR" />
  <meta property="og:site_name" content="AlquiVerde · Kits para presente" />
  <meta property="og:title" content="${escapeHTML(meta.title)}" />
  <meta property="og:description" content="${escapeHTML(meta.description)}" />
  ${siteUrl ? `<meta property="og:url" content="${escapeHTML(absolute(meta.path))}" />
  <meta property="og:image" content="${escapeHTML(absolute(meta.image))}" />
  <meta property="og:image:alt" content="${escapeHTML(meta.imageAlt)}" />` : ''}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHTML(meta.title)}" />
  <meta name="twitter:description" content="${escapeHTML(meta.description)}" />
  ${siteUrl ? `<meta name="twitter:image" content="${escapeHTML(absolute(meta.image))}" />
  <meta name="twitter:image:alt" content="${escapeHTML(meta.imageAlt)}" />` : ''}
  ${graph.length ? `<script type="application/ld+json">${serializeJSON({ '@context': 'https://schema.org', '@graph': graph })}</script>` : ''}
  <!-- seo:end -->`;
}

export function schemaGraph(meta, siteUrl, page) {
  if (!siteUrl) return [];
  const absolute = (path) => new URL(path, siteUrl).href;
  const organization = { '@type': 'Organization', '@id': 'https://alquiverde.com.br/#organization', name: 'AlquiVerde', url: 'https://alquiverde.com.br/' };
  const website = { '@type': 'WebSite', '@id': absolute('/#website'), name: 'AlquiVerde · Kits para presente', url: absolute('/'), inLanguage: 'pt-BR', publisher: { '@id': organization['@id'] } };
  const webPage = { '@type': page ? 'ItemPage' : meta.path === '/' ? 'CollectionPage' : 'WebPage', '@id': absolute(meta.path), url: absolute(meta.path), name: meta.title, description: meta.description, inLanguage: 'pt-BR', isPartOf: { '@id': website['@id'] } };
  const graph = [organization, website, webPage];
  if (meta.path !== '/') {
    const breadcrumb = { '@type': 'BreadcrumbList', '@id': absolute(`${meta.path}#breadcrumb`), itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Kits para presente', item: absolute('/') },
      { '@type': 'ListItem', position: 2, name: page?.name || 'Monte seu kit', item: absolute(meta.path) },
    ] };
    webPage.breadcrumb = { '@id': breadcrumb['@id'] };
    graph.push(breadcrumb);
  }
  if (page) {
    const product = { '@type': 'Product', '@id': absolute(`${meta.path}#product`), name: page.name, description: page.subtitle, image: [absolute(page.box.img)], url: absolute(meta.path), brand: { '@type': 'Brand', name: 'AlquiVerde' } };
    webPage.mainEntity = { '@id': product['@id'] };
    // Offers require confirmed public commercial data. Current price snapshots are drafts.
    graph.push(product);
  }
  return graph;
}

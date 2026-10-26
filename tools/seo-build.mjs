import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { KIT_PAGES } from '../src/kitPages.js';
import { renderKits, renderIngredients } from '../src/kits.js';
import { kitRenderer } from '../src/kitMarkup.js';
import { HOME_META, BUILDER_META, kitMetadata, seoHead, schemaGraph, kitPath, escapeHTML } from '../src/seo.js';

export function siteSettings(env) {
  const value = env.SITE_URL?.trim();
  let siteUrl = '';
  if (value) {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error('SITE_URL deve ser uma origem HTTPS, sem subpasta, parâmetros ou credenciais.');
    siteUrl = url.origin;
  }
  return { siteUrl, indexable: !!siteUrl && env.VERCEL_ENV !== 'preview' && env.VERCEL_ENV !== 'development' };
}

export function replaceHead(html, meta, settings, page) {
  return html.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/g, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name="(?:description|robots)"[^>]*>/gi, '')
    .replace('</head>', `${seoHead(meta, { ...settings, graph: schemaGraph(meta, settings.siteUrl, page) })}\n</head>`);
}

const renderToString = (renderer) => { const target = {}; renderer(target); return target.innerHTML; };

export function seoBuild(env) {
  const settings = siteSettings(env);
  let root;
  let out;
  let building = false;
  return {
    name: 'alquiverde-static-seo',
    configResolved(config) { root = config.root; out = resolve(root, config.build.outDir); building = config.command === 'build'; },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://localhost');
        if (redirectLegacy(url, res)) return;
        const slug = url.pathname.match(/^\/kits\/([a-z0-9-]+)\/$/)?.[1];
        if (!slug) return next();
        const page = KIT_PAGES[slug];
        if (!page) { res.statusCode = 404; res.end('Kit não encontrado'); return; }
        try {
          let template = await readFile(resolve(root, 'kit.html'), 'utf8');
          template = replaceHead(template, kitMetadata(page), settings, page)
            .replace(/<div id="kitRoot">[\s\S]*?<\/div>/, `<div id="kitRoot" data-slug="${page.slug}" data-rendered="true">${kitRenderer(page).render().html}</div>`);
          const html = await server.transformIndexHtml(url.pathname, template);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (error) { next(error); }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!redirectLegacy(new URL(req.url, 'http://localhost'), res)) next();
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.path === '/index.html' || ctx.path === '/') {
          html = html.replace(/(<div class="collection__track" id="kitTrack">)[\s\S]*?(<\/div>)/, `$1${renderToString(renderKits)}$2`);
          html = html.replace(/(<div class="ing-grid" id="ingGrid">)[\s\S]*?(<\/div>)/, `$1${renderToString(renderIngredients)}$2`);
          return replaceHead(html, HOME_META, settings);
        }
        if (ctx.path === '/monte.html') return replaceHead(html, BUILDER_META, settings);
        if (ctx.path === '/kit.html' || ctx.path.startsWith('/experimentos/')) return html.replace('</head>', '<meta name="robots" content="noindex, follow" /></head>');
        return html;
      },
    },
    async closeBundle() {
      if (!building) return;
      const template = await readFile(resolve(out, 'kit.html'), 'utf8');
      const routes = [{ ...HOME_META }, { ...BUILDER_META }];
      for (const page of Object.values(KIT_PAGES)) {
        const meta = kitMetadata(page);
        const { html } = kitRenderer(page).render();
        let document = replaceHead(template, meta, settings, page)
          .replace(/<div id="kitRoot">[\s\S]*?<\/div>/, `<div id="kitRoot" data-slug="${page.slug}" data-rendered="true">${html}</div>`)
          .replace('<html lang="pt-BR">', `<html lang="pt-BR" style="--tone:${page.tone};--kbg:${page.bg};--kink:${page.ink}">`);
        const dir = resolve(out, 'kits', page.slug);
        await mkdir(dir, { recursive: true });
        await writeFile(resolve(dir, 'index.html'), document);
        routes.push(meta);
      }
      // Generic legacy page remains usable without JavaScript and is never indexed.
      const legacy = template.replace(/<div id="kitRoot">[\s\S]*?<\/div>/, `<div id="kitRoot"><section class="seo-help"><h1>Escolha seu kit de Natal</h1><p>Conheça os presentes AlquiVerde e os itens de cada caixa.</p><ul>${Object.values(KIT_PAGES).map((p) => `<li><a href="${kitPath(p.slug)}">${escapeHTML(p.name)}</a></li>`).join('')}</ul></section></div>`);
      await writeFile(resolve(out, 'kit.html'), legacy);
      const published = routes.filter((r) => settings.indexable && !r.noindex);
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${published.map((r) => `  <url><loc>${escapeHTML(new URL(r.path, settings.siteUrl).href)}</loc></url>`).join('\n')}\n</urlset>\n`;
      await writeFile(resolve(out, 'sitemap.xml'), sitemap);
      // Allow noindex pages to be fetched: blocking crawling would hide their noindex.
      await writeFile(resolve(out, 'robots.txt'), `User-agent: *\nAllow: /\n${settings.indexable ? `\nSitemap: ${settings.siteUrl}/sitemap.xml\n` : ''}`);
      await annotateImages(out, root);
      await writeFile(resolve(out, 'seo-manifest.json'), JSON.stringify({ siteUrl: settings.siteUrl || null, indexable: settings.indexable, routes: routes.map((r) => ({ path: r.path, title: r.title, noindex: !settings.indexable || !!r.noindex })) }, null, 2));
      console.log(`SEO: ${routes.length} páginas com HTML estático; ${published.length} URLs no sitemap.${!settings.indexable ? ' Revisão noindex: configure SITE_URL para produção.' : ''}`);
    },
  };
}

// Mirrors the committed Vercel redirects for local verification.
function redirectLegacy(url, res) {
  let destination;
  if (url.pathname === '/index.html') destination = '/';
  else if (/^\/kits\/[^/]+\/index.html$/.test(url.pathname)) destination = url.pathname.replace(/index\.html$/, '');
  else if (/^\/kits\/[^/.]+$/.test(url.pathname)) destination = url.pathname + '/';
  else if (url.pathname === '/kit.html' && url.searchParams.has('k')) {
    const slug = url.searchParams.get('k');
    if (!KIT_PAGES[slug]) { res.statusCode = 404; res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end('<!doctype html><html lang="pt-BR"><head><meta name="robots" content="noindex"><title>Kit não encontrado | AlquiVerde</title></head><body><main><h1>Kit não encontrado</h1><a href="/#colecao">Ver os kits de Natal</a></main></body></html>'); return true; }
    destination = kitPath(slug);
    url.searchParams.delete('k');
  }
  if (!destination) return false;
  res.writeHead(301, { Location: destination + url.search }); res.end(); return true;
}

async function annotateImages(out, root) {
  // Real dimensions generated from local files; also used by the browser renderer.
  const { sizeImages } = await import('../src/imageSizes.js');
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith('.html')) {
        let html = await readFile(path, 'utf8');
        html = sizeImages(html);
        await writeFile(path, html);
      }
    }
  }
  await walk(out);
}

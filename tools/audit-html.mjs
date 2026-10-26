import { readFile, readdir, writeFile, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { parseHTML } from 'linkedom';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const dir = resolve(root, process.env.AUDIT_DIR || 'dist');
const documents = new Map();
async function walk(folder) {
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.html')) documents.set('/' + relative(dir, path).replaceAll('\\', '/').replace(/index\.html$/, ''), parseHTML(await readFile(path, 'utf8')).document);
  }
}
await walk(dir);
const manifest = JSON.parse(await readFile(resolve(dir, 'seo-manifest.json'), 'utf8'));
const titles = new Set(); const descriptions = new Set(); const failures = []; const warnings = [];
let brokenLinks = 0; let jsonld = 0;
for (const route of manifest.routes) {
  const document = documents.get(route.path);
  try {
    assert.ok(document, `${route.path}: document exists`);
    assert.equal(document.querySelectorAll('title').length, 1, 'one title');
    const title = document.title;
    assert.ok(!titles.has(title), 'unique title'); titles.add(title);
    const desc = document.querySelector('meta[name="description"]')?.content;
    assert.ok(desc && !descriptions.has(desc), 'unique nonempty description'); descriptions.add(desc);
    assert.equal(document.querySelectorAll('h1').length, 1, 'one H1');
    assert.equal(document.documentElement.lang, 'pt-BR');
    assert.equal(document.querySelector('meta[name="robots"]').content.includes('noindex'), route.noindex);
    if (manifest.siteUrl) {
      assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 1);
      assert.equal(document.querySelector('link[rel="canonical"]').href, new URL(route.path, manifest.siteUrl).href);
      assert.equal(document.querySelector('meta[property="og:url"]').content, new URL(route.path, manifest.siteUrl).href);
      for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
        const graph = JSON.parse(script.textContent); jsonld++;
        assert.equal(graph['@context'], 'https://schema.org');
        assert.ok(graph['@graph'].some((n) => n['@type'] === 'WebSite'));
        if (route.path.startsWith('/kits/')) {
          const product = graph['@graph'].find((n) => n['@type'] === 'Product');
          assert.ok(product?.name && product?.image?.length && product?.description);
          assert.ok(!product.offers && !product.aggregateRating, 'no unverified commerce data');
          const crumbs = graph['@graph'].find((n) => n['@type'] === 'BreadcrumbList');
          assert.equal(crumbs.itemListElement.at(-1).item, product.url);
        }
      }
    } else assert.equal(document.querySelectorAll('link[rel="canonical"]').length, 0, 'no fabricated domain');
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter((h) => !h.closest('[hidden]'));
    for (let i = 1; i < headings.length; i++) if (+headings[i].tagName[1] > +headings[i-1].tagName[1] + 1) warnings.push(`${route.path}: heading jump to ${headings[i].tagName}`);
    for (const img of document.querySelectorAll('img[src]')) {
      assert.ok(img.hasAttribute('alt'), `alt for ${img.src}`);
      assert.ok(img.hasAttribute('width') && img.hasAttribute('height'), `dimensions for ${img.src}`);
    }
  } catch (error) { failures.push(`${route.path}: ${error.message}`); }
}
// Crawl assets, anchors and internal links across all built pages, including experiments.
for (const [route, document] of documents) {
  for (const img of document.querySelectorAll('img[srcset]')) {
    for (const candidate of img.getAttribute('srcset').split(',')) {
      const path = candidate.trim().split(/\s+/)[0];
      try { await stat(resolve(dir, '.' + path)); }
      catch { brokenLinks++; failures.push(`Broken responsive image: ${route} → ${path}`); }
    }
  }
  for (const node of document.querySelectorAll('a[href],img[src],script[src],link[href],video[poster],source[src]')) {
    const attribute = node.hasAttribute('href') ? 'href' : node.hasAttribute('poster') ? 'poster' : 'src';
    const value = node.getAttribute(attribute);
    if (!value || /^(?:https?:|data:|mailto:|tel:|javascript:)/.test(value)) continue;
    const url = new URL(value, `https://local.invalid${route}`);
    if (url.pathname === '/kit.html' && url.searchParams.has('k')) { failures.push(`Legacy internal link: ${route} → ${value}`); continue; }
    let file = resolve(dir, '.' + decodeURIComponent(url.pathname));
    try {
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      await stat(file);
      if (url.hash && file.endsWith('.html')) {
        const targetRoute = url.pathname.replace(/index\.html$/, '');
        const target = documents.get(targetRoute);
        if (target && !target.getElementById('app') && !target.getElementById(decodeURIComponent(url.hash.slice(1)))) warnings.push(`Anchor missing: ${route} → ${value}`);
      }
    } catch { brokenLinks++; failures.push(`Broken local resource: ${route} → ${value}`); }
  }
}
const xml = await readFile(resolve(dir, 'sitemap.xml'), 'utf8');
const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
assert.equal(locations.length, manifest.routes.filter((r) => !r.noindex).length);
const report = { pages: documents.size, contentPages: manifest.routes.length, uniqueTitles: titles.size, uniqueDescriptions: descriptions.size, schemaGraphs: jsonld, sitemapUrls: locations.length, brokenLinks, failures, warnings: [...new Set(warnings)] };
await writeFile(resolve(root, 'seo-evidence', process.env.AUDIT_DIR ? 'html-production-test.json' : 'html-after.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;

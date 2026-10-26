import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { KIT_PAGES, variantsOf } from '../src/kitPages.js';
import { kitRenderer } from '../src/kitMarkup.js';
import { kitMetadata, seoHead, schemaGraph, serializeJSON } from '../src/seo.js';
import { siteSettings } from '../tools/seo-build.mjs';

test('production, preview and invalid URL indexation controls', () => {
  assert.equal(siteSettings({}).indexable, false);
  assert.equal(siteSettings({ SITE_URL: 'https://seo-validation.invalid' }).indexable, true);
  assert.equal(siteSettings({ SITE_URL: 'https://seo-validation.invalid', VERCEL_ENV: 'preview' }).indexable, false);
  for (const bad of ['http://foo.com', 'https://foo.com/path', 'https://user:pass@foo.com', 'https://foo.com/?test=1']) assert.throws(() => siteSettings({ SITE_URL: bad }));
});

for (const page of Object.values(KIT_PAGES)) {
  test(`${page.slug}: every variant renders full content, real assets, stable metadata`, () => {
    for (let i = 0; i < variantsOf(page).length; i++) {
      for (const light of [false, true]) {
        const { html, vi } = kitRenderer(page).render(i, light);
        const { document } = parseHTML(`<html><body>${html}</body></html>`);
        assert.equal(vi, i);
        assert.equal(document.querySelectorAll('h1').length, 1);
        assert.ok(document.querySelector('#kpShop')?.href.startsWith('https://alquiverde.com.br/'));
        assert.ok(document.querySelectorAll('.kp-item').length > 0);
        assert.ok(document.querySelectorAll('.kp-card').length === Object.keys(KIT_PAGES).length - 1);
        assert.ok(document.querySelectorAll('.kp-soap').length > 0);
        assert.ok(!html.includes('undefined'));
        assert.equal(document.querySelectorAll('a[href^="/kit.html?"]').length, 0);
      }
    }
    const meta = kitMetadata(page);
    const { document } = parseHTML(`<html><head>${seoHead(meta, { siteUrl: 'https://seo-validation.invalid', indexable: true, graph: schemaGraph(meta, 'https://seo-validation.invalid', page) })}</head></html>`);
    assert.equal(document.querySelector('meta[name="robots"]').content.includes('noindex'), !!page.draft);
    const schema = JSON.parse(document.querySelector('script').textContent);
    assert.equal(schema['@graph'].find((x) => x['@type'] === 'Product').name, page.name);
  });
}

test('variant input is clamped and markup serialization prevents script injection', () => {
  const renderer = kitRenderer(KIT_PAGES['feliz-natal']);
  assert.equal(renderer.render(-20).vi, 0);
  assert.equal(renderer.render('garbage').vi, 0);
  assert.equal(renderer.render(1000).vi, variantsOf(KIT_PAGES['feliz-natal']).length - 1);
  assert.equal(serializeJSON({ text: '</script><script>alert(1)</script>' }).includes('<'), false);
});

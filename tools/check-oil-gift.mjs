import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = process.env.BASE_URL || 'http://127.0.0.1:5183';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const report = { checks: [], errors: [], missingAssets: [] };
const observe = (page) => {
  page.on('pageerror', (e) => report.errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400 && r.url().includes('/kit3d/')) report.missingAssets.push(r.url()); });
};
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  observe(page);
  const product = `${base}/kits/aromas-do-jardim/?leve=0`;
  await page.goto(product);
  const canvas = page.locator('.kp-hero__gl');
  await page.waitForSelector('.kp-hero__visual.is-3d');
  await page.waitForSelector('[data-product-state="open"]');
  assert.equal(await page.getByRole('button', { name: 'Fechar caixa', exact: true }).getAttribute('aria-expanded'), 'true');
  await page.screenshot({ path: 'seo-evidence/jardim-desktop-after.png' });
  await page.getByRole('button', { name: 'Fechar caixa', exact: true }).click();
  await page.waitForSelector('[data-product-state="closed"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'seo-evidence/jardim-closed-after.png' });
  // Both the controls and the canvas can be operated from the keyboard.
  await page.getByRole('button', { name: 'Abrir caixa', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-product-state="open"]');
  await canvas.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowUp');
  const box = await canvas.boundingBox();
  await page.mouse.move(box.x + box.width * .5, box.y + box.height * .45);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * .65, box.y + box.height * .5, { steps: 12 });
  await page.mouse.up();
  await page.getByRole('button', { name: 'Repetir abertura da caixa' }).click();
  await page.waitForSelector('[data-product-state="closing"], [data-product-state="closed"]');
  await page.waitForSelector('[data-product-state="open"]');
  report.checks.push('Product: asset loading, automatic reveal, close, keyboard open, arrow rotation, drag, replay');
  for (const viewport of [{ width: 1024, height: 768 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(500);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    assert.ok(await page.getByRole('button', { name: 'Fechar caixa', exact: true }).isVisible());
    await page.screenshot({ path: `seo-evidence/jardim-${viewport.width}-after.png` });
  }
  report.checks.push('Explicit 3D: controls remain visible and no horizontal overflow at 1024px and 390px');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${base}/?leve=0`);
  const pick = page.getByRole('button', { name: /Kit \d+ de \d+: Aromas do Jardim/ });
  await pick.click();
  await page.waitForSelector('.stage.gl-ready [data-product-state="open"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'seo-evidence/jardim-collection-after.png' });
  await page.getByRole('button', { name: /Kit \d+ de \d+: Aroma Dourado/ }).click();
  await page.waitForTimeout(700);
  await pick.click();
  await page.waitForSelector('.stage.gl-ready [data-product-state="open"]');
  assert.equal(await page.locator('.stage .product-controls:not([hidden])').count(), 1);
  report.checks.push('Collection: shared viewer switches away and back without duplicate controls or missing textures');
  await page.close();

  const reduced = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  observe(reduced);
  await reduced.addInitScript(() => {
    window.__oilDrawCalls = 0;
    for (const context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      for (const method of ['drawElements', 'drawArrays']) {
        const draw = context.prototype[method];
        context.prototype[method] = function (...args) {
          if (this.canvas.dataset.productModel === 'cinco-oleos') window.__oilDrawCalls++;
          return draw.apply(this, args);
        };
      }
    }
  });
  await reduced.goto(product);
  await reduced.waitForSelector('[data-product-state="open"]');
  await reduced.getByRole('button', { name: 'Fechar caixa', exact: true }).click();
  await reduced.waitForSelector('[data-product-state="closed"]');
  await reduced.getByRole('button', { name: 'Abrir caixa', exact: true }).click();
  await reduced.waitForSelector('[data-product-state="open"]');
  await reduced.waitForTimeout(150);
  const draws = await reduced.evaluate(() => window.__oilDrawCalls);
  await reduced.waitForTimeout(500);
  assert.ok(draws > 0);
  assert.equal(await reduced.evaluate(() => window.__oilDrawCalls), draws);
  report.checks.push('Reduced motion with explicit 3D: immediate controls and stationary rendering');
  await reduced.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  observe(mobile);
  await mobile.goto(`${base}/kits/aromas-do-jardim/`);
  await mobile.waitForSelector('html.is-light');
  assert.ok(await mobile.locator('.kp-hero__img').isVisible());
  assert.equal(await mobile.locator('.product-controls').count(), 0);
  report.checks.push('Mobile default: existing light mode and product photograph remain available');
  await mobile.close();

  const failed = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  observe(failed);
  await failed.route('**/kit3d/cinco-oleos-rotulos.webp', (route) => route.abort());
  await failed.goto(product);
  await failed.waitForSelector('[data-product-state="unavailable"]');
  assert.ok(await failed.locator('.kp-hero__img').isVisible());
  assert.equal(await failed.locator('.kp-hero__visual.is-3d').count(), 0);
  report.checks.push('Asset failure: product photograph stays visible');
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.missingAssets, []);
  console.log(JSON.stringify(report, null, 2));
} finally {
  await writeFile('seo-evidence/jardim-browser-report.json', JSON.stringify(report, null, 2));
  await browser.close();
}

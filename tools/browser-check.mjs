import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { KIT_PAGES } from '../src/kitPages.js';
import { KITS } from '../src/kits.js';
const base = process.env.BASE_URL || 'http://127.0.0.1:5182';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const report = { base, checks: [], errors: [], accessibility: [] };
try {
  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    const context = await browser.newContext({ viewport, javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(base);
    assert.equal(await page.locator('.kit').count(), KITS.length);
    assert.ok(await page.locator('h1').isVisible());
    assert.equal(await page.locator('.loader').isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.goto(`${base}/kits/feliz-natal/`);
    assert.ok(await page.locator('#kpTitle').isVisible());
    assert.equal(await page.locator('.kp-curtain').isVisible(), false);
    assert.ok(await page.locator('#kpList').textContent());
    report.checks.push(`HTML without JavaScript: home and product, ${viewport.width}px`);
    await context.close();
  }
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await mobile.newPage();
  page.on('pageerror', (error) => report.errors.push(error.message));
  await page.goto(base);
  await page.waitForSelector('.nav-toggle');
  await page.waitForFunction(() => document.documentElement.classList.contains('is-light'));
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.nav-toggle').getAttribute('aria-expanded'), 'false');
  assert.equal(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/three-[^/]+\.js/.test(r.name))), false);
  await page.screenshot({ path: 'seo-evidence/home-mobile-after.png', fullPage: false });
  report.checks.push('Mobile: automatic light mode, no Three.js download, accessible menu');
  for (const data of Object.values(KIT_PAGES)) {
    const response = await page.goto(`${base}/kits/${data.slug}/`);
    assert.equal(response.status(), 200);
    await page.waitForSelector('#kpShop');
    assert.ok(await page.locator('#kpTitle').isVisible());
    await page.locator('.kp-item__head').first().click();
    assert.equal(await page.locator('.kp-item__head').first().getAttribute('aria-expanded'), 'true');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
  }
  report.checks.push('All 12 products: HTTP 200, heading, accordion, no horizontal overflow');
  await page.goto(`${base}/kits/feliz-natal/`);
  await page.locator('.variant[data-v="1"]').click();
  assert.equal(await page.locator('#kpTitle').textContent(), 'Kit Delicado');
  assert.ok(page.url().includes('v=1'));
  assert.ok((await page.locator('.kp-hero__img').getAttribute('srcset')).includes('feliz-aroeira-coco'));
  report.checks.push('Product variants: content, URL and responsive image stay in sync');
  await page.goto(`${base}/monte.html`);
  await page.locator('.mk-size[data-size="3"]').click();
  await page.locator('#mkSurprise').click();
  assert.equal(await page.locator('#mkClose').isEnabled(), true);
  await page.locator('#mkClose').click();
  await page.locator('#mkAdd').click();
  assert.ok(await page.locator('#bagCount').textContent() !== '0');
  await page.goto(`${base}/?sacola`);
  await page.waitForSelector('#bag[aria-hidden="false"]');
  assert.ok((await page.locator('#bag').textContent()).includes('3'));
  report.checks.push('Builder → box closure → bag persists across navigation');
  await page.locator('#bagClose').click();
  await page.locator('#corpForm button[type="submit"]').click();
  assert.equal(await page.locator('#cName').getAttribute('aria-invalid'), 'true');
  report.checks.push('Corporate form: invalid input validation remains functional');
  for (const path of ['/', '/kits/caixa-prata/', '/monte.html']) {
    await page.goto(base + path);
    await page.waitForSelector('.experience-toggle');
    const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    report.accessibility.push({ path, violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target) })) });
  }
  await mobile.close();
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const full = await desktop.newPage();
  full.on('pageerror', (error) => report.errors.push(error.message));
  await full.goto(base);
  await full.waitForSelector('.kit-rail');
  assert.equal(await full.evaluate(() => document.documentElement.classList.contains('is-light')), false);
  await full.evaluate(() => document.fonts.ready);
  await full.screenshot({ path: 'seo-evidence/home-desktop-after.png', fullPage: false });
  await full.goto(`${base}/kits/caixa-prata/?leve=0`);
  await full.waitForSelector('.kp-hero__gl');
  assert.equal(await full.locator('.kp-hero__img').isVisible(), true);
  report.checks.push('Desktop: full collection rail and product 3D interface initialize');
  await desktop.close();
  for (const path of ['/nao-existe', '/kits/nao-existe/', '/kit.html?k=nao-existe']) {
    const response = await fetch(base + path, { redirect: 'manual' });
    assert.equal(response.status, 404);
  }
  const legacy = await fetch(base + '/kit.html?k=feliz-natal&v=1', { redirect: 'manual' });
  assert.equal(legacy.status, 301);
  assert.equal(legacy.headers.get('location'), '/kits/feliz-natal/?v=1');
  report.checks.push('Local HTTP: unknown paths return 404; legacy query has one 301 preserving variant');
  assert.deepEqual(report.errors, []);
  assert.ok(report.accessibility.every((page) => page.violations.length === 0), 'No automatic WCAG violations on priority pages');
} catch (error) {
  report.errors.push(error.stack); process.exitCode = 1;
} finally {
  await browser.close();
  await writeFile('seo-evidence/browser-after.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

// Isolated fixture: never place the reserved validation domain into deployable dist/.
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { KIT_PAGES } from '../src/kitPages.js';
const fixture = 'seo-evidence/production-fixture';
const env = { ...process.env, SITE_URL: 'https://seo-validation.invalid', VERCEL_ENV: 'production', AUDIT_DIR: fixture };
for (const args of [['node_modules/vite/bin/vite.js', 'build', '--outDir', fixture], ['tools/audit-html.mjs']]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
const manifest = JSON.parse(await readFile(`${fixture}/seo-manifest.json`, 'utf8'));
assert.equal(manifest.siteUrl, 'https://seo-validation.invalid');
assert.equal(manifest.indexable, true);
const publishedKits = Object.values(KIT_PAGES).filter((page) => !page.draft);
assert.equal(manifest.routes.filter((r) => !r.noindex).length, 2 + publishedKits.length);
for (const page of publishedKits) {
  assert.equal(manifest.routes.find((route) => route.path === `/kits/${page.slug}/`)?.noindex, false);
}
console.log('Production fixture validated: real deployment URL remains unset; dist/ was not replaced.');

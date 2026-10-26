// Isolated fixture: never place the reserved validation domain into deployable dist/.
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const fixture = 'seo-evidence/production-fixture';
const env = { ...process.env, SITE_URL: 'https://seo-validation.invalid', VERCEL_ENV: 'production', AUDIT_DIR: fixture };
for (const args of [['node_modules/vite/bin/vite.js', 'build', '--outDir', fixture], ['tools/audit-html.mjs']]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status || 1);
}
const manifest = JSON.parse(await readFile(`${fixture}/seo-manifest.json`, 'utf8'));
assert.equal(manifest.siteUrl, 'https://seo-validation.invalid');
assert.equal(manifest.indexable, true);
assert.equal(manifest.routes.filter((r) => !r.noindex).length, 2);
console.log('Production fixture validated: real deployment URL remains unset; dist/ was not replaced.');

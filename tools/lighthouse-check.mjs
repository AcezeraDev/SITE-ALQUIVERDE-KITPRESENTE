import { spawnSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
const base = process.env.BASE_URL || 'http://127.0.0.1:5182/';
const env = { ...process.env, CHROME_PATH: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' };
for (const mode of ['mobile', 'desktop']) {
  const args = ['node_modules/lighthouse/cli/index.js', base, '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage', '--output=json', `--output-path=seo-evidence/lighthouse-after-${mode}.json`, '--quiet'];
  if (mode === 'desktop') args.push('--preset=desktop');
  const run = spawnSync(process.execPath, args, { env, stdio: 'inherit', timeout: 180000 });
  if (run.status !== 0) throw new Error(`Lighthouse ${mode} failed: ${run.error || run.status}`);
  console.log(`Lighthouse ${mode} completed.`);
}
const summary = {};
for (const phase of ['before', 'after']) for (const mode of ['mobile', 'desktop']) {
  const r = JSON.parse(await readFile(`seo-evidence/lighthouse-${phase}-${mode}.json`, 'utf8'));
  summary[`${phase}-${mode}`] = {
    lighthouseVersion: r.lighthouseVersion, fetchTime: r.fetchTime,
    scores: Object.fromEntries(Object.entries(r.categories).map(([key, value]) => [key, value.score * 100])),
    lcpMs: r.audits['largest-contentful-paint'].numericValue,
    tbtMs: r.audits['total-blocking-time'].numericValue,
    cls: r.audits['cumulative-layout-shift'].numericValue,
    warnings: r.runWarnings,
    robotsNoindex: r.audits['is-crawlable'].score === 0,
  };
}
await writeFile('seo-evidence/lighthouse-comparison.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));

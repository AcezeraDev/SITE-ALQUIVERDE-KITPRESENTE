import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
let count = 0;
async function check(dir) {
  for (const file of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, file.name);
    if (file.isDirectory()) await check(path);
    else if (/\.(m?js)$/.test(file.name)) {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
      if (result.status !== 0) { process.stderr.write(result.stderr); process.exitCode = 1; }
      count++;
    }
  }
}
for (const dir of ['src', 'tools', 'tests', 'experimentos']) await check(resolve(root, dir));
console.log(`${count} JavaScript modules checked for syntax. This is not a TypeScript typecheck.`);

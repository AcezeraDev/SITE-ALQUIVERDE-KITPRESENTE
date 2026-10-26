import { readdir, mkdir, stat } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';
import sharp from 'sharp';
const root = resolve(import.meta.dirname, '../public');
let count = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) { if (entry.name !== 'responsive' && !['models', 'kit3d', 'soap3d'].includes(entry.name)) await walk(path); }
    else if (/\.webp$/i.test(entry.name)) {
      const meta = await sharp(path).metadata();
      for (const width of [480, 800]) {
        if (meta.width <= width) continue;
        const dest = resolve(root, 'responsive', relative(root, path).replace(/\.webp$/i, `-${width}.webp`));
        await mkdir(dirname(dest), { recursive: true });
        const updated = await stat(dest).catch(() => null);
        if (updated && updated.mtimeMs >= (await stat(path)).mtimeMs) continue;
        await sharp(path).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 76, effort: 5 }).toFile(dest);
        count++;
      }
    }
  }
}
await walk(root);
console.log(`${count} responsive WebP variants created; original files preserved.`);

import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
await mkdir(resolve(dist, 'vendor'), { recursive: true });
for (const file of ['index.html', 'favicon.svg', 'styles.css', 'tokens.css', 'base.css', 'src', 'THIRD_PARTY.md']) {
  await cp(resolve(root, file), resolve(dist, file), { recursive: true });
}
await cp(resolve(root, 'node_modules/heic-to/dist/csp/heic-to.js'), resolve(dist, 'vendor/heic-to.js'));
await cp(resolve(root, 'node_modules/heic-to/LICENSE'), resolve(dist, 'vendor/heic-to.LICENSE.txt'));
await cp(resolve(root, 'node_modules/heic-to/src'), resolve(dist, 'vendor/heic-to-source'), { recursive: true });
await writeFile(resolve(dist, '.nojekyll'), '');
console.log(`Static site built: ${dist}`);

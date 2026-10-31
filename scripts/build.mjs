import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
// Only the generated output directory is replaced on each build.
await rm(dist, { recursive: true, force: true });
await mkdir(resolve(dist, 'vendor'), { recursive: true });
for (const file of ['index.html', 'favicon.svg', 'styles.css', 'tokens.css', 'base.css', 'src', 'THIRD_PARTY.md']) {
  await cp(resolve(root, file), resolve(dist, file), { recursive: true });
}
await cp(resolve(root, 'node_modules/heic-to/dist/csp/heic-to.js'), resolve(dist, 'vendor/heic-to.js'));
await cp(resolve(root, 'node_modules/heic-to/LICENSE'), resolve(dist, 'vendor/heic-to.LICENSE.txt'));
await cp(resolve(root, 'node_modules/heic-to/src'), resolve(dist, 'vendor/heic-to-source'), { recursive: true });
const hash = createHash('sha256');
hash.update(await readFile(import.meta.filename));
async function hashPath(path) {
  const entries = await readdir(path, {withFileTypes:true});
  for (const entry of entries.sort((a,b)=>a.name.localeCompare(b.name,'en'))) {
    const file = resolve(path, entry.name);
    if (entry.isDirectory()) await hashPath(file);
    else hash.update(relative(dist,file).replaceAll('\\','/')).update('\0').update(await readFile(file));
  }
}
await hashPath(dist);
const version = hash.digest('hex').slice(0,16);
const assets = resolve(dist, 'assets', version);
await mkdir(assets, {recursive:true});
// Keep unversioned assets for visitors still running the pre-versioned entry page.
for (const file of ['styles.css', 'tokens.css', 'base.css', 'src', 'vendor']) {
  await cp(resolve(dist,file), resolve(assets,file), {recursive:true});
}
const bootstrap = (await readFile(resolve(root,'src/bootstrap.js'),'utf8')).replaceAll('\r\n','\n');
const scriptHash = createHash('sha256').update(bootstrap).digest('base64');
let html = await readFile(resolve(dist,'index.html'),'utf8');
html = html.replace('<html lang="en">', `<html lang="en" data-release="${version}">`)
  .replace(/<body([^>]*)>/, '<body$1 inert>')
  .replace('href="./styles.css"', `href="./assets/${version}/styles.css"`)
  .replace('<script type="module" src="./src/app.js"></script>', `<script type="module">${bootstrap}</script>`)
  .replace("script-src 'self';", `script-src 'self' 'sha256-${scriptHash}';`)
  .replace("connect-src 'none';", "connect-src 'self';");
await writeFile(resolve(dist,'index.html'), html);
await writeFile(resolve(dist,'release.json'), JSON.stringify({version}));
await writeFile(resolve(dist, '.nojekyll'), '');
console.log(`Static site built: ${dist} (${version})`);

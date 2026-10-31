import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';

for(const prefix of ['/id-photo-for-me','']) test(`cached ${prefix||'root'} page loads a new release without a hard refresh`,async({page})=>{
  const root=resolve(import.meta.dirname,'../..');
  const qa=resolve(root,'.qa');await mkdir(qa,{recursive:true});
  const fixture=await mkdtemp(resolve(qa,'cache-regression-'));
  let server;
  let releaseCheck;
  const startupGate=new Promise(resolve=>{releaseCheck=resolve;});
  try {
    for(const dir of ['scripts','src','node_modules/heic-to/dist/csp','node_modules/heic-to/src'])
      await mkdir(resolve(fixture,dir),{recursive:true});
    await cp(resolve(root,'scripts/build.mjs'),resolve(fixture,'scripts/build.mjs'));
    try {await cp(resolve(root,'src/bootstrap.js'),resolve(fixture,'src/bootstrap.js'));}
    catch(e){if(e.code!=='ENOENT')throw e;}
    for(const file of ['favicon.svg','THIRD_PARTY.md','node_modules/heic-to/LICENSE','node_modules/heic-to/dist/csp/heic-to.js'])
      await writeFile(resolve(fixture,file),'');
    await writeFile(resolve(fixture,'src/app.js'),"import {label} from './i18n.js';document.querySelector('#size-title').textContent=label;");
    await writeFile(resolve(fixture,'styles.css'),"@import url('./tokens.css');@import url('./base.css');");
    await writeFile(resolve(fixture,'base.css'),'');
    const html=await readFile(resolve(root,'index.html'),'utf8');
    async function build(label) {
      await writeFile(resolve(fixture,'index.html'),html.replace('<body>',`<body data-shell="${label}">`));
      await writeFile(resolve(fixture,'src/i18n.js'),`export const label='${label}';`);
      await writeFile(resolve(fixture,'tokens.css'),`:root{--release:${label};}`);
      execFileSync(process.execPath,['scripts/build.mjs'],{cwd:fixture,stdio:'pipe'});
    }
    await build('first');
    const cachedHtml=await readFile(resolve(fixture,'dist/index.html'));
    const requests=[];let manifest='normal';
    server=createServer(async(req,res)=>{
      try {
        const url=new URL(req.url,'http://localhost');requests.push(url);
        if(url.pathname.endsWith('/release.json')) await startupGate;
        if(url.pathname.endsWith('/release.json')&&manifest!=='normal') {
          res.writeHead(manifest==='unavailable'?503:200,{'Content-Type':'application/json'});
          res.end(JSON.stringify({version:'https://example.invalid/untrusted.js'}));return;
        }
        const path=url.pathname.replace(/^\/id-photo-for-me/,'');
        const entry=path==='/'||path==='/index.html';
        const file=resolve(fixture,'dist','.'+(entry?'/index.html':path));
        if(!file.startsWith(resolve(fixture,'dist')+sep)){res.writeHead(403).end();return;}
        const data=entry&&!url.searchParams.has('release')?cachedHtml:await readFile(file);
        const mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml'};
        res.writeHead(200,{'Content-Type':mime[extname(file)]||'text/plain','Cache-Control':'public, max-age=31536000'}).end(data);
      }catch{res.writeHead(404).end();}
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const url=`http://127.0.0.1:${server.address().port}${prefix}/`;
    await page.goto(url);await expect(page.locator('body')).toHaveAttribute('inert','');
    releaseCheck();await expect(page.locator('#size-title')).toHaveText('first');
    await expect(page.locator('body')).not.toHaveAttribute('inert');
    await build('second');
    const release=await readFile(resolve(fixture,'dist/release.json'),'utf8');
    await build('second');expect(await readFile(resolve(fixture,'dist/release.json'),'utf8')).toBe(release);
    await expect(page.locator('#size-title')).toHaveText('first');
    await page.goto(url);
    await expect(page.locator('#size-title')).toHaveText('second');
    await expect(page.locator('body')).toHaveAttribute('data-shell','second');
    expect(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--release').trim())).toBe('second');
    expect(requests.filter(u=>u.pathname.endsWith('/release.json')).length).toBeGreaterThanOrEqual(2);
    expect(new Set(requests.filter(u=>u.pathname.endsWith('/src/i18n.js')).map(u=>u.pathname)).size).toBe(2);
    const currentUrl=page.url();
    for(const failure of ['unavailable','invalid']) {
      manifest=failure;await page.goto(currentUrl);
      await expect(page.locator('#size-title')).toHaveText('second');
    }
  }finally{
    releaseCheck();
    if(server)await new Promise(resolve=>server.close(resolve));
    if(!fixture.startsWith(qa+sep))throw new Error('Unexpected fixture path');
    await rm(fixture,{recursive:true,force:true});
  }
});

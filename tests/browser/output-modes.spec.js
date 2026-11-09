import { openApp, reviewFraming, selectOutputMode } from './open-app.js';
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
const fixture=name=>fileURLToPath(new URL(`../fixtures/${name}`,import.meta.url));
const single=async page=>{
  await selectOutputMode(page,'single');
  await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('original');
  await reviewFraming(page);
  if(await page.locator('[name=output-quality][value=compress]').isEnabled()){await page.locator('[name=output-quality][value=compress]').check();}
};
const print=page=>page.locator('[name=output-mode][value=print]').check();
const ready=async page=>{if(await page.locator('[name=output-mode][value=single]').isChecked()){await page.locator('[name=output-quality][value=compress]').check();}await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled({timeout:15000});};
async function noise(page) {
  return Buffer.from(await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=1200;c.height=900;
    const x=c.getContext('2d'),data=x.createImageData(c.width,c.height);let seed=13;
    for(let i=0;i<data.data.length;i+=4) {
      for(let channel=0;channel<3;channel++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data.data[i+channel]=seed>>>24;}
      data.data[i+3]=255;
    }
    x.putImageData(data,0,0);return c.toDataURL('image/png').split(',')[1];
  }),'base64');
}
async function download(page) {
  const pending=page.waitForEvent('download');await page.locator('#save').click();const result=await pending;
  const bytes=await readFile(await result.path());
  const size=await page.evaluate(async base64=>{
    const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));const image=await createImageBitmap(new Blob([bytes],{type:'image/jpeg'}));
    const size=[image.width,image.height];image.close();return size;
  },bytes.toString('base64'));
  return {bytes,size,name:result.suggestedFilename()};
}

test('outer cut guides cover all four metric photo boundaries',async({page})=>{
  await openApp(page);await page.locator('#country').selectOption('pt');
  await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  const edges=await page.locator('#sheet').evaluate(c=>{
    const ctx=c.getContext('2d');return [[146,160],[3454,160],[192,137],[192,2263]].map(([x,y])=>[...ctx.getImageData(x,y,1,1).data]);
  });
  expect(edges).toEqual(Array(4).fill([114,114,114,255]));
});

test('outer cutting edges stay visible in a reduced white-photo preview',async({page})=>{
  await page.setViewportSize({width:1280,height:900});await openApp(page);
  const buffer=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=600;const x=c.getContext('2d');x.fillStyle='white';x.fillRect(0,0,600,600);return c.toDataURL('image/png').split(',')[1];}),'base64');
  await page.locator('#photo').setInputFiles({name:'white.png',mimeType:'image/png',buffer});await ready(page);
  const shot=await page.locator('#sheet').screenshot();
  const edges=await page.evaluate(async base64=>{
    const image=await createImageBitmap(new Blob([Uint8Array.from(atob(base64),c=>c.charCodeAt(0))],{type:'image/png'}));
    const c=document.createElement('canvas');c.width=image.width;c.height=image.height;const x=c.getContext('2d');x.drawImage(image,0,0);image.close();
    const sample=(a,b,w,h)=>{const p=x.getImageData(a,b,w,h).data;let dark=0;for(let i=0;i<p.length;i+=4)if(p[i]<200)dark++;return dark/(p.length/4);};
    return [sample(0,0,c.width,2),sample(0,c.height-2,c.width,2),sample(0,0,2,c.height),sample(c.width-2,0,2,c.height)];
  },shot.toString('base64'));
  for(const edge of edges)expect(edge).toBeGreaterThan(0.12);
  await page.locator('#cut-guides').uncheck();await ready(page);await expect(page.locator('#cut-preview')).toBeHidden();
});

test('Portugal uses manual head guides without borrowing another mission’s range',async({page})=>{
  await openApp(page);await page.locator('#country').selectOption('pt');
  await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await expect(page.locator('#guide-control')).toBeVisible();
  const before=await page.locator('#sheet').evaluate(c=>c.toDataURL());
  await page.locator('#guides').check();await expect(page.locator('#guide-overlay')).toBeVisible();
  await expect(page.locator('#head-reference')).toBeHidden();
  await expect(page.locator('.guide-line')).toHaveCount(2);
  expect(await page.locator('#sheet').evaluate(c=>c.toDataURL())).toBe(before);
  await page.locator('[name=language][value=zh]').check();await expect(page.locator('#guide-control')).toContainText('头部位置参考线');
  await single(page);await expect(page.locator('#guide-control')).toBeHidden();
});

test('copy selector enforces capacity and rearranges exactly the requested photos',async({page})=>{
  await openApp(page);await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await page.locator('#copies').fill('4');await ready(page);await expect(page.locator('#copies')).toHaveValue('4');
  const margin=await page.locator('#sheet').evaluate(c=>[...c.getContext('2d').getImageData(100,100,1,1).data]);expect(margin).toEqual([255,255,255,255]);
  await page.locator('#copies').fill('7');await expect(page.locator('#error')).toContainText('maximum');await expect(page.locator('#save')).toBeDisabled();
  await expect(page.locator('#copy-error')).toBeVisible();
  await page.locator('#copies').fill('6');await ready(page);await expect(page.locator('#copies')).toHaveValue('6');
  await page.locator('#country').selectOption('pt');await ready(page);await expect(page.locator('#copies')).toHaveValue('6');
  await page.locator('#copies').fill('5');await ready(page);await expect(page.locator('#copies')).toHaveValue('5');
  expect(await page.locator('#sheet').evaluate(c=>[...c.getContext('2d').getImageData(2600,1700,1,1).data])).toEqual([255,255,255,255]);
  const result=await download(page);expect(result.size).toEqual([3600,2400]);expect([...result.bytes.subarray(13,18)]).toEqual([1,2,88,2,88]);
});

test('single mode preserves a full HEIC photo and exports offline without arrangement',async({page,context})=>{
  await openApp(page);await expect(page.locator('#status')).toBeEmpty();await single(page);await context.setOffline(true);
  await page.locator('#photo').setInputFiles(fixture('quadrants.heic'));await ready(page);
  await expect(page.locator('#pixel-width')).toHaveValue('120');await expect(page.locator('#pixel-height')).toHaveValue('80');
  await expect(page.locator('#custom-fields')).toBeHidden();await expect(page.locator('#crop-controls')).toBeHidden();await expect(page.locator('#print-guides')).toBeHidden();
  const result=await download(page);expect(result.size).toEqual([120,80]);expect(result.bytes.length).toBeLessThanOrEqual(300000);expect(result.name).toBe('photo-120x80.jpg');
  await page.locator('[name=compression-target][value=pixels]').check();await page.locator('#pixel-width').fill('90');await ready(page);await expect(page.locator('#pixel-height')).toHaveValue('60');
  expect((await download(page)).size).toEqual([90,60]);
});

test('file-size and exact-pixel targets apply exclusively and show the encoded file size',async({page},info)=>{
  await openApp(page);await single(page);
  await page.locator('#photo').setInputFiles({name:'noise.png',mimeType:'image/png',buffer:await noise(page)});await ready(page);
  await expect(page.locator('[name=compression-target][value=file]')).toBeChecked();
  await page.locator('#max-kb').fill('100');await ready(page);
  const limited=await download(page);expect(limited.bytes.length).toBeLessThanOrEqual(100000);
  await expect(page.locator('#single-result')).not.toContainText(' bytes');
  await expect(page.locator('#result-size')).toHaveText((limited.bytes.length/1000).toFixed(1)+' KB');
  await page.locator('#max-kb').fill('0');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('[name=compression-target][value=pixels]').check();
  await expect(page.locator('#max-kb')).toBeHidden();await page.locator('#pixel-width').fill('1200');await ready(page);
  const exact=await download(page);expect(exact.size).toEqual([1200,900]);expect(exact.bytes.length).toBeGreaterThan(100000);
  await page.locator('.sheet').screenshot({path:`.qa/compression-pixels-${info.project.name}.png`});
  await page.locator('#pixel-width').fill('0');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('[name=compression-target][value=file]').check();await page.locator('#max-kb').fill('100');await ready(page);
  expect((await download(page)).bytes.length).toBeLessThanOrEqual(100000);await expect(page.locator('#pixel-width')).toBeHidden();
  await page.setViewportSize({width:320,height:900});await page.locator('[name=language][value=zh]').check();
  await page.locator('.sheet').screenshot({path:`.qa/compression-file-phone-${info.project.name}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test('single crop supports exact pixel dimensions and mode changes preserve print edits',async({page})=>{
  await openApp(page);await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await page.locator('#zoom').evaluate(el=>{el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));});await ready(page);
  await single(page);await page.locator('#single-fit').selectOption('crop');await page.locator('[name=compression-target][value=pixels]').check();await page.locator('#pixel-width').fill('600');
  await ready(page);
  expect((await download(page)).size).toEqual([600,600]);await expect(page.locator('#crop-controls')).toBeVisible();
  await page.locator('#single-fit').selectOption('original');await ready(page);
  await expect(page.locator('#pixel-height')).toHaveValue('900');expect((await download(page)).size).toEqual([600,900]);
  await print(page);await ready(page);await expect(page.locator('#zoom')).toHaveValue('1');expect((await download(page)).size).toEqual([3600,2400]);
  await single(page);await ready(page);await page.locator('[name=language][value=zh]').check();await expect(page.locator('#sheet-title')).toHaveText('4. 自定义输出');
});

test('a superseded compression job cannot overwrite print output or leak errors',async({page})=>{
  await openApp(page);await single(page);await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await page.locator('#max-kb').fill('1');await print(page);await ready(page);
  await expect(page.locator('#error')).toBeHidden();await expect(page.locator('#sheet')).toHaveAttribute('width','3600');expect((await download(page)).size).toEqual([3600,2400]);
});

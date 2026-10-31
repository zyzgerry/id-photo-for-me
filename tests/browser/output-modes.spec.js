import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
const fixture=name=>fileURLToPath(new URL(`../fixtures/${name}`,import.meta.url));
const single=page=>page.locator('[name=output-mode][value=single]').check();
const print=page=>page.locator('[name=output-mode][value=print]').check();
const ready=page=>expect(page.locator('#save')).toBeEnabled({timeout:15000});
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
  await page.goto('./');await page.locator('#country').selectOption('pt');
  await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  const edges=await page.locator('#sheet').evaluate(c=>{
    const ctx=c.getContext('2d');return [[73,80],[1727,80],[96,69],[96,1131]].map(([x,y])=>[...ctx.getImageData(x,y,1,1).data]);
  });
  expect(edges).toEqual(Array(4).fill([114,114,114,255]));
});

test('outer cutting edges stay visible in a reduced white-photo preview',async({page})=>{
  await page.setViewportSize({width:1280,height:900});await page.goto('./');
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

test('Portugal offers sourced head-size guides without adding them to exports',async({page})=>{
  await page.goto('./');await page.locator('#country').selectOption('pt');
  await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await expect(page.locator('#guide-control')).toBeVisible();
  const before=await page.locator('#sheet').evaluate(c=>c.toDataURL());
  await page.locator('#guides').check();await expect(page.locator('#guide-overlay')).toBeVisible();
  await expect(page.locator('#head-source')).toHaveAttribute('href',/portugal\/uk\/english\/pdf\/tech-req-for-photos.pdf/);
  await expect(page.locator('.guide-line')).toHaveCount(4);
  expect(await page.locator('#sheet').evaluate(c=>c.toDataURL())).toBe(before);
  await page.locator('#language').selectOption('zh');await expect(page.locator('#guide-control')).toContainText('显示头部尺寸参考线');
  await single(page);await expect(page.locator('#guide-control')).toBeHidden();
});

test('copy selector enforces capacity and rearranges exactly the requested photos',async({page})=>{
  await page.goto('./');await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await page.locator('#copies').fill('4');await ready(page);await expect(page.locator('#copy-count')).toHaveText('4 copies');
  const margin=await page.locator('#sheet').evaluate(c=>[...c.getContext('2d').getImageData(100,100,1,1).data]);expect(margin).toEqual([255,255,255,255]);
  await page.locator('#copies').fill('7');await expect(page.locator('#error')).toContainText('maximum');await expect(page.locator('#save')).toBeDisabled();
  await expect(page.locator('#copy-error')).toBeVisible();
  await page.locator('#use-max').click();await ready(page);await expect(page.locator('#copies')).toHaveValue('6');
  await page.locator('#country').selectOption('pt');await ready(page);await expect(page.locator('#copies')).toHaveValue('8');
  await page.locator('#copies').fill('5');await ready(page);await expect(page.locator('#copy-count')).toHaveText('5 copies');
  expect(await page.locator('#sheet').evaluate(c=>[...c.getContext('2d').getImageData(1300,850,1,1).data])).toEqual([255,255,255,255]);
  const result=await download(page);expect(result.size).toEqual([1800,1200]);expect([...result.bytes.subarray(13,18)]).toEqual([1,1,44,1,44]);
});

test('single mode preserves a full HEIC photo and exports offline without arrangement',async({page,context})=>{
  await page.goto('./');await expect(page.locator('#status')).toBeEmpty();await single(page);await context.setOffline(true);
  await page.locator('#photo').setInputFiles(fixture('quadrants.heic'));await ready(page);
  await expect(page.locator('#pixel-width')).toHaveValue('120');await expect(page.locator('#pixel-height')).toHaveValue('80');
  await expect(page.locator('#print-settings')).toBeHidden();await expect(page.locator('#crop-controls')).toBeHidden();await expect(page.locator('#print-guides')).toBeHidden();
  const result=await download(page);expect(result.size).toEqual([120,80]);expect(result.bytes.length).toBeLessThanOrEqual(300000);expect(result.name).toBe('photo-120x80.jpg');
  await page.locator('#pixel-width').fill('90');await ready(page);await expect(page.locator('#pixel-height')).toHaveValue('60');
  expect((await download(page)).size).toEqual([90,60]);
});

test('single JPEG byte limit respects minimums, rejects impossible targets, and reports actual dimensions',async({page})=>{
  test.setTimeout(90000);
  await page.goto('./');await single(page);
  await page.locator('#photo').setInputFiles({name:'noise.png',mimeType:'image/png',buffer:await noise(page)});await ready(page);
  await page.locator('#allow-resize').uncheck();await page.locator('#max-kb').fill('1');
  await expect(page.locator('#single-error')).toContainText('cannot be met');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('#allow-resize').check();await page.locator('#single-settings details summary').click();
  await page.locator('#min-width').fill('600');await page.locator('#min-height').fill('450');
  await expect(page.locator('#single-error')).toContainText('cannot be met');
  await page.locator('#min-width').fill('300');await page.locator('#min-height').fill('225');await page.locator('#max-kb').fill('100');await ready(page);
  const result=await download(page);expect(result.bytes.length).toBeLessThanOrEqual(100000);expect(result.size[0]).toBeGreaterThanOrEqual(300);expect(result.size[1]).toBeGreaterThanOrEqual(225);
  await expect(page.locator('#single-result')).toContainText(`${result.size[0]}×${result.size[1]}`);await expect(page.locator('#single-result')).toContainText(`${result.bytes.length} bytes`);
  await page.locator('#max-kb').fill('');await page.locator('#allow-resize').uncheck();await ready(page);
  const uncapped=await download(page);expect(uncapped.size).toEqual([1200,900]);expect(uncapped.bytes.length).toBeGreaterThan(100000);await expect(page.locator('#single-result')).toContainText('100/100');
});

test('single crop supports exact pixel dimensions and mode changes preserve print edits',async({page})=>{
  await page.goto('./');await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await page.locator('#zoom').evaluate(el=>{el.value='2';el.dispatchEvent(new Event('input',{bubbles:true}));});await ready(page);
  await single(page);await page.locator('#single-fit').selectOption('crop');await page.locator('#pixel-width').fill('600');await page.locator('#pixel-height').fill('600');
  await page.locator('#max-kb').fill('');await page.locator('#allow-resize').uncheck();await ready(page);
  expect((await download(page)).size).toEqual([600,600]);await expect(page.locator('#crop-controls')).toBeVisible();
  await page.locator('#single-fit').selectOption('original');await ready(page);
  await expect(page.locator('#pixel-height')).toHaveValue('900');expect((await download(page)).size).toEqual([600,900]);
  await print(page);await ready(page);await expect(page.locator('#zoom')).toHaveValue('2');expect((await download(page)).size).toEqual([1800,1200]);
  await single(page);await ready(page);await page.locator('#language').selectOption('zh');await expect(page.locator('#sheet-title')).toHaveText('JPEG 预览');
});

test('a superseded compression job cannot overwrite print output or leak errors',async({page})=>{
  await page.goto('./');await single(page);await page.locator('#photo').setInputFiles(fixture('orientation-6.jpg'));await ready(page);
  await page.locator('#pixel-width').fill('2000');await page.locator('#max-kb').fill('1');await print(page);await ready(page);
  await expect(page.locator('#error')).toBeHidden();await expect(page.locator('#sheet')).toHaveAttribute('width','1800');expect((await download(page)).size).toEqual([1800,1200]);
});

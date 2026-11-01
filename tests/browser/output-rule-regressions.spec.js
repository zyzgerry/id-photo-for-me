import {test,expect} from '@playwright/test';
import {openApp,reviewFraming} from './open-app.js';
import {readFile} from 'node:fs/promises';

async function photo(page,amplitude){
  const buffer=Buffer.from(await page.evaluate(amplitude=>{
    const c=document.createElement('canvas');c.width=c.height=1200;const x=c.getContext('2d'),d=x.createImageData(1200,1200);let seed=13;
    for(let i=0;i<d.data.length;i+=4){for(let k=0;k<3;k++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d.data[i+k]=amplitude===256?seed>>>24:128+(seed>>>24)%amplitude;}d.data[i+3]=255;}
    x.putImageData(d,0,0);return c.toDataURL('image/png').split(',')[1];
  },amplitude),'base64');
  await page.locator('#photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer});
  await expect(page.locator('#save')).toBeEnabled({timeout:15000});
}
async function download(page){
  const pending=page.waitForEvent('download');await page.locator('#save').click();const data=await readFile(await (await pending).path());
  const size=await page.evaluate(async data=>{const im=await createImageBitmap(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))]));const result=[im.width,im.height];im.close();return result;},data.toString('base64'));
  return {bytes:data.length,size};
}
test('printed document selection adds no digital byte, compression or pixel limits',async({page})=>{
  await openApp(page,'single');await page.locator('#country').selectOption('us');await page.locator('#document').selectOption('us-visa');
  expect(await page.locator('#document option').evaluateAll(options=>options.every(o=>!o.value.includes('digital')))).toBe(true);
  await photo(page,4);await page.locator('[name=output-quality][value=compress]').check();await page.locator('#max-kb').fill('150');
  await expect(page.locator('#save')).toBeEnabled({timeout:15000});expect((await download(page)).bytes).toBeLessThanOrEqual(150000);
  await photo(page,256);await page.locator('#max-kb').fill('1000');await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  const result=await download(page);expect(result.bytes).toBeGreaterThan(240000);expect(result.bytes).toBeLessThanOrEqual(1000000);
  await page.locator('#country').selectOption('cn');await expect(page.locator('#max-kb')).toHaveValue('1000');await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  await page.locator('[name=compression-target][value=pixels]').check();await page.locator('#pixel-width').fill('100');
  await expect(page.locator('#save')).toBeEnabled();expect((await download(page)).size[0]).toBe(100);
});
test('one pixel dimension is calculated and changing ratio retains the chosen editable edge',async({page},info)=>{
  await openApp(page,'single');await page.locator('#country').selectOption('schengen');await photo(page,4);
  await page.locator('[name=output-quality][value=compress]').check();await page.locator('[name=compression-target][value=pixels]').check();
  await expect(page.locator('#pixel-height')).not.toHaveAttribute('readonly','');await page.locator('#pixel-width').fill('600');
  await expect(page.locator('#pixel-height')).toHaveValue('771');await expect(page.locator('#pixel-ratio')).toContainText('35 : 45');
  await expect(page.locator('#pixel-width')).not.toHaveAttribute('readonly','');await page.locator('#pixel-height').fill('600');await expect(page.locator('#pixel-width')).toHaveValue('467');
  await page.locator('.sheet').screenshot({path:`.qa/pixel-linked-${info.project.name}.png`});
  await expect(page.locator('#change-output-ratio')).toHaveCount(0);await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('crop');
  await page.locator('#ratio-width').fill('1');await page.locator('#ratio-height').fill('1');await reviewFraming(page);
  await expect(page.locator('#pixel-width')).toHaveValue('600');await expect(page.locator('#pixel-height')).toHaveValue('600');await expect(page.locator('#save')).toBeEnabled();
  expect((await download(page)).size).toEqual([600,600]);
  await page.setViewportSize({width:320,height:900});await page.locator('#language').check();
  await expect(page.locator('#pixel-width-label')).toHaveText('宽度（自动计算）');await page.locator('.sheet').screenshot({path:`.qa/pixel-linked-phone-${info.project.name}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

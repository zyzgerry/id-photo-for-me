import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {openApp} from './open-app.js';
import {PRESETS} from '../../src/presets.js';

async function upload(page,edge){
  const buffer=Buffer.from(await page.evaluate(edge=>{
    const c=document.createElement('canvas');c.width=c.height=edge;
    const x=c.getContext('2d');x.fillStyle='#789abc';x.fillRect(0,0,edge,edge);
    return c.toDataURL('image/png').split(',')[1];
  },edge),'base64');
  await page.locator('#photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer});
  await expect(page.locator('#save')).toBeEnabled();
}

test('600-PPI sheets preserve physical size and native single-photo detail',async({page})=>{
  await openApp(page);await upload(page,1000);
  await expect(page.locator('#sheet')).toHaveAttribute('width','3600');
  await expect(page.locator('#sheet')).toHaveAttribute('height','2400');
  await expect(page.locator('#copies')).toHaveValue('6');
  let pending=page.waitForEvent('download');await page.locator('#save').click();
  const download=await pending,bytes=await readFile(await download.path());
  expect(download.suggestedFilename()).toBe('id-photo-4x6-600ppi.jpg');
  expect([...bytes.subarray(13,18)]).toEqual([1,2,88,2,88]);
  const dimensions=await page.evaluate(async data=>{
    const im=await createImageBitmap(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))]));
    const result=[im.width,im.height];im.close();return result;
  },bytes.toString('base64'));
  expect(dimensions).toEqual([3600,2400]);
  await page.locator('[name=output-mode][value=single]').check();
  await expect(page.locator('#result-pixels')).toHaveText('1000×1000 px');
  await expect(page.locator('#save')).toBeEnabled();
  pending=page.waitForEvent('download');await page.locator('#save').click();
  const single=await readFile(await (await pending).path());
  expect([...single.subarray(13,18)]).toEqual([1,1,44,1,44]);
});

test('source-detail warning follows crop resolution and does not block printing',async({page})=>{
  await openApp(page);await upload(page,1000);
  await expect(page.locator('#resolution')).toContainText('500 ppi');
  await expect(page.locator('#upscale')).toBeVisible();
  await expect(page.locator('#upscale')).toContainText('600 ppi');
  await expect(page.locator('#save')).toBeEnabled();
  await upload(page,1400);
  await expect(page.locator('#resolution')).toContainText('700 ppi');
  await expect(page.locator('#upscale')).toBeHidden();
  await page.locator('#zoom').fill('2');
  await expect(page.locator('#resolution')).toContainText('350 ppi');
  await expect(page.locator('#upscale')).toBeVisible();
});

test('embassy caveat and material restrictions are visible without opening source details',async({page},info)=>{
  await page.setViewportSize({width:320,height:812});await openApp(page);
  for(const lang of ['en','zh']){
    await page.locator(`[name=language][value=${lang}]`).check();
    await expect(page.locator('#preset-location')).toBeVisible();
    await expect(page.locator('#preset-location')).toContainText(lang==='en'?'before printing':'打印前');
    for(const country of ['bg','fr','gr','nl']){
      const p=PRESETS.find(p=>p.country===country&&p.warning);
      await page.locator('#country').selectOption(country);await page.locator('#document').selectOption(p.id);
      await expect(page.locator('#preset-warning')).toBeVisible();
      await expect(page.locator('#preset-warning')).toHaveText(p.warning[lang]);
      await expect(page.locator('#preset-note')).toBeHidden();
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    await page.screenshot({path:'.qa/requirements-'+lang+'-'+info.project.name+'.png',fullPage:true});
  }
  const france=PRESETS.find(p=>p.country==='fr'&&p.warning);
  await page.locator('#country').selectOption(france.country);
  await page.locator('#document').selectOption(france.id);
  await upload(page,600);
  await expect(page.locator('#setup-controls')).toBeHidden();
  await expect(page.locator('#setup-caveats')).toContainText(france.warning.zh);
  await expect(page.locator('#setup-caveats')).toBeVisible();
  await page.locator('[name=language][value=en]').check();
  await expect(page.locator('#setup-caveats')).toContainText(france.warning.en);
  await page.locator('#setup-toggle').click();
  await expect(page.locator('#setup-caveats')).toBeHidden();
  await expect(page.locator('#preset-warning')).toBeVisible();
  await page.locator('#custom-requirements').click();
  await expect(page.locator('#preset-warning')).toBeHidden();
  await expect(page.locator('#preset-location')).toBeHidden();
});

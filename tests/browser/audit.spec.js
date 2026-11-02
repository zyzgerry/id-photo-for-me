import { openApp, reviewFraming } from './open-app.js';
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));
const pixel = page => page.evaluate(()=>({
  crop:[...document.querySelector('#crop').getContext('2d').getImageData(100,100,1,1).data],
  sheet:[...document.querySelector('#sheet').getContext('2d').getImageData(100,100,1,1).data],
}));

test('leaving original comparison restores the edited preview in Framing',async({page})=>{
  await openApp(page);await page.locator('#photo').setInputFiles(fixture);await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#adjustments-tab').click();await page.locator('#allow-edits').check();
  await page.locator('#brightness').focus();await page.keyboard.press('End');await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  const edited=await pixel(page);expect(edited.crop).toEqual(edited.sheet);
  await page.locator('#original').check();expect((await pixel(page)).crop).not.toEqual(edited.crop);
  await page.locator('#framing-tab').click();
  await expect(page.locator('#original')).not.toBeChecked();
  const framing=await pixel(page);expect(framing.crop).toEqual(framing.sheet);expect(framing.crop).toEqual(edited.crop);
});

test('failed replacements preserve the current crop, edits and downloaded JPEG',async({page})=>{
  const {readFile}=await import('node:fs/promises');
  const download=async()=>{const pending=page.waitForEvent('download');await page.locator('#save').click();return readFile(await (await pending).path());};
  await openApp(page);await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#zoom').fill('1.8');await page.locator('#adjustments-tab').click();await page.locator('#allow-edits').check();await page.locator('#brightness').fill('8');
  await expect(page.locator('#save')).toBeEnabled();const before=await download();
  for(const buffer of [Buffer.from([255,216,255,0]),Buffer.alloc(30*1024*1024+1)]) {
    await page.locator('#photo').setInputFiles({name:'bad.jpg',mimeType:'image/jpeg',buffer});
    await expect(page.locator('#error')).toBeVisible();await expect(page.locator('#photo')).toBeEnabled();
    await expect(page.locator('#clear')).toBeEnabled();await expect(page.locator('#save')).toBeEnabled();
    await expect(page.locator('#zoom')).toHaveValue('1.8');await expect(page.locator('#brightness')).toHaveValue('8');
    expect((await download()).equals(before)).toBe(true);
  }
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#zoom')).toHaveValue('1');
  await expect(page.locator('#brightness')).toHaveValue('0');await expect(page.locator('#save')).toBeEnabled();
});

test('stalled HEIC setup times out, unlocks selection and can retry',async({page})=>{
  await page.clock.install();
  await page.addInitScript(()=>{
    const decode=HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode=function(){return decode.call(this).finally(()=>{window.photoDecodeFinished=true;});};
  });
  await page.route('**/src/decode-worker.js',route=>route.fulfill({contentType:'text/javascript',body:'await new Promise(() => {});'}));
  await page.goto('./');await expect(page.locator('body')).not.toHaveAttribute('inert');
  await page.locator('#photo').setInputFiles(fileURLToPath(new URL('../fixtures/quadrants.heic',import.meta.url)));
  await expect(page.locator('#photo')).toBeDisabled();
  await page.waitForFunction(()=>window.photoDecodeFinished);
  await page.clock.fastForward(45001);
  await expect(page.locator('#photo')).toBeEnabled();await expect(page.locator('#error')).toContainText('HEIC');
  await page.unroute('**/src/decode-worker.js');await page.clock.resume();
  await page.locator('#photo').setInputFiles(fileURLToPath(new URL('../fixtures/quadrants.heic',import.meta.url)));
  await expect(page.locator('#save')).toBeEnabled({timeout:15000});await expect(page.locator('#error')).toBeHidden();
});

test('failed HEIC setup resets the worker so a later attempt succeeds',async({page})=>{
  await page.route('**/src/decode-worker.js',route=>route.abort());
  await page.goto('./');await expect(page.locator('body')).not.toHaveAttribute('inert');
  await expect(page.locator('#status')).toContainText('could not finish');
  await page.unroute('**/src/decode-worker.js');
  await page.locator('#photo').setInputFiles(fileURLToPath(new URL('../fixtures/quadrants.heic',import.meta.url)));
  await expect(page.locator('#save')).toBeEnabled({timeout:15000});await expect(page.locator('#error')).toBeHidden();
});

test('one-pixel-wide or tall photos keep nonzero working dimensions and export',async({page})=>{
  await openApp(page,'single');await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('original');
  for(const [width,height] of [[10000,1],[1,10000]]) {
    const buffer=Buffer.from(await page.evaluate(({width,height})=>{
      const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');
      x.fillStyle='red';x.fillRect(0,0,width,height);return c.toDataURL('image/png').split(',')[1];
    },{width,height}),'base64');
    await page.locator('#photo').setInputFiles({name:'thin.png',mimeType:'image/png',buffer});
    await expect(page.locator('#save')).toBeEnabled({timeout:15000});await expect(page.locator('#error')).toBeHidden();
    const expected=width>height?'4096×1':'1×4096';await expect(page.locator('#single-result')).toContainText(`${expected} px`);
    const pending=page.waitForEvent('download');await page.locator('#save').click();
    expect((await pending).suggestedFilename()).toBe(`photo-${expected.replace('×','x')}.jpg`);
  }
});

for(const locale of ['en-US','zh-CN']) test(`failed app download offers a working reload in ${locale}`,async({browser})=>{
  const context=await browser.newContext({locale});const page=await context.newPage();
  try {
    await page.route('**/assets/*/src/app.js',route=>route.abort());await page.goto('./');
    await expect(page.getByRole('alert')).toContainText(locale==='zh-CN'?'无法加载':'could not load');
    const reload=page.getByRole('button',{name:locale==='zh-CN'?'重新加载':'Reload',exact:true});
    await expect(reload).toBeFocused();await expect(page.locator('body')).not.toHaveAttribute('inert');
    await page.unroute('**/assets/*/src/app.js');await reload.click();
    await expect(page.locator('#photo')).toBeEnabled();await expect(page.locator('body')).not.toHaveAttribute('inert');
    await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  } finally {await context.close();}
});

test('transparent PNG flattens onto white and refresh leaves no photo storage',async({page})=>{
  await openApp(page);
  const buffer=Buffer.from(await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=600;
    const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(255,0,0,0.5)';ctx.fillRect(300,0,300,600);
    return canvas.toDataURL('image/png').split(',')[1];
  }),'base64');
  await page.locator('#photo').setInputFiles({name:'transparent.png',mimeType:'image/png',buffer});await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  expect((await pixel(page)).crop).toEqual([255,255,255,255]);
  const tint=await page.locator('#sheet').evaluate(canvas=>[...canvas.getContext('2d').getImageData(800,200,1,1).data]);
  expect(tint[0]).toBe(255);expect(tint[1]).toBeGreaterThanOrEqual(126);expect(tint[1]).toBeLessThanOrEqual(128);
  expect(await page.evaluate(async()=>({databases:(await indexedDB.databases()).length,caches:(await caches.keys()).length}))).toEqual({databases:0,caches:0});
  await page.reload();await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#crop-wrap')).toBeHidden();
});

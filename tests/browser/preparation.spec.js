import {test,expect} from '@playwright/test';
import {openApp,reviewFraming} from './open-app.js';
import {fileURLToPath} from 'node:url';
const fixture=fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('US to Schengen updates the preparation crop instead of keeping the square',async({page})=>{
  await openApp(page);await page.locator('[name=output-mode][value=single]').check();
  await page.locator('#country').selectOption('us');await page.locator('#photo').setInputFiles(fixture);
  await expect(page.locator('#crop')).toBeVisible();
  await page.locator('#country').selectOption('pt');
  await expect.poll(()=>page.locator('#crop').evaluate(c=>c.width/c.height)).toBeCloseTo(35/45,2);
});

test('switching output modes carries current framing and tonal edits in both directions',async({page})=>{
  await openApp(page);await page.locator('[name=output-mode][value=print]').check();
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#zoom').fill('1.7');await page.locator('#position-controls summary').click();await page.locator('#x').fill('65');
  await page.locator('#adjustments-tab').click();await page.locator('#brightness').fill('8');
  await page.locator('[name=output-mode][value=single]').check();
  await expect(page.locator('#zoom')).toHaveValue('1.7');await expect(page.locator('#x')).toHaveValue('65');
  await page.locator('#adjustments-tab').click();await expect(page.locator('#brightness')).toHaveValue('8');
  await page.locator('#brightness').fill('11');await page.locator('[name=output-mode][value=print]').check();
  await page.locator('#adjustments-tab').click();await expect(page.locator('#brightness')).toHaveValue('11');
});

async function downloadInfo(page){
  const pending=page.waitForEvent('download');await page.locator('#save').click();
  const {readFile}=await import('node:fs/promises');const bytes=await readFile(await (await pending).path());
  return page.evaluate(async data=>{const image=await createImageBitmap(new Blob([Uint8Array.from(atob(data),c=>c.charCodeAt(0))],{type:'image/jpeg'}));const size={width:image.width,height:image.height,bytes:atob(data).length};image.close();return size;},bytes.toString('base64'));
}

async function detailPhoto(page){
  return Buffer.from(await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=1200;c.height=1600;const ctx=c.getContext('2d'),data=ctx.createImageData(c.width,c.height);let seed=31;
    for(let i=0;i<data.data.length;i+=4){for(let k=0;k<3;k++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data.data[i+k]=seed>>>24;}data.data[i+3]=255;}
    ctx.putImageData(data,0,0);return c.toDataURL('image/png').split(',')[1];
  }),'base64');
}

test('ID preparation is first and defaults to source-detail JPEG quality; compression is optional',async({page},testInfo)=>{
  await page.goto('./');await expect(page.locator('body')).not.toHaveAttribute('inert');
  await expect(page.locator('[name=output-mode]').first()).toHaveValue('single');
  await expect(page.locator('[name=output-mode][value=print]')).toBeChecked();
  await page.locator('[name=output-mode][value=single]').check();
  await expect(page.locator('.mode-picker')).toContainText('Single photo');
  await expect(page.locator('#sheet-title')).toHaveText('4. Customize output');
  await page.locator('#photo').setInputFiles({name:'detail.png',mimeType:'image/png',buffer:await detailPhoto(page)});await expect(page.locator('#save')).toBeEnabled();
  await expect(page.locator('[name=output-quality][value=quality]')).toBeChecked();
  await expect(page.locator('#compression-settings')).toBeHidden();
  const preview=await page.locator('.sheet-stage').boundingBox();expect(preview.height).toBeLessThanOrEqual(270);
  const exportHeading=await page.locator('.export-title').boundingBox(), actions=await page.locator('.export-actions').boundingBox();expect(actions.y).toBeGreaterThanOrEqual(exportHeading.y+exportHeading.height);
  const best=await downloadInfo(page);expect([best.width,best.height]).toEqual([1200,1200]);await expect(page.locator('#single-result')).toContainText(new Intl.NumberFormat('en',{minimumFractionDigits:1,maximumFractionDigits:1}).format(best.bytes/1000)+' KB');await expect(page.locator('#result-quality')).toContainText('100/100');
  await page.locator('#sheet-title').scrollIntoViewIfNeeded();await page.locator('.sheet').screenshot({path:`.qa/customize-quality-${testInfo.project.name}.png`});
  await page.locator('[name=output-quality][value=compress]').check();await expect(page.locator('#save')).toBeEnabled();
  await expect(page.locator('#max-kb')).toBeVisible();await expect(page.locator('#pixel-width')).toBeHidden();
  const compressed=await downloadInfo(page);expect(compressed.bytes).toBeLessThanOrEqual(300000);expect(compressed.bytes).toBeLessThan(best.bytes);
  await page.locator('#max-kb').fill('100');await expect(page.locator('#save')).toBeEnabled();expect((await downloadInfo(page)).bytes).toBeLessThanOrEqual(100000);
  await page.locator('.sheet').screenshot({path:`.qa/customize-compression-${testInfo.project.name}.png`});
  await page.locator('[name=compression-target][value=pixels]').check();await page.locator('#pixel-width').fill('400');await expect(page.locator('#pixel-height')).toHaveValue('400');await expect(page.locator('#save')).toBeEnabled();expect((await downloadInfo(page)).width).toBeLessThanOrEqual(400);
  await page.locator('#pixel-width').fill('0');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('[name=output-quality][value=quality]').check();await expect(page.locator('#save')).toBeEnabled();expect((await downloadInfo(page)).width).toBe(1200);
  await page.locator('[name=output-quality][value=compress]').check();await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#pixel-width')).toBeVisible();
  await page.locator('#pixel-width').fill('600');await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[name=output-mode][value=print]').check();await expect(page.locator('#save')).toBeEnabled();expect((await downloadInfo(page)).width).toBe(3600);
  await page.locator('[name=output-mode][value=single]').check();await expect(page.locator('[name=output-quality][value=compress]')).toBeChecked();await expect(page.locator('#max-kb')).toHaveValue('100');
  await page.locator('#clear').click();await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#crop-wrap')).toBeHidden();
});

test('every photo format applies its own ratio in preparation mode in both languages',async({page})=>{
  test.setTimeout(120000);const {PREPARATION_PRESETS}=await import('../../src/presets.js');await openApp(page,'single');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  for(const lang of ['en','zh']){
    await page.locator('#language').setChecked((lang)==='zh');
    for(const p of PREPARATION_PRESETS){
      await page.locator('#country').selectOption(p.country);await page.locator('#document').selectOption(p.id);
      await expect(page.locator('#document')).toHaveValue(p.id);await expect(page.locator('#error')).toBeHidden();
      await expect(page.locator('#single-fit')).toHaveValue(p.fit||'crop');
      const expected=p.widthMm/p.heightMm;
      await expect.poll(()=>page.locator('#crop').evaluate(c=>c.width/c.height)).toBeCloseTo(expected,2);
      {const ratio=await page.locator('#ratio-width').inputValue()/await page.locator('#ratio-height').inputValue();expect(ratio).toBeCloseTo(p.widthMm/p.heightMm,6);}
    }
  }
});

test('phone layouts, keyboard output choices, replacement and repeated mode switches retain edits',async({page})=>{
  test.setTimeout(120000);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await openApp(page,'single');await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  await page.locator('#zoom').fill('1.4');await page.locator('#adjustments-tab').click();await page.locator('#contrast').fill('9');
  for(const width of [320,390,1440]){
    await page.setViewportSize({width,height:900});
    for(const lang of ['en','zh']){
      await page.locator('#language').setChecked((lang)==='zh');
      for(const mode of ['print','single','print','single']){await page.locator(`[name=output-mode][value=${mode}]`).check();await expect(page.locator('#zoom')).toHaveValue('1.4');await expect(page.locator('#contrast')).toHaveValue('9');await expect(page.locator('#save')).toBeEnabled({timeout:15000});}
      await page.locator('[name=output-quality][value=quality]').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('[name=output-quality][value=compress]')).toBeChecked();
      await page.keyboard.press('ArrowLeft');await expect(page.locator('[name=output-quality][value=quality]')).toBeChecked();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  }
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#zoom')).toHaveValue('1');await expect(page.locator('#contrast')).toHaveValue('0');await expect(page.locator('#save')).toBeEnabled({timeout:15000});expect(errors).toEqual([]);
});

test('custom print dimensions keep compressed preparation output proportional after switching modes',async({page})=>{
  await openApp(page,'print');await page.locator('#custom-requirements').click();await page.locator('#width').fill('40');await page.locator('#height').fill('50');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[name=output-mode][value=single]').check();await page.locator('[name=output-quality][value=compress]').check();
  await expect.poll(async()=>Number(await page.locator('#pixel-width').inputValue())/Number(await page.locator('#pixel-height').inputValue())).toBeCloseTo(0.8,3);await expect(page.locator('#save')).toBeEnabled();
  const file=await downloadInfo(page);expect(file.width/file.height).toBeCloseTo(0.8,3);
});

test('a custom format too large for a print sheet can still prepare an ID photo at its chosen proportions',async({page})=>{
  await openApp(page,'print');await page.locator('#custom-requirements').click();await page.locator('#width').fill('150');await page.locator('#height').fill('140');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#error')).toContainText('does not fit');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('[name=output-mode][value=single]').check();await reviewFraming(page);
  await expect.poll(()=>page.locator('#crop').evaluate(c=>c.width/c.height)).toBeCloseTo(150/140,2);await expect(page.locator('#save')).toBeEnabled();
});

test('file-size-only compression keeps an already-small best-quality JPEG byte-for-byte unchanged',async({page})=>{
  await openApp(page,'single');await page.locator('#country').selectOption('pt');
  const buffer=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=400;c.height=515;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,400,515);g.addColorStop(0,'#e8d9ce');g.addColorStop(1,'#29465e');x.fillStyle=g;x.fillRect(0,0,400,515);return c.toDataURL('image/png').split(',')[1];}),'base64');
  await page.locator('#photo').setInputFiles({name:'small.png',mimeType:'image/png',buffer});await expect(page.locator('#save')).toBeEnabled();
  const take=async()=>{const pending=page.waitForEvent('download');await page.locator('#save').click();const {readFile}=await import('node:fs/promises');return readFile(await (await pending).path());};
  const best=await take();expect(best.length).toBeLessThan(300000);const summary=await page.locator('#single-result').textContent();
  await page.locator('[name=output-quality][value=compress]').check();await expect(page.locator('#save')).toBeEnabled();
  await expect(page.locator('#pixel-width')).toHaveValue('400');expect((await take()).equals(best)).toBe(true);await expect(page.locator('#single-result')).toHaveText(summary);
  await page.locator('#max-kb').fill('200');await expect(page.locator('#save')).toBeEnabled();expect((await take()).equals(best)).toBe(true);
  await page.locator('#zoom').fill('1.2');await expect(page.locator('#save')).toBeEnabled();const zoomed=await take();
  await page.locator('[name=output-quality][value=quality]').check();await expect(page.locator('#save')).toBeEnabled();expect((await take()).equals(zoomed)).toBe(true);
  await page.locator('#zoom').fill('1');await page.locator('[name=output-quality][value=compress]').check();await expect(page.locator('#save')).toBeEnabled();expect((await take()).equals(best)).toBe(true);
  await page.locator('[name=compression-target][value=pixels]').check();await page.locator('#pixel-width').fill('413');await expect(page.locator('#pixel-height')).toHaveValue('531');await expect(page.locator('#save')).toBeEnabled();expect((await take()).equals(best)).toBe(false);
});

test('reset pixels recovers invalid overrides without changing framing',async({page})=>{
  await openApp(page,'single');await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[name=output-quality][value=compress]').check();
  await page.locator('#max-kb').fill('200');await page.locator('[name=compression-target][value=pixels]').check();
  const width=await page.locator('#pixel-width').inputValue(),height=await page.locator('#pixel-height').inputValue();
  await page.locator('#pixel-width').fill('1');await page.locator('#pixel-height').fill('');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('#reset-pixels').click();
  await expect(page.locator('#pixel-width')).toHaveValue(width);await expect(page.locator('#pixel-height')).toHaveValue(height);
  await expect(page.locator('#max-kb')).toHaveValue('200');await expect(page.locator('#single-error')).toBeHidden();await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#zoom').fill('1.5');await page.locator('#reset-pixels').click();
  await expect(page.locator('#zoom')).toHaveValue('1.5');expect(Number(await page.locator('#pixel-width').inputValue())).toBeLessThan(Number(width));
  await expect(page.locator('#min-width')).toHaveCount(0);await expect(page.locator('#allow-resize')).toHaveCount(0);
  await page.locator('#language').check();await expect(page.locator('#reset-pixels')).toHaveText('重置像素尺寸');
});

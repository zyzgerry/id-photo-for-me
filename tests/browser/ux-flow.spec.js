import { test, expect } from '@playwright/test';
import { openApp } from './open-app.js';
import { fileURLToPath } from 'node:url';
const fixture=fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('requirements precede upload and editing, with output inactive before upload',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await openApp(page);
  await expect(page.locator('.intro')).toContainText('print or online');
  await expect(page.locator('.mode-example')).toHaveCount(2);
  await expect(page.locator('#copies')).toBeDisabled();
  await page.screenshot({path:`.qa/ux-phone-${testInfo.project.name}.png`,fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`.qa/ux-desktop-${testInfo.project.name}.png`});
  await page.setViewportSize({width:390,height:844});
  const boxes=await Promise.all(['.mode-picker','.settings','.setup','.editor','.sheet'].map(s=>page.locator(s).boundingBox()));
  for(let i=1;i<boxes.length;i++) expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i-1].y+boxes[i-1].height);
  await page.locator('[name=output-mode][value=print]').focus();await page.keyboard.press('Tab');
  await expect(page.locator('#custom-requirements')).toBeFocused();
  await page.locator('#custom-requirements').click();await expect(page.locator('#country')).toHaveValue('custom');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  await expect(page.locator('#copies')).toBeEnabled();expect(errors).toEqual([]);
});


test('changing requirements preserves edits, blocks export for review, and retains mode state',async({page})=>{
  await openApp(page);await page.locator('#country').selectOption('pt');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#zoom').fill('1.5');await page.locator('#adjustments-tab').click();
  await page.locator('#brightness').fill('8');await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#country').selectOption('us');await expect(page.locator('#framing-review')).toBeVisible();
  await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#brightness')).toHaveValue('8');
  await page.locator('#review-framing').click();await expect(page.locator('#crop')).toBeFocused();
  await expect(page.locator('#zoom')).toHaveValue('1.5');await page.locator('#confirm-framing').click();await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[value=single][name=output-mode]').check();await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('crop');
  await page.locator('#ratio-width').fill('3');await page.locator('#ratio-height').fill('4');
  await page.locator('#confirm-framing').click();await page.locator('[name=output-quality][value=compress]').check();await page.locator('#pixel-settings').evaluate(el=>el.open=true);await page.locator('#pixel-width').fill('600');await expect(page.locator('#pixel-height')).toHaveValue('800');
  await page.locator('[value=print][name=output-mode]').check();await expect(page.locator('#country')).toHaveValue('custom');
  await expect(page.locator('#zoom')).toHaveValue('1.5');
  await page.locator('[value=single][name=output-mode]').check();await expect(page.locator('#country')).toHaveValue('custom');
  await expect(page.locator('#pixel-width')).toHaveValue('600');await expect(page.locator('#pixel-height')).toHaveValue('800');
  await expect(page.locator('#framing-review')).toBeHidden();await expect(page.locator('#save')).toBeEnabled();
});

test('digital presets apply before upload, preserve crop ratios, and enforce actual encoded constraints',async({page})=>{
  await openApp(page);await page.locator('[value=single][name=output-mode]').check();
  await page.locator('#country').selectOption('cn');await page.locator('#document').selectOption('cn-visa-kul-digital');await page.locator('#pixel-settings').evaluate(el=>el.open=true);await expect(page.locator('#pixel-width')).toHaveValue('420');
  await expect(page.locator('#ratio-width')).toHaveValue('420');await expect(page.locator('#ratio-height')).toHaveValue('560');
  // Independent synthetic detail provides enough JPEG data to exercise both byte bounds.
  const buffer=Buffer.from(await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=600;c.height=800;const ctx=c.getContext('2d');const data=ctx.createImageData(600,800);
    let seed=17;for(let i=0;i<data.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;data.data[i]=seed&255;data.data[i+1]=(seed>>>8)&255;data.data[i+2]=(seed>>>16)&255;data.data[i+3]=255;}
    ctx.putImageData(data,0,0);return c.toDataURL('image/png').split(',')[1];
  }),'base64');
  await page.locator('#photo').setInputFiles({name:'detail.png',mimeType:'image/png',buffer});await page.locator('[name=output-quality][value=compress]').check();await expect(page.locator('#save')).toBeEnabled();
  await expect(page.locator('#pixel-width')).toHaveValue('420');await expect(page.locator('#pixel-height')).toHaveValue('560');
  const pending=page.waitForEvent('download');await page.locator('#save').click();
  const {readFile}=await import('node:fs/promises');const bytes=await readFile(await (await pending).path());
  expect(bytes.length).toBeGreaterThanOrEqual(40000);expect(bytes.length).toBeLessThanOrEqual(120000);
  await page.locator('#pixel-width').fill('421');await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#single-error')).toBeVisible();
  await page.locator('#country').selectOption('gb');await page.locator('#document').selectOption('gb-passport-digital');await expect(page.locator('#single-fit')).toHaveValue('original');await expect(page.locator('#single-fit')).toBeDisabled();
  await expect(page.locator('#crop-controls')).toBeHidden();await page.locator('#adjustments-tab').click();await expect(page.locator('#allow-edits')).toBeDisabled();
  await page.locator('#country').selectOption('ca');await expect(page.locator('#size-readout')).toContainText('35×45');
  await page.locator('#country').selectOption('schengen');await expect(page.locator('#size-readout')).toContainText('35×45');
  await page.locator('#language').selectOption('zh');await expect(page.locator('#preset-note')).toContainText('葡萄牙');
});

test('full-photo mode ignores hidden crop errors and relinks a replacement photo across modes',async({page})=>{
  await openApp(page);await page.locator('[value=single][name=output-mode]').check();
  await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('crop');await page.locator('#ratio-width').fill('0');
  await page.locator('#single-fit').selectOption('original');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#country').selectOption('gb');await page.locator('#document').selectOption('gb-passport-digital');await page.locator('#confirm-framing').click();
  await page.locator('[value=print][name=output-mode]').check();
  const buffer=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1000;const ctx=c.getContext('2d');ctx.fillStyle='#a67d53';ctx.fillRect(0,0,1600,1000);return c.toDataURL('image/png').split(',')[1];}),'base64');
  await page.locator('#photo').setInputFiles({name:'landscape.png',mimeType:'image/png',buffer});await expect(page.locator('#error')).toContainText('online application');
  await page.locator('[value=single][name=output-mode]').check();
  await expect(page.locator('#pixel-width')).toHaveValue('1200');await expect(page.locator('#pixel-height')).toHaveValue('750');
});

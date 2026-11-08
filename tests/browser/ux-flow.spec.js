import { test, expect } from '@playwright/test';
import { openApp } from './open-app.js';
import { fileURLToPath } from 'node:url';
const fixture=fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('requirements precede upload and editing, with output inactive before upload',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await openApp(page);
  await expect(page.locator('.intro')).toContainText('printing or upload');
  await expect(page.locator('.intro .mode-picker')).toHaveCount(0);
  await expect(page.locator('.intro .result-example')).toHaveCount(2);
  await expect(page.locator('.mode-picker .mini-mockup')).toHaveCount(2);
  await expect(page.locator('.sheet .mode-picker')).toBeVisible();
  await expect(page.locator('#copies')).toBeDisabled();
  await page.screenshot({path:`.qa/ux-phone-${testInfo.project.name}.png`,fullPage:true});
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`.qa/ux-desktop-${testInfo.project.name}.png`});
  await page.setViewportSize({width:390,height:844});
  const boxes=await Promise.all(['.settings','.setup','.editor','.sheet'].map(s=>page.locator(s).boundingBox()));
  for(let i=1;i<boxes.length;i++) expect(boxes[i].y).toBeGreaterThanOrEqual(boxes[i-1].y+boxes[i-1].height);
  await page.locator('[name=output-mode][value=single]').focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('[name=output-mode][value=print]')).toBeChecked();
  await page.locator('#custom-requirements').click();await expect(page.locator('#custom-requirements')).toHaveAttribute('aria-selected','true');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  await expect(page.locator('#copies')).toBeEnabled();expect(errors).toEqual([]);
});


test('changing requirements preserves edits, blocks export for review, and retains mode state',async({page})=>{
  await openApp(page);await page.locator('#country').selectOption('pt');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#zoom').fill('1.5');await page.locator('#adjustments-tab').click();
  await page.locator('#brightness').fill('8');await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#country').selectOption('us');await expect(page.locator('#framing-review')).toBeVisible();
  await expect(page.locator('#export-status')).toBeEmpty();
  await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#brightness')).toHaveValue('8');
  await page.locator('#review-framing').click();await expect(page.locator('#crop')).toBeFocused();
  await expect(page.locator('#zoom')).toHaveValue('1.5');await page.locator('#confirm-framing').click();await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[value=single][name=output-mode]').check();await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('crop');
  await page.locator('#ratio-width').fill('3');await page.locator('#ratio-height').fill('4');
  await page.locator('#confirm-framing').click();await page.locator('[name=output-quality][value=compress]').check();await page.locator('[name=compression-target][value=pixels]').check();await page.locator('#pixel-width').fill('600');await expect(page.locator('#pixel-height')).toHaveValue('800');
  await page.locator('[value=print][name=output-mode]').check();await expect(page.locator('#custom-requirements')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#zoom')).toHaveValue('1.5');
  await page.locator('[value=single][name=output-mode]').check();await expect(page.locator('#custom-requirements')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#pixel-width')).toHaveValue('600');await expect(page.locator('#pixel-height')).toHaveValue('800');
  await expect(page.locator('#framing-review')).toBeHidden();await expect(page.locator('#save')).toBeEnabled();
});

test('full-photo mode ignores hidden crop errors and relinks a replacement photo across modes',async({page})=>{
  await openApp(page);await page.locator('[value=single][name=output-mode]').check();
  await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('crop');await page.locator('#ratio-width').fill('0');
  await page.locator('#single-fit').selectOption('original');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();

  await page.locator('[value=print][name=output-mode]').check();
  const buffer=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1000;const ctx=c.getContext('2d');ctx.fillStyle='#a67d53';ctx.fillRect(0,0,1600,1000);return c.toDataURL('image/png').split(',')[1];}),'base64');
  await page.locator('#photo').setInputFiles({name:'landscape.png',mimeType:'image/png',buffer});await expect(page.locator('#error')).toBeHidden();
  await page.locator('[value=single][name=output-mode]').check();
  await expect(page.locator('#single-fit')).toHaveValue('crop');await expect(page.locator('#save')).toBeEnabled();
});

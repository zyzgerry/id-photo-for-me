import { test, expect } from '@playwright/test';
import { openApp } from './open-app.js';
import { fileURLToPath } from 'node:url';
const fixture=fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('requirements precede upload and editing, with output inactive before upload',async({page},testInfo)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});await openApp(page);
  await expect(page.locator('#intro-title')).toHaveText('Make an ID‑ready photo');
  const example=page.locator('.photo-example');
  await expect(example).toBeVisible();
  await expect(example.locator('img')).toHaveCount(3);
  await expect.poll(()=>example.locator('img').evaluateAll(images=>images.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);
  await expect(page.locator('.wordmark')).not.toHaveAttribute('href');
  await expect(page.locator('.file-button')).toBeInViewport({ratio:1});
  await expect(page.locator('#size-readout')).toBeInViewport({ratio:1});
  const fieldBoxes=()=>Promise.all(['#country','#document'].map(selector=>page.locator(selector).boundingBox()));
  const [countryField,documentField]=await fieldBoxes();
  expect(countryField.y).toBeCloseTo(documentField.y);
  expect(countryField.width).toBeCloseTo(documentField.width);
  await page.setViewportSize({width:320,height:640});
  const [narrowCountry,narrowDocument]=await fieldBoxes();
  expect(narrowDocument.y).toBeGreaterThanOrEqual(narrowCountry.y+narrowCountry.height);
  await page.locator('.file-button').scrollIntoViewIfNeeded();
  await expect(page.locator('.file-button')).toBeInViewport({ratio:1});
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('#crop-empty .empty-portrait')).toBeVisible();
  await expect(page.locator('#tool-tabs')).toBeHidden();
  await expect(page.locator('.mode-picker .mini-mockup')).toHaveCount(2);
  await expect(page.locator('.sheet .mode-picker')).toBeHidden();
  await expect(page.locator('#save')).toBeHidden();
  await expect(page.locator('#copies')).toBeDisabled();
  await expect(page.locator('#reference')).toBeHidden();
  await page.locator('.requirements summary').press('Enter');
  await expect(page.locator('#reference')).toBeVisible();
  await page.locator('.requirements summary').press('Enter');
  await page.screenshot({path:`.qa/ux-phone-${testInfo.project.name}.png`,fullPage:true});
  await page.setViewportSize({width:320,height:700});
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  const englishIntro=await page.locator('.intro').boundingBox();
  await page.locator('[name=language][value=zh]').check();
  await expect(page.locator('#intro-title')).toHaveText('制作证件照');
  await expect(example.locator('[data-i18n=examplePrint]')).toHaveText('4×6 英寸打印排版');
  await expect(example.getByRole('img',{name:'白色背景的裁剪人像'})).toBeVisible();
  await page.getByRole('radio',{name:'中文'}).click();
  await expect(page.locator('html')).toHaveAttribute('lang','zh-Hans');
  expect((await page.locator('.intro').boundingBox()).height).toBeCloseTo(englishIntro.height,0);
  await page.locator('[name=language][value=en]').check();
  await page.evaluate(()=>document.documentElement.style.removeProperty('font-size'));
  await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`.qa/ux-desktop-${testInfo.project.name}.png`});
  await page.setViewportSize({width:390,height:844});
  const boxes=await Promise.all(['.settings','.setup','.editor','.sheet'].map(s=>page.locator(s).boundingBox()));
  for(let i=1;i<boxes.length;i++) expect(boxes[i].y-(boxes[i-1].y+boxes[i-1].height)).toBeGreaterThanOrEqual(23);
  const exampleBox=await example.boundingBox();
  expect(boxes[0].y-(exampleBox.y+exampleBox.height)).toBeGreaterThanOrEqual(23);
  await page.locator('#output-options-toggle').press('Enter');
  await page.locator('[name=output-mode][value=single]').focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('[name=output-mode][value=print]')).toBeChecked();
  await page.locator('#custom-requirements').click();await expect(page.locator('#custom-requirements')).toHaveAttribute('aria-selected','true');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  await expect(page.locator('#crop')).toBeFocused();
  await expect(page.locator('#setup-controls')).toBeHidden();
  await expect(page.locator('#setup-summary')).toContainText('Custom size');
  await page.locator('#setup-toggle').press('Enter');
  await expect(page.locator('#custom-requirements')).toBeFocused();
  await expect(page.locator('#setup-controls')).toBeVisible();
  await page.locator('#setup-toggle').press('Enter');
  await expect(page.locator('#setup-controls')).toBeHidden();
  await expect(page.locator('#setup-toggle')).toBeFocused();
  await page.setViewportSize({width:1024,height:844});
  await expect(page.locator('#custom-requirements')).toBeFocused();
  await expect(page.locator('#setup-toggle')).toBeHidden();
  await expect(page.locator('#copies')).toBeEnabled();expect(errors).toEqual([]);
});


test('upload preserves focus when the user moves on during decoding',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openApp(page);
  await page.evaluate(()=>{
    const decode=HTMLImageElement.prototype.decode;
    HTMLImageElement.prototype.decode=async function(){
      await new Promise(resolve=>{window.resumePhotoDecode=resolve;});
      return decode.call(this);
    };
  });
  await page.locator('#photo').setInputFiles(fixture);
  await page.waitForFunction(()=>typeof window.resumePhotoDecode==='function');
  const language=page.locator('[name=language][value=en]');
  await language.focus();
  await page.evaluate(()=>window.resumePhotoDecode());
  await expect(page.locator('#save')).toBeEnabled();
  await expect(language).toBeFocused();
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

test('custom output modes share proportions without rewriting the entered crop ratio',async({page})=>{
  await openApp(page,'single');
  await page.locator('#custom-requirements').click();
  await page.locator('#ratio-width').fill('1');await page.locator('#ratio-height').fill('1000');
  await page.locator('[value=print][name=output-mode]').check();
  await page.locator('[value=single][name=output-mode]').check();
  await expect(page.locator('#ratio-width')).toHaveValue('1');
  await expect(page.locator('#ratio-height')).toHaveValue('1000');
  await expect(page.locator('#error')).toBeHidden();

  await page.locator('[value=print][name=output-mode]').check();
  await page.locator('#width').fill('40');await page.locator('#height').fill('50');
  await page.locator('[value=single][name=output-mode]').check();
  await expect(page.locator('#ratio-width')).toHaveValue('40');
  await expect(page.locator('#ratio-height')).toHaveValue('50');
});

test('custom full-photo framing survives an output round trip',async({page})=>{
  await openApp(page,'single');
  await page.locator('#custom-requirements').click();
  await page.locator('#single-fit').selectOption('original');
  await page.locator('#photo').setInputFiles(fixture);
  await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[value=print][name=output-mode]').check();
  await expect(page.locator('#height')).toHaveValue('52.5');
  await page.locator('[value=single][name=output-mode]').check();
  await expect(page.locator('#single-fit')).toHaveValue('original');
  await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[value=print][name=output-mode]').check();
  await page.locator('#zoom').fill('1.5');
  await page.locator('[value=single][name=output-mode]').check();
  await expect(page.locator('#single-fit')).toHaveValue('crop');
  await expect(page.locator('#zoom')).toHaveValue('1.5');
});

test('full-photo mode ignores hidden crop errors and relinks a replacement photo across modes',async({page})=>{
  await openApp(page,'single');
  await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('crop');await page.locator('#ratio-width').fill('0');
  await page.locator('#single-fit').selectOption('original');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();

  await page.locator('[value=print][name=output-mode]').check();
  const buffer=Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1000;const ctx=c.getContext('2d');ctx.fillStyle='#a67d53';ctx.fillRect(0,0,1600,1000);return c.toDataURL('image/png').split(',')[1];}),'base64');
  await page.locator('#photo').setInputFiles({name:'landscape.png',mimeType:'image/png',buffer});await expect(page.locator('#error')).toBeHidden();
  await page.locator('[value=single][name=output-mode]').check();
  await expect(page.locator('#single-fit')).toHaveValue('crop');await expect(page.locator('#save')).toBeEnabled();
});

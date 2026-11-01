import {test,expect} from '@playwright/test';
import {openApp} from './open-app.js';

test('requirements tabs hide locked fields, retain selections and support keyboard and languages',async({page},info)=>{
  await openApp(page,'single');
  await expect(page.locator('#size-title')).toHaveText('1. Photo Dimensions Requirements');
  await expect(page.locator('#document-requirements')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#digital-framing')).toBeHidden();
  await expect(page.locator('#country option[value=custom]')).toHaveCount(0);
  await page.locator('#country').selectOption('schengen');
  const document=await page.locator('#document').inputValue();
  await page.locator('.settings').screenshot({path:`.qa/requirements-document-${info.project.name}.png`});
  await page.locator('#document-requirements').focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('#custom-requirements')).toBeFocused();
  await expect(page.locator('#country')).toBeHidden();
  await expect(page.locator('#single-fit')).toBeEnabled();
  await page.locator('#single-fit').selectOption('crop');
  await page.locator('#ratio-width').fill('4');await page.locator('#ratio-height').fill('5');
  await page.locator('#language').check();
  await expect(page.locator('#custom-requirements')).toHaveAttribute('aria-selected','true');
  await expect(page.locator('#ratio-width')).toHaveValue('4');
  await page.setViewportSize({width:320,height:900});
  await page.locator('.settings').screenshot({path:`.qa/requirements-custom-phone-${info.project.name}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.locator('#custom-requirements').focus();await page.keyboard.press('Home');
  await expect(page.locator('#country')).toHaveValue('schengen');
  await expect(page.locator('#document')).toHaveValue(document);
  await expect(page.locator('#digital-framing')).toBeHidden();
});

test('custom crop ratio and full-photo framing survive document-tab round trips',async({page})=>{
  await openApp(page,'single');
  await page.locator('#custom-requirements').click();
  await page.locator('#single-fit').selectOption('crop');
  await page.locator('#ratio-width').fill('4');await page.locator('#ratio-height').fill('5');
  const {fileURLToPath}=await import('node:url');
  await page.locator('#photo').setInputFiles(fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url)));
  await expect(page.locator('#crop')).toBeVisible();
  for(const fit of ['crop','original']){
    await page.locator('#single-fit').selectOption(fit);
    await page.locator('#document-requirements').click();
    await page.locator('#country').selectOption('us');await page.locator('#document').selectOption('us-passport');
    await page.locator('#custom-requirements').click();
    await expect(page.locator('#single-fit')).toHaveValue(fit);
    await expect(page.locator('#ratio-width')).toHaveValue('4');await expect(page.locator('#ratio-height')).toHaveValue('5');
    await expect(page.locator('#framing-review')).toBeVisible();await page.locator('#confirm-framing').click();
    await expect(page.locator('#save')).toBeEnabled();
    await expect.poll(()=>page.locator('#crop').evaluate(c=>c.width/c.height)).toBeCloseTo(fit==='crop'?4/5:2/3,2);
  }
});

import {test,expect} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {openApp} from './open-app.js';
const fixture=fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('output heading precedes formats, print is default, and export is a separate section',async({page},info)=>{
  await page.goto('./');await expect(page.locator('body')).not.toHaveAttribute('inert');
  await expect(page.locator('[name=output-mode][value=print]')).toBeChecked();
  await expect(page.locator('.sheet h2')).toHaveCount(1);await expect(page.locator('#sheet-title')).toHaveText('4. Customize output');
  const heading=await page.locator('#sheet-title').boundingBox(),selector=await page.locator('.mode-picker').boundingBox();expect(heading.y+heading.height).toBeLessThanOrEqual(selector.y);
  await expect(page.locator('.sheet #save')).toHaveCount(0);await expect(page.locator('.export #save')).toHaveCount(1);
  await expect(page.locator('#inspect-output')).toHaveCount(0);
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('.sheet').screenshot({path:'.qa/output-print-'+info.project.name+'.png'});
  await page.locator('[name=output-mode][value=single]').check();await expect(page.locator('#save')).toBeEnabled();
  expect(await page.locator('#output-preview').evaluate(el=>!!(el.compareDocumentPosition(document.querySelector('#output-controls'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  await page.locator('[name=output-quality][value=compress]').check();await page.locator('[name=compression-target][value=pixels]').check();await expect(page.locator('#save')).toBeEnabled();
  await page.locator('.sheet').screenshot({path:'.qa/output-custom-desktop-'+info.project.name+'.png'});
});

test('compact preview sticks during settings and remains visibly marked while output updates',async({page},info)=>{
  await page.setViewportSize({width:375,height:812});await openApp(page,'single');await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('[name=output-quality][value=compress]').check();await page.locator('[name=compression-target][value=pixels]').check();await expect(page.locator('#save')).toBeEnabled();
  const original=await page.locator('#result-size').textContent();
  // Hold only the next JPEG encode so the in-flight state is observable without a timing race.
  await page.evaluate(()=>{const original=HTMLCanvasElement.prototype.toBlob;HTMLCanvasElement.prototype.toBlob=function(callback,...args){original.call(this,blob=>{window.finishEncode=()=>callback(blob);},...args);};});
  await page.locator('#jpeg-quality').fill('45');await page.waitForFunction(()=>window.finishEncode);
  await expect(page.locator('#sheet')).toBeVisible();await expect(page.locator('#result-size')).toHaveText(original);await expect(page.locator('#preview-status')).toContainText('Updating');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('#sheet').click();await expect(page.locator('#jpeg-viewer')).toBeVisible();await page.locator('#viewer-close').click();await expect(page.locator('#save')).toBeDisabled();
  await page.evaluate(()=>window.finishEncode());await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#jpeg-quality').fill('0');await expect(page.locator('#sheet')).toBeVisible();await expect(page.locator('#single-result')).toBeVisible();await expect(page.locator('#preview-status')).toContainText('Previous');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('#language').check();await expect(page.locator('#preview-status')).toContainText('上次结果');
  // Scroll the lower pixel controls below the pinned result.
  await page.locator('#reset-pixels').scrollIntoViewIfNeeded();
  const box=await page.locator('#output-preview').boundingBox();expect(box.y).toBeGreaterThanOrEqual(0);expect(box.y+box.height).toBeLessThan(812);expect(box.height).toBeLessThan(200);
  expect(await page.locator('#output-preview').evaluate(el=>getComputedStyle(el).position)).toBe('sticky');
  await page.screenshot({path:'.qa/output-custom-phone-'+info.project.name+'.png'});
  await page.setViewportSize({width:320,height:700});await page.locator('#reset-pixels').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.locator('.sheet').screenshot({path:'.qa/output-custom-320-'+info.project.name+'.png'});
  await page.setViewportSize({width:812,height:375});await page.locator('#reset-pixels').scrollIntoViewIfNeeded();expect(await page.locator('#output-preview').evaluate(el=>getComputedStyle(el).position)).toBe('sticky');
  expect((await page.locator('#output-preview').boundingBox()).height).toBeLessThan(140);
  await page.locator('#pixel-width').focus();await expect.poll(async()=>{const field=await page.locator('#pixel-width').locator('..').boundingBox(),pinned=await page.locator('#output-preview').boundingBox();return field.y-pinned.y-pinned.height;}).toBeGreaterThanOrEqual(0);
  await page.screenshot({path:'.qa/output-custom-landscape-'+info.project.name+'.png'});
});

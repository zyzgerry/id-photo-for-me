import {test,expect} from '@playwright/test';
import {fileURLToPath} from 'node:url';
import {readFile} from 'node:fs/promises';
import {openApp,reviewFraming} from './open-app.js';
const fixture=fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));
async function start(page){
  await openApp(page,'single');await page.locator('#custom-requirements').click();await page.locator('#single-fit').selectOption('original');
  await page.locator('#photo').setInputFiles(fixture);await reviewFraming(page);
  await page.locator('[name=output-quality][value=compress]').check();
  await page.locator('[name=compression-target][value=pixels]').check();
  await expect(page.locator('#save')).toBeEnabled({timeout:15000});
}
async function download(page){const event=page.waitForEvent('download');await page.locator('#save').click();return readFile(await (await event).path());}

test('custom quality is uncapped, synchronized, remembered and reset only on source replacement',async({page})=>{
  await start(page);await page.locator('#pixel-width').fill('300');await expect(page.locator('#save')).toBeEnabled();const original=await download(page);
  await expect(page.locator('#jpeg-quality')).toHaveValue('100');
  await page.locator('#pixel-width').fill('300');await page.locator('#jpeg-quality').fill('25');
  await expect(page.locator('#jpeg-quality-slider')).toHaveValue('25');await expect(page.locator('#save')).toBeEnabled();
  const custom=await download(page);expect(custom.length).toBeLessThan(original.length);
  await expect(page.locator('#result-quality')).toHaveText(/25\/100/);
  await page.locator('[name=compression-target][value=file]').check();await page.locator('#max-kb').fill('1');
  await expect(page.locator('#save')).toBeEnabled({timeout:15000});expect((await download(page)).length).toBeLessThanOrEqual(1000);
  await page.locator('[name=compression-target][value=pixels]').check();
  await expect(page.locator('#jpeg-quality')).toHaveValue('25');await expect(page.locator('#pixel-width')).toHaveValue('300');
  await expect(page.locator('#save')).toBeEnabled();expect((await download(page)).equals(custom)).toBe(true);
  await page.locator('#jpeg-quality').fill('0');await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#single-error')).toContainText('1–100');
  await page.locator('[name=compression-target][value=file]').check();await expect(page.locator('#max-kb')).toHaveValue('1');await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  await page.locator('[name=compression-target][value=pixels]').check();await page.locator('#jpeg-quality-slider').fill('1');await expect(page.locator('#jpeg-quality')).toHaveValue('1');await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#reset-pixels').click();await expect(page.locator('#jpeg-quality')).toHaveValue('1');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#jpeg-quality')).toHaveValue('100');await expect(page.locator('#save')).toBeEnabled();
});

test('close-up reads the exact downloaded JPEG, supports keyboard zoom and restores focus',async({page},info)=>{
  await start(page);await page.locator('#pixel-width').fill('1200');await page.locator('#jpeg-quality').fill('35');await expect(page.locator('#save')).toBeEnabled();
  const data=await download(page);
  await page.evaluate(()=>{const create=URL.createObjectURL.bind(URL);URL.createObjectURL=blob=>{window.inspectedBlob=blob;return create(blob);};});
  await page.locator('#inspect-output').click();await expect(page.locator('#jpeg-viewer')).toBeVisible();
  await expect(page.locator('#viewer-viewport')).not.toHaveAttribute('aria-busy','true');
  const inspected=await page.evaluate(async()=>Array.from(new Uint8Array(await window.inspectedBlob.arrayBuffer())));
  expect(Buffer.from(inspected).equals(data)).toBe(true);
  await page.locator('#viewer-actual').click();await expect(page.locator('#viewer-zoom')).toHaveText('100%');
  await page.locator('#viewer-in').click();await expect(page.locator('#viewer-zoom')).toHaveText('125%');
  await page.locator('#viewer-viewport').focus();await page.keyboard.press('+');await expect(page.locator('#viewer-zoom')).toHaveText('156%');
  await page.keyboard.press('ArrowRight');await expect.poll(()=>page.locator('#viewer-viewport').evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
  await page.keyboard.press('Escape');await expect(page.locator('#jpeg-viewer')).not.toBeVisible();
  await expect(page.locator('#viewer-image')).not.toHaveAttribute('src');
  await expect(page.locator('#inspect-output')).toBeFocused();
  await page.locator('#sheet').focus();await page.keyboard.press('Enter');await expect(page.locator('#jpeg-viewer')).toBeVisible();await expect(page.locator('#viewer-viewport')).not.toHaveAttribute('aria-busy','true');
  await page.locator('#viewer-close').click();
  await page.locator('[name=compression-target][value=file]').check();await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#inspect-output').click();await expect(page.locator('#viewer-viewport')).not.toHaveAttribute('aria-busy','true');
  await page.screenshot({path:'.qa/viewer-desktop-'+info.project.name+'.png'});
});

test('phone close-up supports pinch and drag with compact bilingual controls',async({page},info)=>{
  await page.setViewportSize({width:375,height:812});await page.emulateMedia({reducedMotion:'reduce'});await start(page);
  await page.locator('#pixel-height').fill('1200');await expect(page.locator('#pixel-width-label')).toContainText('calculated');
  await page.locator('#language').check();await expect(page.locator('#pixel-width-label')).toContainText('自动计算');
  await expect(page.locator('#save')).toBeEnabled();await page.locator('#inspect-output').click();
  await expect(page.locator('#viewer-viewport')).not.toHaveAttribute('aria-busy','true');
  const viewport=page.locator('#viewer-viewport');
  const box=await viewport.boundingBox();const x=box.x+box.width/2,y=box.y+box.height/2;
  // Synthetic pointer events exercise the same two-pointer path in both desktop browser engines.
  await viewport.evaluate(el=>{el.setPointerCapture=()=>{};});
  await viewport.dispatchEvent('pointerdown',{pointerId:1,clientX:x-30,clientY:y});await viewport.dispatchEvent('pointerdown',{pointerId:2,clientX:x+30,clientY:y});
  await viewport.dispatchEvent('pointermove',{pointerId:2,clientX:x+150,clientY:y});
  expect(Number((await page.locator('#viewer-zoom').textContent()).replace('%',''))).toBeGreaterThan(50);
  await viewport.dispatchEvent('pointerup',{pointerId:2});await viewport.dispatchEvent('pointerup',{pointerId:1});
  await page.locator('#viewer-actual').click();const before=await viewport.evaluate(el=>el.scrollTop);
  await viewport.dispatchEvent('pointerdown',{pointerId:3,clientX:x,clientY:y});await viewport.dispatchEvent('pointermove',{pointerId:3,clientX:x,clientY:y-60});await viewport.dispatchEvent('pointerup',{pointerId:3});
  expect(await viewport.evaluate(el=>el.scrollTop)).toBeGreaterThan(before);
  await page.screenshot({path:'.qa/viewer-phone-'+info.project.name+'.png'});
  expect(await page.locator('#jpeg-viewer').evaluate(el=>el.scrollWidth<=el.clientWidth)).toBe(true);
  await page.setViewportSize({width:812,height:375});await page.screenshot({path:'.qa/viewer-landscape-'+info.project.name+'.png'});
  const close=await page.locator('#viewer-close').boundingBox();expect(close.height).toBeGreaterThanOrEqual(44);
  await page.locator('#viewer-close').click();await page.setViewportSize({width:320,height:700});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.locator('.sheet').screenshot({path:'.qa/custom-phone-'+info.project.name+'.png'});
});

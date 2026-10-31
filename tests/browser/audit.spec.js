import { openApp } from './open-app.js';
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));
const pixel = page => page.evaluate(()=>({
  crop:[...document.querySelector('#crop').getContext('2d').getImageData(100,100,1,1).data],
  sheet:[...document.querySelector('#sheet').getContext('2d').getImageData(100,100,1,1).data],
}));

test('leaving original comparison restores the edited preview in Framing',async({page})=>{
  await openApp(page);await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#adjustments-tab').click();await page.locator('#allow-edits').check();
  await page.locator('#brightness').focus();await page.keyboard.press('End');await expect(page.locator('#save')).toBeEnabled();
  const edited=await pixel(page);expect(edited.crop).toEqual(edited.sheet);
  await page.locator('#original').check();expect((await pixel(page)).crop).not.toEqual(edited.crop);
  await page.locator('#framing-tab').click();
  await expect(page.locator('#original')).not.toBeChecked();
  const framing=await pixel(page);expect(framing.crop).toEqual(framing.sheet);expect(framing.crop).toEqual(edited.crop);
});

test('transparent PNG flattens onto white and refresh leaves no photo storage',async({page})=>{
  await openApp(page);
  const buffer=Buffer.from(await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=canvas.height=600;
    const ctx=canvas.getContext('2d');ctx.fillStyle='rgba(255,0,0,0.5)';ctx.fillRect(300,0,300,600);
    return canvas.toDataURL('image/png').split(',')[1];
  }),'base64');
  await page.locator('#photo').setInputFiles({name:'transparent.png',mimeType:'image/png',buffer});await expect(page.locator('#save')).toBeEnabled();
  expect((await pixel(page)).crop).toEqual([255,255,255,255]);
  const tint=await page.locator('#sheet').evaluate(canvas=>[...canvas.getContext('2d').getImageData(400,100,1,1).data]);
  expect(tint[0]).toBe(255);expect(tint[1]).toBeGreaterThanOrEqual(126);expect(tint[1]).toBeLessThanOrEqual(128);
  expect(await page.evaluate(async()=>({databases:(await indexedDB.databases()).length,caches:(await caches.keys()).length}))).toEqual({databases:0,caches:0});
  await page.reload();await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#crop-wrap')).toBeHidden();
});

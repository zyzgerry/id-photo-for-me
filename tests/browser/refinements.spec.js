import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('mobile preview stays visible while changing tonal adjustments',async({page})=>{
  await page.setViewportSize({width:390,height:700}); await page.goto('./');
  await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#adjustments-tab').click();
  await page.locator('#allow-edits').check();
  await page.locator('#contrast').scrollIntoViewIfNeeded();
  const crop=await page.locator('#crop').boundingBox();const contrast=await page.locator('#contrast').boundingBox();
  expect(crop.y).toBeGreaterThanOrEqual(0);
  expect(crop.y+crop.height).toBeLessThanOrEqual(700);
  expect(contrast.y).toBeGreaterThanOrEqual(crop.y+crop.height);
  expect(contrast.y+contrast.height).toBeLessThanOrEqual(700);
});

test('cutting guides change only cut edges and can be disabled without changing geometry',async({page})=>{
  await page.goto('./');await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  const sample=()=>page.locator('#sheet').evaluate(c=>{
    const x=c.getContext('2d');return {edge:[...x.getImageData(600,16,1,1).data],near:[...x.getImageData(598,16,1,1).data],inside:[...x.getImageData(200,200,1,1).data],width:c.width,height:c.height};
  });
  const guided=await sample();expect(guided.edge).toEqual([114,114,114,255]);
  await page.locator('#cut-guides').uncheck();await expect(page.locator('#save')).toBeEnabled();
  const plain=await sample();expect(plain.edge).not.toEqual(guided.edge);expect(plain.near).toEqual(guided.near);expect(plain.inside).toEqual(guided.inside);
  expect([plain.width,plain.height]).toEqual([1800,1200]);await expect(page.locator('#copy-count')).toHaveText('6 copies');
  await page.locator('#country').selectOption('pt');await page.locator('#cut-guides').check();await expect(page.locator('#save')).toBeEnabled();
  const margin=await page.locator('#sheet').evaluate(c=>[...c.getContext('2d').getImageData(73,57,1,1).data]);
  expect(margin).toEqual([114,114,114,255]);await expect(page.locator('#copy-count')).toHaveText('8 copies');
});

test('editing tabs support keyboard navigation, retain edits, and fit narrow screens',async({page})=>{
  await page.setViewportSize({width:320,height:640});await page.goto('./');await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#framing-tab').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#adjustments-tab')).toBeFocused();
  await expect(page.locator('#adjustments-panel')).toBeVisible();await expect(page.locator('#framing-panel')).toBeHidden();
  await page.locator('#allow-edits').check();await page.locator('#brightness').evaluate(el=>{el.value='8';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#framing-tab').click();await page.locator('#adjustments-tab').click();await expect(page.locator('#brightness')).toHaveValue('8');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

import { openApp } from './open-app.js';
import { test, expect } from '@playwright/test';
import { PRESETS } from '../../src/presets.js';
import { messages } from '../../src/i18n.js';
import { fileURLToPath } from 'node:url';

test('all sourced country/document options work in both languages without losing the selection',async({page})=>{
  test.setTimeout(120000);await openApp(page);
  await expect(page.locator('#country option')).toHaveCount(new Set(PRESETS.map(p=>p.country)).size+1);
  for(const lang of ['en','zh']) {
    await page.locator('#language').selectOption(lang);
    for(const p of PRESETS) {
      await page.locator('#country').selectOption(p.country);await page.locator('#document').selectOption(p.id);
      await expect(page.locator('#size-readout')).toContainText(p.country==='us'?'2×2':`${p.widthMm}×${p.heightMm}`);
      await expect(page.locator('#document option:checked')).toHaveText(typeof p.document==='string' ? messages[lang][p.document] : p.document[lang]);
      if(p.scope) {
        await expect(page.locator('#preset-location')).toBeVisible();
        await expect(page.locator('#preset-scope')).toHaveText(p.scope[lang]);
      } else await expect(page.locator('#preset-location')).toBeHidden();
      await expect(page.locator('#preset-note')).not.toBeEmpty();await expect(page.locator('#error')).toBeHidden();
      await page.locator('.requirements').evaluate(el=>el.open=true);
      await expect(page.locator('#reference')).toHaveAttribute('href',p.source);
      await expect(page.locator('#verified')).toContainText(p.checked||'2026-10-30');
    }
    const last=PRESETS.at(-1);await page.locator('#language').selectOption(lang==='en'?'zh':'en');
    await expect(page.locator('#country')).toHaveValue(last.country);await expect(page.locator('#document')).toHaveValue(last.id);
  }
  await page.locator('#country').selectOption('custom');await page.locator('#width').fill('32');
  await page.locator('#language').selectOption('zh');await expect(page.locator('#country')).toHaveValue('custom');
  await expect(page.locator('#width')).toHaveValue('32');await expect(page.locator('#custom-fields')).toBeVisible();
});

test('short document labels keep detailed scope and linked sources collapsed until requested',async({page})=>{
  await page.setViewportSize({width:320,height:812});await openApp(page);
  await page.locator('#country').selectOption('it');
  await expect(page.locator('#document option:checked')).toHaveText('Schengen Visa');
  await expect(page.locator('#preset-note')).toBeHidden();
  await expect(page.locator('#preset-scope')).toBeHidden();
  await expect(page.locator('#reference')).toBeHidden();
  await expect(page.locator('#size-readout')).toHaveText('35×45 mm');
  await expect(page.locator('#preset-location')).toBeVisible();
  const disclosure=page.locator('.requirements summary');
  await expect(disclosure).toHaveText('Requirements & sources');
  await disclosure.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#preset-note')).toBeVisible();
  await expect(page.locator('#preset-scope')).toContainText('Hong Kong / Macao');
  await expect(page.locator('#reference')).toHaveAttribute('href',PRESETS.find(p=>p.country==='it').source);
  await page.locator('#language').selectOption('zh');
  await expect(page.locator('#document option:checked')).toHaveText('申根签证');
  await expect(disclosure).toHaveText('要求与来源');
  await expect(page.locator('#preset-scope')).toContainText('香港／澳门');
  await disclosure.click();await expect(page.locator('#preset-note')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
  await page.locator('#country').selectOption('us');await expect(page.locator('#preset-location')).toBeHidden();
  await page.locator('#country').selectOption('custom');await expect(page.locator('#preset-location')).toBeHidden();
});

test('shared visa names distinguish Schengen, mixed guidance and national D routes',async({page})=>{
  await openApp(page);
  for(const lang of ['en','zh']) {
    await page.locator('#language').selectOption(lang);
    for(const [country,label] of [
      ['pt',['Schengen Visa','申根签证']],['ro',['Schengen Visa','申根签证']],
      ['it',['Schengen Visa','申根签证']],['gr',['Schengen Visa','申根签证']],
      ['de',['Schengen / National Visa','申根／国家签证']],
      ['at',['Schengen / National Visa','申根／国家签证']],
      ['sk',['National Visa (D)','国家签证（D类）']],
      ['be',['National Visa (D, study)','国家签证（D类，留学）']],
      ['ch',['National Visa (D, marriage)','国家签证（D类，结婚）']]
    ]) {
      await page.locator('#country').selectOption(country);
      await expect(page.locator('#document option:checked')).toHaveText(label[lang==='en'?0:1]);
    }
    for(const country of ['ie','cy']) {
      await page.locator('#country').selectOption(country);
      await expect(page.locator('#document option:checked')).not.toContainText(/Schengen|申根/);
    }
  }
});

test('new formats export offline at their stated dimensions and retain phone layout',async({page,context})=>{
  await page.setViewportSize({width:375,height:812});await openApp(page);await context.setOffline(true);
  await page.locator('#photo').setInputFiles(fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url)));
  for(const id of ['cn-visa','fi-passport','ca-visa','pe-visa']) {
    const p=PRESETS.find(p=>p.id===id);
    await page.locator('#country').selectOption(p.country);await page.locator('#document').selectOption(p.id);
    await expect(page.locator('#save')).toBeEnabled();
    await expect(page.locator('#sheet')).toHaveAttribute('width','1800');await expect(page.locator('#sheet')).toHaveAttribute('height','1200');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  }
  await page.locator('#language').selectOption('zh');await expect(page.locator('#country option:checked')).toHaveText('秘鲁');
  const pending=page.waitForEvent('download');await page.locator('#save').click();
  expect((await pending).suggestedFilename()).toBe('id-photo-4x6-300ppi.jpg');
});

import { openApp, reviewFraming } from './open-app.js';
import { test, expect } from '@playwright/test';
import { PRESETS, PREPARATION_PRESETS } from '../../src/presets.js';
import { messages } from '../../src/i18n.js';
import { fileURLToPath } from 'node:url';

test('all sourced country/document options work in both languages without losing the selection',async({page})=>{
  test.setTimeout(120000);await openApp(page);
  await expect(page.locator('#country option')).toHaveCount(new Set(PREPARATION_PRESETS.map(p=>p.country)).size);
  for(const lang of ['en','zh']) {
    await page.locator(`[name=language][value=${lang}]`).check();
    for(const p of PRESETS) {
      await page.locator('#country').selectOption(p.country);await page.locator('#document').selectOption(p.id);
      await expect(page.locator('#size-readout')).toContainText(p.country==='us'?'2×2':`${p.widthMm}×${p.heightMm}`);
      await expect(page.locator('#document option:checked')).toHaveText(typeof p.document==='string' ? messages[lang][p.document] : p.document[lang]);
      if(p.scope) {
        await expect(page.locator('#preset-location')).toBeVisible();
        await expect(page.locator('#preset-scope')).toHaveText(p.scope[lang]);
      }
      await expect(page.locator('#preset-location')).toBeVisible();
      await expect(page.locator('#preset-note')).not.toBeEmpty();await expect(page.locator('#error')).toBeHidden();
      await page.locator('.requirements').evaluate(el=>el.open=true);
      await expect(page.locator('#reference')).toHaveAttribute('href',p.source);
      await expect(page.locator('#verified')).toContainText(p.checked||'2026-11-01');
    }
    const last=PRESETS.at(-1);await page.locator(`[name=language][value=${lang==='en'?'zh':'en'}]`).check();
    await expect(page.locator('#country')).toHaveValue(last.country);await expect(page.locator('#document')).toHaveValue(last.id);
  }
  await page.locator('#custom-requirements').click();await page.locator('#width').fill('32');
  await page.locator('[name=language][value=zh]').check();await expect(page.locator('#custom-requirements')).toHaveAttribute('aria-selected','true');
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
  const rows = page.locator('.requirements > p:visible');
  await expect(rows).toHaveText([
    'Requirements source: Italian Consulate-General in Hong Kong.',
    'Tourist visa checklist for Hong Kong / Macao: two recent 35×45 mm photographs, not older than six months, submitted with the printed and signed application.',
    'Checked: 2026-11-01',
    'Confirm with your consulate or authority on photo requirements before proceeding.',
  ]);
  await expect(page.locator('#reference')).toHaveAttribute('href',PRESETS.find(p=>p.country==='it').source);
  await page.locator('[name=language][value=zh]').check();
  await expect(page.locator('#document option:checked')).toHaveText('申根签证');
  await expect(disclosure).toHaveText('要求与来源');
  await expect(page.locator('#reference')).toContainText('意大利驻香港总领事馆');
  await expect(page.locator('#preset-note')).toContainText('香港／澳门旅游签证清单');
  await expect(rows).toHaveCount(4);
  await disclosure.click();await expect(page.locator('#preset-note')).toBeHidden();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(320);
  await page.locator('#country').selectOption('us');await expect(page.locator('#preset-location')).toBeVisible();
  await page.locator('#custom-requirements').click();await expect(page.locator('#preset-location')).toBeHidden();
});

test('shared visa names distinguish Schengen, mixed guidance and national D routes',async({page})=>{
  await openApp(page);
  for(const lang of ['en','zh']) {
    await page.locator(`[name=language][value=${lang}]`).check();
    for(const country of ['pt','ro','it','gr','de','at','sk','be','ch']) {
      const p=PRESETS.find(p=>p.country===country);
      await page.locator('#country').selectOption(country);
      await expect(page.locator('#document option:checked')).toHaveText(typeof p.document==='string'?messages[lang][p.document]:p.document[lang]);
    }
    for(const country of ['ie','me']) {
      await page.locator('#country').selectOption(country);
      await expect(page.locator('#document option:checked')).not.toContainText(/Schengen|申根/);
    }
  }
});

test('new formats export offline at their stated dimensions and retain phone layout',async({page,context})=>{
  await page.setViewportSize({width:375,height:812});await openApp(page);await context.setOffline(true);
  await page.locator('#photo').setInputFiles(fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url)));
  await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#setup-toggle').click();
  for(const id of ['cn-visa','fi-passport','ca-visa','pe-visa']) {
    const p=PRESETS.find(p=>p.id===id);
    await page.locator('#country').selectOption(p.country);await page.locator('#document').selectOption(p.id);
    await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
    await expect(page.locator('#sheet')).toHaveAttribute('width','3600');await expect(page.locator('#sheet')).toHaveAttribute('height','2400');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  }
  await page.locator('[name=language][value=zh]').check();await expect(page.locator('#country option:checked')).toHaveText('秘鲁');
  const pending=page.waitForEvent('download');await page.locator('#save').click();
  expect((await pending).suggestedFilename()).toBe('id-photo-4x6-600ppi.jpg');
});

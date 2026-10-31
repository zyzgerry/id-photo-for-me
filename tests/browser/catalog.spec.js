import { test, expect } from '@playwright/test';
import { PRESETS } from '../../src/presets.js';
import { fileURLToPath } from 'node:url';

test('all sourced country/document options work in both languages without losing the selection',async({page})=>{
  test.setTimeout(120000);await page.goto('./');
  await expect(page.locator('#country option')).toHaveCount(new Set(PRESETS.map(p=>p.country)).size+1);
  for(const lang of ['en','zh']) {
    await page.locator('#language').selectOption(lang);
    for(const p of PRESETS) {
      await page.locator('#country').selectOption(p.country);await page.locator('#document').selectOption(p.id);
      await expect(page.locator('#size-readout')).toContainText(p.country==='us'?'2×2':`${p.widthMm}×${p.heightMm}`);
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

test('new formats export offline at their stated dimensions and retain phone layout',async({page,context})=>{
  await page.setViewportSize({width:375,height:812});await page.goto('./');await context.setOffline(true);
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

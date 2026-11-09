import { expect } from '@playwright/test';

export async function openApp(page,mode='print') {
  await page.goto('./');
  await expect(page.locator('body')).not.toHaveAttribute('inert');
  await expect(page.locator('#status')).toBeEmpty();
  if (mode !== 'print') await selectOutputMode(page, mode);
}

export async function selectOutputMode(page, mode) {
  const radio = page.locator(`[name=output-mode][value=${mode}]`);
  const disclosure = page.locator('#output-options-toggle');
  if (await disclosure.isVisible() && !await radio.isVisible()) await disclosure.click();
  await radio.check();
}

export async function reviewFraming(page) {
  if(await page.locator('#framing-review').isVisible()) await page.locator('#confirm-framing').click();
}

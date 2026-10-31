import { expect } from '@playwright/test';

export async function openApp(page,mode='print') {
  await page.goto('./');
  await expect(page.locator('body')).not.toHaveAttribute('inert');
  await expect(page.locator('#status')).toBeEmpty();
  await page.locator(`[name=output-mode][value=${mode}]`).check();
}

export async function reviewFraming(page) {
  if(await page.locator('#framing-review').isVisible()) await page.locator('#confirm-framing').click();
}

import { expect } from '@playwright/test';

export async function openApp(page) {
  await page.goto('./');
  await expect(page.locator('body')).not.toHaveAttribute('inert');
  await expect(page.locator('#status')).toBeEmpty();
}

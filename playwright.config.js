import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  workers: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173/id-photo-for-me/',
    launchOptions: existsSync(chrome) ? {executablePath:chrome} : {},
  },
  webServer: {command:'node scripts/serve.mjs',url:'http://127.0.0.1:4173/id-photo-for-me/',reuseExistingServer:!process.env.CI},
});

import {test, expect} from '@playwright/test';

async function portrait(page) {
  return Buffer.from(await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 320; canvas.height = 400;
    const c = canvas.getContext('2d'); c.fillStyle = '#d7d2c8'; c.fillRect(0, 0, 320, 400);
    c.fillStyle = '#26384a'; c.fillRect(70, 240, 180, 160); c.fillStyle = '#bd8a65';
    c.beginPath(); c.ellipse(160, 155, 58, 83, 0, 0, Math.PI * 2); c.fill();
    return Array.from(new Uint8Array(await (await new Promise(r => canvas.toBlob(r, 'image/png'))).arrayBuffer()));
  }));
}
test('portrait test page is isolated, responsive and preserves the loaded original on errors', async ({page}) => {
  const requests = [], errors = []; page.on('request', r => requests.push(r.url())); page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({width:390, height:844}); await page.goto('src/modnet-experiment/');
  await expect(page.locator('h1')).toContainText('MODNet');
  await expect(page.locator('#mode option')).toHaveCount(1);
  await expect(page.locator('#mode')).toHaveValue('wasm');
  await expect(page.locator('#recipe')).toHaveValue('standard');
  await page.locator('#recipe').selectOption('detail');
  await expect(page.locator('#recipe')).toHaveValue('detail');
  await expect(page.locator('#run')).toBeDisabled(); await expect(page.locator('#cancel')).toBeDisabled();
  expect(requests.some(url => /\/models\/|modnet-experiment\/vendor\//.test(url))).toBe(false);
  await page.locator('#photo').setInputFiles({name:'synthetic.png', mimeType:'image/png', buffer:await portrait(page)});
  await expect(page.locator('#original')).toBeVisible(); await expect(page.locator('#status')).toContainText('Photo ready');
  await page.locator('#recipe').selectOption('edge-20-80');
  await expect(page.locator('#edge-overlay')).toBeVisible();
  await expect(page.locator('#detail-note')).toBeHidden();
  await expect(page.locator('#mark-count')).toContainText('Tap the photo');
  await page.locator('#edge-overlay').click();
  await expect(page.locator('#run')).toBeInViewport({ratio:1});
  expect(await page.locator('#run').evaluate(run => run.getBoundingClientRect().bottom <= document.getElementById('edge-overlay').getBoundingClientRect().top)).toBe(true);
  await expect(page.locator('#edge-overlay circle')).toHaveCount(1);
  await page.locator('#recipe').selectOption('edge-30-70');
  await expect(page.locator('#run')).toBeInViewport({ratio:1});
  await expect(page.locator('#edge-overlay circle')).toHaveCount(1);
  await page.locator('#clear-marks').click();
  await expect(page.locator('#edge-overlay circle')).toHaveCount(0);
  await page.locator('#recipe').selectOption('detail');
  await expect(page.locator('#edge-overlay')).toBeHidden();
  await expect(page.locator('#run')).toBeDisabled();
  await page.locator('#photo').setInputFiles({name:'broken.jpg', mimeType:'image/jpeg', buffer:Buffer.from('invalid')});
  await expect(page.locator('#status')).toContainText('Choose a JPEG'); await expect(page.locator('#original')).toBeVisible();
  const downloaded = page.waitForEvent('download'); await page.locator('#report').click();
  const stream = await (await downloaded).createReadStream(), chunks = []; for await (const chunk of stream) chunks.push(chunk);
  const report = JSON.parse(Buffer.concat(chunks)); expect(report.runs).toEqual([]); expect(report.errors).toHaveLength(1);
  expect(JSON.stringify(report)).not.toMatch(/synthetic\.png|broken\.jpg/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.locator('#reset').click(); await expect(page.locator('#original-figure')).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem('modnet-checkpoint-v1'))).toBeNull();
});
test('portrait model download is explicit and cancellation cannot install a stale model', async ({page}) => {
  await page.goto('src/modnet-experiment/'); await page.locator('#mode').selectOption('wasm');
  let release; const gate = new Promise(resolve => release = resolve);
  await page.route('**/models/**/part-0.bin', async route => { await gate; await route.abort().catch(() => {}); });
  const requested = page.waitForRequest('**/models/**/part-0.bin'); await page.locator('#prepare').click(); await requested;
  await expect(page.locator('#cancel')).toBeEnabled(); await page.locator('#cancel').click(); release();
  await expect(page.locator('#status')).toContainText('Cancelled'); await expect(page.locator('#prepare')).toBeEnabled();
  await expect(page.locator('#run')).toBeDisabled(); await expect(page.locator('#release')).toBeDisabled();
});
test('portrait interrupted-stage report survives a reload without photo history', async ({page}) => {
  await page.goto('src/modnet-experiment/');
  await page.evaluate(() => localStorage.setItem('modnet-checkpoint-v1', JSON.stringify({state:'busy', phase:'inference', completedRuns:0})));
  await page.reload(); await expect(page.locator('#status')).toContainText('previous attempt ended');
  await expect(page.locator('#original-figure')).toBeHidden(); await expect(page.locator('#result-figure')).toBeHidden();
});


test('ordinary editor visits never load portrait runtime or model assets', async ({page}) => {
  const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.goto('./');await expect(page.locator('body')).not.toHaveAttribute('inert');
  await page.waitForLoadState('networkidle');
  expect(requests.some(url=>/modnet-experiment|\/models\//.test(url))).toBe(false);
});

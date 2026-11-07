import {test, expect} from '@playwright/test';
import {openApp, reviewFraming} from './open-app.js';

test('background removal is optional, reversible, and composes with both outputs', async ({page}) => {
  await page.setViewportSize({width:375, height:812});
  const requests = [];
  page.on('request', request => requests.push(request.url()));
  let preparations = 0;
  await page.route('**/modnet-experiment/worker.js', route => {
    const delay = preparations++ === 0 ? 2000 : 0;
    return route.fulfill({contentType:'text/javascript', body:`
      self.onmessage = ({data}) => {
        if (data.type === 'prepare') {
          self.postMessage({id:data.id,stage:'download',progress:{current:1,total:2}});
          setTimeout(() => self.postMessage({id:data.id,ready:true}), ${delay});
          return;
        }
        if (!data.cutout) throw Error('Expected editable cutout');
        for (let y=0; y<data.height; y++) for (let x=0; x<data.width; x++) {
          if (x < data.width/4 || x >= data.width*3/4 || y < data.height/4 || y >= data.height*3/4) {
            data.pixels[(y*data.width+x)*4+3] = 0;
          }
        }
        self.postMessage({id:data.id,cutout:data.pixels}, [data.pixels.buffer]);
      };
    `});
  });
  await openApp(page,'single');
  const q = id => page.locator('#' + id);
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 400;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#204080'; ctx.fillRect(0,0,400,400);
    ctx.fillStyle = '#a04020'; ctx.fillRect(100,100,200,200);
    return c.toDataURL().split(',')[1];
  });
  await q('photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await reviewFraming(page);
  await expect(q('save')).toBeEnabled();
  await q('framing-tab').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(q('background-tab')).toBeFocused();
  await expect(q('remove-background')).toBeDisabled();
  await q('background-permission').check();
  expect(requests.some(url => /\/models\/|\/modnet-experiment\/|\/remove-background\.js/.test(url))).toBe(false);
  await q('remove-background').click();
  await expect(q('background-progress')).toBeVisible();
  await expect(q('save')).toBeDisabled();
  await q('cancel-background').click();
  await expect(q('background-status')).toContainText('cancelled');
  await expect(q('save')).toBeEnabled();
  await q('remove-background').click();
  await expect(q('background-status')).toContainText('White background applied');
  const sample = (id,x,y) => q(id).evaluate((canvas,[x,y]) => [...canvas.getContext('2d').getImageData(x,y,1,1).data],[x,y]);
  expect(await sample('crop',20,20)).toEqual([255,255,255,255]);
  const subject = await sample('crop',300,300);
  await q('adjustments-tab').click();
  await q('allow-edits').check();
  await q('brightness').fill('-10');
  await expect(q('save')).toBeEnabled();
  expect(await sample('crop',300,300)).not.toEqual(subject);
  expect(await sample('crop',20,20)).toEqual([255,255,255,255]);
  expect(await sample('sheet',20,20)).toEqual([255,255,255,255]);
  await q('original').check();
  expect(await sample('crop',20,20)).toEqual([32,64,128,255]);
  await page.locator('[name=output-mode][value=print]').check();
  await reviewFraming(page);
  await expect(q('save')).toBeEnabled();
  expect(await sample('sheet',50,50)).toEqual([255,255,255,255]);
  await q('background-tab').click();
  await q('restore-background').click();
  await expect(q('background-status')).toContainText('Original background restored');
  expect(await sample('crop',20,20)).not.toEqual([255,255,255,255]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

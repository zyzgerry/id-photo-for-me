import { openApp } from './open-app.js';
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('photo selection follows mode in visual and keyboard order at every layout size',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[1440,1000],[1024,900],[760,900],[375,812],[320,640],[844,390]]) {
    await page.setViewportSize({width,height});await openApp(page);
    for(const language of ['en','zh']) {
      await page.locator('#language').selectOption(language);
      for(const mode of ['print','single']) {
        const radio=page.locator(`[name=output-mode][value=${mode}]`);
        await radio.check();await radio.focus();await page.keyboard.press('Tab');
        await expect(page.locator('#photo')).toBeFocused();
        await expect(page.locator('#crop-empty p')).toHaveText(mode==='single'
          ? await page.locator('#sheet-empty').textContent()
          : language==='en'?'Choose a photo from Photos or Files. Your crop and print sheet will appear here.':'从“照片”或“文件”中选择照片，即可查看裁剪和打印排版。');
        const modes=await page.locator('.mode-picker').boundingBox();
        const actions=await page.locator('.file-actions').boundingBox();
        const setup=await page.locator('.setup').boundingBox();
        const settings=await page.locator('.settings').boundingBox();
        const editor=await page.locator('.editor').boundingBox();
        const sheet=await page.locator('.sheet').boundingBox();
        expect(actions.y).toBeGreaterThanOrEqual(modes.y+modes.height);
        expect(actions.x).toBeCloseTo(modes.x);
        if(width>760) {
          expect(editor.y).toBeCloseTo(setup.y);
          expect(settings.x).toBeCloseTo(setup.x);
          expect(editor.x).toBeGreaterThan(setup.x+setup.width);
          expect(editor.width).toBeGreaterThan(settings.width);
          expect(sheet.x).toBeCloseTo(editor.x);
          expect(sheet.y).toBeGreaterThanOrEqual(editor.y+editor.height);
        } else {
          expect(editor.y).toBeGreaterThanOrEqual(setup.y+setup.height);
          expect(settings.y).toBeGreaterThanOrEqual(editor.y+editor.height);
          expect(sheet.y).toBeGreaterThanOrEqual(settings.y+settings.height);
          expect(await page.locator('.settings').evaluate(el=>el.previousElementSibling.classList.contains('editor'))).toBe(true);
        }
        expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
    await expect(page.locator('.input-help')).not.toHaveAttribute('open');
    await page.locator('.input-help summary').click();await expect(page.locator('#formats')).toBeVisible();
  }
});

test('resizing retains photo, settings, focus, and exports while moving phone settings after the editor',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await openApp(page);
  const chooser=page.waitForEvent('filechooser');await page.locator('#start-photo').click();
  await (await chooser).setFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#copies').fill('4');await expect(page.locator('#copy-count')).toHaveText('4 copies');
  await expect(page.locator('.settings #copies')).toBeVisible();
  await expect(page.locator('.settings #cut-guides')).toBeVisible();
  for(const width of [375,1440,320,1024]) {
    await page.locator('#copies').focus();await page.setViewportSize({width,height:900});
    await expect(page.locator('#copies')).toBeFocused();
    await expect(page.locator('#copies')).toHaveValue('4');await expect(page.locator('#save')).toBeEnabled();
    const parent=width<=760?'.preview-column > .settings':'.setup-column > .settings';
    await expect(page.locator(parent)).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.locator('[name=output-mode][value=single]').check();
  await expect(page.locator('#print-summary')).toBeHidden();await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#clear').click();await expect(page.locator('#start-photo')).toBeVisible();
  await expect(page.locator('#save')).toBeDisabled();
});

test('mobile preview stays visible while changing tonal adjustments',async({page})=>{
  await page.setViewportSize({width:390,height:700}); await openApp(page);
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
  await openApp(page);await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
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
  await page.setViewportSize({width:320,height:640});await openApp(page);await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#framing-tab').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#adjustments-tab')).toBeFocused();
  await expect(page.locator('#adjustments-panel')).toBeVisible();await expect(page.locator('#framing-panel')).toBeHidden();
  await page.locator('#allow-edits').check();await page.locator('#brightness').evaluate(el=>{el.value='8';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#framing-tab').click();await page.locator('#adjustments-tab').click();await expect(page.locator('#brightness')).toHaveValue('8');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

import { openApp, reviewFraming } from './open-app.js';
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const fixture = fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('requirements and upload precede editing at every layout size',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const [width,height] of [[1440,1000],[1024,900],[760,900],[375,812],[320,640],[844,390]]){
    await page.setViewportSize({width,height});await openApp(page);
    for(const language of ['en','zh']){
      await page.locator('#language').setChecked((language)==='zh');
      for(const mode of ['print','single']){
        const radio=page.locator(`[name=output-mode][value=${mode}]`);
        await radio.check();await radio.focus();await expect(radio).toBeFocused();
        expect(await page.locator('.mode-picker').evaluate(el=>!!(document.querySelector('.editor').compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
        const [settings,setup,editor,sheet]=await page.evaluate(()=>['.settings','.setup','.editor','.sheet'].map(selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};}));
        expect(setup.y).toBeGreaterThanOrEqual(settings.y+settings.height);
        if(width>760){expect(editor.y).toBeCloseTo(settings.y);expect(editor.x).toBeGreaterThan(settings.x+settings.width);}
        else expect(editor.y).toBeGreaterThanOrEqual(setup.y+setup.height);
        expect(sheet.y).toBeGreaterThanOrEqual(editor.y+editor.height);
        expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
    }
    await expect(page.locator('.input-help')).not.toHaveAttribute('open');await page.locator('.input-help summary').click();await expect(page.locator('#formats')).toBeVisible();
  }
});

test('resizing retains photo, settings, focus and exports in the requirements-first layout',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await openApp(page);
  const chooser=page.waitForEvent('filechooser');await page.locator('#photo').click();await (await chooser).setFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#copies').fill('4');await expect(page.locator('#copies')).toHaveValue('4');
  await expect(page.locator('.sheet #copies')).toBeVisible();await expect(page.locator('.sheet #cut-guides')).toBeVisible();
  for(const width of [375,1440,320,1024]){
    await page.locator('#copies').focus();await page.setViewportSize({width,height:900});await expect(page.locator('#copies')).toBeFocused();
    await expect(page.locator('#copies')).toHaveValue('4');await expect(page.locator('#save')).toBeEnabled({timeout:15000});await expect(page.locator('.setup-column > .settings')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  }
  await page.locator('[name=output-mode][value=single]').check();await expect(page.locator('#print-summary')).toBeHidden();await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#clear').click();await expect(page.locator('#crop-empty')).toBeVisible();await expect(page.locator('#save')).toBeDisabled();
});

test('mobile preview stays visible while changing tonal adjustments',async({page})=>{
  await page.setViewportSize({width:390,height:700}); await openApp(page);
  await page.locator('#photo').setInputFiles(fixture);await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#adjustments-tab').click();
  await page.locator('#contrast').scrollIntoViewIfNeeded();
  const crop=await page.locator('#crop').boundingBox();const contrast=await page.locator('#contrast').boundingBox();
  expect(crop.y).toBeGreaterThanOrEqual(0);
  expect(crop.y+crop.height).toBeLessThanOrEqual(700);
  expect(contrast.y).toBeGreaterThanOrEqual(crop.y+crop.height);
  expect(contrast.y+contrast.height).toBeLessThanOrEqual(700);
});

test('cutting guides change only cut edges and can be disabled without changing geometry',async({page})=>{
  await openApp(page);await page.locator('#photo').setInputFiles(fixture);await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  const sample=()=>page.locator('#sheet').evaluate(c=>{
    const x=c.getContext('2d');return {edge:[...x.getImageData(1200,32,1,1).data],near:[...x.getImageData(1196,32,1,1).data],inside:[...x.getImageData(400,400,1,1).data],width:c.width,height:c.height};
  });
  const guided=await sample();expect(guided.edge).toEqual([114,114,114,255]);
  await page.locator('#cut-guides').uncheck();await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  const plain=await sample();expect(plain.edge).not.toEqual(guided.edge);expect(plain.near).toEqual(guided.near);expect(plain.inside).toEqual(guided.inside);
  expect([plain.width,plain.height]).toEqual([3600,2400]);await expect(page.locator('#copies')).toHaveValue('6');
  await page.locator('#country').selectOption('pt');await page.locator('#cut-guides').check();await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  const margin=await page.locator('#sheet').evaluate(c=>[...c.getContext('2d').getImageData(146,114,1,1).data]);
  expect(margin).toEqual([114,114,114,255]);await expect(page.locator('#copies')).toHaveValue('8');
});

test('editing tabs support keyboard navigation, retain edits, and fit narrow screens',async({page})=>{
  await page.setViewportSize({width:320,height:640});await openApp(page);await page.locator('#photo').setInputFiles(fixture);await reviewFraming(page);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#framing-tab').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#adjustments-tab')).toBeFocused();
  await expect(page.locator('#adjustments-panel')).toBeVisible();await expect(page.locator('#framing-panel')).toBeHidden();
  await page.locator('#brightness').evaluate(el=>{el.value='8';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#framing-tab').click();await page.locator('#adjustments-tab').click();await expect(page.locator('#brightness')).toHaveValue('8');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

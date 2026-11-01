import {test,expect} from '@playwright/test';
import {openApp,reviewFraming} from './open-app.js';
import {fileURLToPath} from 'node:url';
const fixture=fileURLToPath(new URL('../fixtures/orientation-6.jpg',import.meta.url));

test('copies are editable beside the sheet with dynamic maximum and no maximum button',async({page})=>{
  await openApp(page);await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled({timeout:15000});
  await expect(page.locator('.output-details #copies')).toBeVisible();await expect(page.locator('#use-max')).toHaveCount(0);
  await expect(page.locator('#capacity')).toHaveText('A 4×6 inch photo can fit 6 copies at maximum.');
  await page.locator('#copies').fill('3');await expect(page.locator('#save')).toBeEnabled();await expect(page.locator('.cut-preview-box')).toHaveCount(3);
  await page.locator('#country').selectOption('pt');await reviewFraming(page);await expect(page.locator('#capacity')).toContainText('8 copies');await expect(page.locator('#copies')).toHaveValue('3');
  await page.locator('#language').setChecked(('zh')==='zh');await expect(page.locator('#capacity')).toHaveText('一张 4×6 英寸相纸最多可排 8 张。');
  await page.locator('#custom-requirements').click();await page.locator('#width').fill('60');await page.locator('#height').fill('60');await expect(page.locator('#copies')).toHaveValue('2');await expect(page.locator('#capacity')).toContainText('2 张');
});

test('every preset offers head guides and only custom requirements hide them',async({page})=>{
  const {PREPARATION_PRESETS}=await import('../../src/presets.js');await openApp(page,'single');await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#guides').check();
  for(const preset of PREPARATION_PRESETS){await page.locator('#country').selectOption(preset.country);await page.locator('#document').selectOption(preset.id);await expect(page.locator('#guide-control')).toBeVisible();await expect(page.locator('#guide-overlay')).toBeVisible();}
  await page.locator('#custom-requirements').click();await expect(page.locator('#guide-control')).toBeHidden();await expect(page.locator('#guide-overlay')).toBeHidden();
});

test('wide editor places tools beside the preview and stays compact',async({page},testInfo)=>{
  await page.setViewportSize({width:1440,height:1000});await openApp(page,'single');const buffer=Buffer.from(await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=600;c.height=800;const x=c.getContext('2d');x.fillStyle='#f5f3ee';x.fillRect(0,0,600,800);
    x.fillStyle='#314c68';x.beginPath();x.ellipse(300,780,230,230,0,0,Math.PI*2);x.fill();x.fillStyle='#d6aa8a';x.fillRect(258,465,84,150);
    x.beginPath();x.ellipse(300,330,125,170,0,0,Math.PI*2);x.fill();x.fillStyle='#493c37';x.beginPath();x.ellipse(300,215,125,78,0,Math.PI,Math.PI*2);x.fill();
    x.fillStyle='#4d453f';for(const px of [258,342]){x.beginPath();x.ellipse(px,330,8,5,0,0,Math.PI*2);x.fill();}x.strokeStyle='#985c50';x.lineWidth=4;x.beginPath();x.moveTo(273,414);x.lineTo(327,414);x.stroke();
    return c.toDataURL('image/png').split(',')[1];
  }),'base64');await page.locator('#photo').setInputFiles({name:'synthetic-portrait.png',mimeType:'image/png',buffer});await expect(page.locator('#save')).toBeEnabled();
  const [preview,tools,editor]=await page.evaluate(()=>['.crop-stage','.editor-tools','.editor'].map(s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height}:null;}));
  expect(tools).not.toBeNull();expect(tools.x).toBeGreaterThanOrEqual(preview.x+preview.width);expect(editor.height).toBeLessThan(540);
  await page.locator('#guides').check();await page.locator('.editor').screenshot({path:`.qa/editor-compact-${testInfo.project.name}.png`});
  await page.locator('[name=output-mode][value=print]').check();await expect(page.locator('#save')).toBeEnabled({timeout:15000});await page.locator('.sheet').screenshot({path:`.qa/sheet-inline-count-${testInfo.project.name}.png`});
  for(const width of [320,390,840,1024]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);}
  await page.setViewportSize({width:390,height:844});await page.locator('.editor').screenshot({path:`.qa/editor-compact-phone-${testInfo.project.name}.png`});await page.locator('.sheet').screenshot({path:`.qa/sheet-inline-count-phone-${testInfo.project.name}.png`});
});

test('manual fallback guides are adjustable, ordered and stay out of the JPEG',async({page})=>{
  const {PREPARATION_PRESETS}=await import('../../src/presets.js');const p=PREPARATION_PRESETS.find(p=>!p.head);
  await openApp(page,'single');await page.locator('#country').selectOption(p.country);await page.locator('#document').selectOption(p.id);await page.locator('#photo').setInputFiles(fixture);await expect(page.locator('#save')).toBeEnabled();
  const before=await page.locator('#sheet').evaluate(c=>c.toDataURL());await page.locator('#guides').check();await expect(page.locator('#guide-note')).toContainText('Manual');await expect(page.locator('.guide-line')).toHaveCount(2);
  await page.locator('#manual-guide-controls summary').click();await page.locator('#guide-crown').fill('95');await expect(page.locator('#guide-chin')).toHaveValue('96');
  await page.locator('#guide-chin').fill('4');await expect(page.locator('#guide-crown')).toHaveValue('3');
  expect(await page.locator('#sheet').evaluate(c=>c.toDataURL())).toBe(before);
  await page.locator('#language').setChecked(('zh')==='zh');await expect(page.locator('#guide-note')).toContainText('手动');
  await page.locator('#country').selectOption('us');await expect(page.locator('.guide-line')).toHaveCount(4);await expect(page.locator('#manual-guide-controls')).toBeHidden();
});

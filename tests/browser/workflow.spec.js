import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

async function fixture(page,width=1200,height=800) {
  return Buffer.from(await page.evaluate(({width,height})=>{
    const c=document.createElement('canvas');c.width=width;c.height=height;
    const x=c.getContext('2d');x.fillStyle='#ff0000';x.fillRect(0,0,width/2,height/2);
    x.fillStyle='#00ff00';x.fillRect(width/2,0,width/2,height/2);
    x.fillStyle='#0000ff';x.fillRect(0,height/2,width/2,height/2);
    x.fillStyle='#ffff00';x.fillRect(width/2,height/2,width/2,height/2);
    return c.toDataURL('image/png').split(',')[1];
  },{width,height}), 'base64');
}
async function upload(page,buffer) {
  await page.locator('#photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:buffer||await fixture(page)});
  await expect(page.locator('#save')).toBeEnabled();
}
async function setRange(page,id,value) {
  await page.locator(`#${id}`).evaluate((el,value)=>{el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));},String(value));
  await expect(page.locator('#save')).toBeEnabled();
}

test('offline crop, adjustments, JPEG geometry, density, and clear keep all photo data local',async({page,context})=>{
  const requests=[]; const errors=[];
  page.on('request',r=>requests.push(r.url()));page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./');await expect(page.locator('#status')).toBeEmpty();
  const buffer=await fixture(page);
  const initialRequests=requests.length;
  await context.setOffline(true);
  await upload(page,buffer);
  await expect(page.locator('#copy-count')).toHaveText('6 copies');
  await setRange(page,'zoom',2);await setRange(page,'x',100);await setRange(page,'y',0);
  await page.locator('#adjustments-tab').click();await page.locator('#allow-edits').check();
  await setRange(page,'brightness',10);await setRange(page,'contrast',-5);
  await page.locator('#reset-edits').click();await expect(page.locator('#save')).toBeEnabled();
  const comparison=await page.evaluate(()=>{
    const crop=document.querySelector('#crop').getContext('2d');const sheet=document.querySelector('#sheet').getContext('2d');
    return {crop:[...crop.getImageData(100,100,1,1).data],sheet:[...sheet.getImageData(100,100,1,1).data]};
  });
  expect(comparison.crop).toEqual(comparison.sheet);expect(comparison.sheet).toEqual([0,255,0,255]);
  const pending=page.waitForEvent('download');await page.locator('#save').click();const download=await pending;
  const bytes=await readFile(await download.path());
  expect([...bytes.subarray(13,18)]).toEqual([1,1,44,1,44]);
  const decoded=await page.evaluate(async data=>{
    const b=Uint8Array.from(atob(data),c=>c.charCodeAt(0));const img=await createImageBitmap(new Blob([b],{type:'image/jpeg'}));
    const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const x=c.getContext('2d');x.drawImage(img,0,0);
    return {width:img.width,height:img.height,pixel:[...x.getImageData(100,100,1,1).data]};
  },bytes.toString('base64'));
  expect(decoded.width).toBe(1800);expect(decoded.height).toBe(1200);expect(decoded.pixel[1]).toBeGreaterThan(245);
  expect(requests.slice(initialRequests).filter(url=>/^https?:/.test(url))).toEqual([]);
  expect(await page.evaluate(()=>({local:localStorage.length,session:sessionStorage.length,cookies:document.cookie}))).toEqual({local:0,session:0,cookies:''});
  await page.locator('#clear').click();await expect(page.locator('#crop-wrap')).toBeHidden();await expect(page.locator('#save')).toBeDisabled();
  expect(errors).toEqual([]);
});

test('HEIC fallback decodes offline and EXIF orientation is normalized',async({page,context})=>{
  test.setTimeout(90000);
  await page.goto('./');await expect(page.locator('#status')).toBeEmpty();
  await context.setOffline(true);
  for (const [name,expected] of [['quadrants.heic',[255,0,0]],['orientation-6.jpg',[0,0,255]]]) {
    await page.locator('#photo').setInputFiles(fileURLToPath(new URL(`../fixtures/${name}`,import.meta.url)));
    await expect(page.locator('#save')).toBeEnabled({timeout:60000});
    const pixel=await page.locator('#crop').evaluate(c=>[...c.getContext('2d').getImageData(100,100,1,1).data].slice(0,3));
    for(let channel=0;channel<3;channel++) expect(Math.abs(pixel[channel]-expected[channel])).toBeLessThan(15);
    await page.locator('#clear').click();
  }
});

test('adjustments always use original pixels; comparison and reset restore the original',async({page})=>{
  await page.goto('./');await upload(page);await page.locator('#adjustments-tab').click();await page.locator('#allow-edits').check();
  const pixel=()=>page.locator('#crop').evaluate(c=>[...c.getContext('2d').getImageData(100,100,1,1).data]);
  const original=await pixel();
  await setRange(page,'brightness',10);const edited=await pixel();expect(edited).not.toEqual(original);
  await setRange(page,'brightness',-10);await setRange(page,'brightness',10);expect(await pixel()).toEqual(edited);
  await page.locator('#original').check();expect(await pixel()).toEqual(original);
  await page.locator('#original').uncheck();expect(await pixel()).toEqual(edited);
  await page.locator('#reset-edits').click();await expect(page.locator('#save')).toBeEnabled();expect(await pixel()).toEqual(original);
});

test('preset changes, metric dimensions, custom errors, and translated interface',async({page})=>{
  await page.goto('./');await upload(page);
  await page.locator('#country').selectOption('pt');await expect(page.locator('#save')).toBeEnabled();
  await expect(page.locator('#size-readout')).toHaveText('35×45 mm');
  expect(await page.locator('#crop').evaluate(el=>el.width/el.height)).toBeCloseTo(35/45,2);
  await expect(page.locator('#copy-count')).toHaveText('8 copies');
  await page.locator('#country').selectOption('custom');await page.locator('#width').fill('110');await page.locator('#height').fill('110');
  await expect(page.locator('#error')).toContainText('does not fit');await expect(page.locator('#save')).toBeDisabled();
  await page.locator('#width').fill('35');await page.locator('#height').fill('45');await expect(page.locator('#save')).toBeEnabled();
  await page.locator('#units').selectOption('inch');await expect(page.locator('#save')).toBeEnabled();await expect(page.locator('#copy-count')).toHaveText('8 copies');
  await page.locator('#language').selectOption('zh');await expect(page.locator('#save')).toHaveText('下载 JPEG');await expect(page.locator('#copy-count')).toHaveText('8 张');
  await page.locator('#country').selectOption('us');await page.locator('#document').selectOption('us-visa');
  await expect(page.locator('#preset-note')).toContainText('DS-160');
});

test('rejects corrupt, unsupported, oversized files and excessive pixel headers',async({page})=>{
  await page.goto('./');
  for(const [name,buffer,text] of [
    ['bad.jpg',Buffer.from([255,216,255,0]),'could not be opened'],
    ['bad.gif',Buffer.from('GIF89a'),'still JPEG'],
    ['large.png',Buffer.alloc(30*1024*1024+1),'30 MB'],
  ]) {
    await page.locator('#photo').setInputFiles({name,mimeType:'image/jpeg',buffer});
    await expect(page.locator('#error')).toContainText(text);await expect(page.locator('#save')).toBeDisabled();
  }
  const png=Buffer.alloc(33);png.set([137,80,78,71]);png.writeUInt32BE(12000,16);png.writeUInt32BE(12000,20);
  await page.locator('#photo').setInputFiles({name:'huge.png',mimeType:'image/png',buffer:png});await expect(page.locator('#error')).toContainText('50 megapixels');
});

test('phone layout fits 320px and keyboard/pointer controls change the crop',async({page})=>{
  await page.setViewportSize({width:320,height:740});await page.goto('./');await upload(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await setRange(page,'zoom',2);
  await page.locator('#crop').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#x')).toHaveValue('48');
  const crop=page.locator('#crop');const box=await crop.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+20,box.y+box.height/2);await page.mouse.up();
  expect(Number(await page.locator('#x').inputValue())).toBeLessThan(48);
});

test('synthetic 12, 24, and 48 megapixel photos use bounded working images',async({page})=>{
  test.setTimeout(90000);
  await page.goto('./');
  for (const [width,height,bounded,ppi] of [[4000,3000,false,1500],[6000,4000,true,1365],[8000,6000,true,1536]]) {
    await upload(page,await fixture(page,width,height));
    await expect(page.locator('#bounded')).toBeVisible({visible:bounded});
    await expect(page.locator('#resolution')).toContainText(`${ppi} ppi`);
    await page.locator('#clear').click();
  }
});

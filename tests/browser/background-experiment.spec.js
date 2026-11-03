import {test,expect} from '@playwright/test';

async function portrait(page){
  return Buffer.from(await page.evaluate(()=>{
    const c=document.createElement('canvas');c.width=600;c.height=800;const x=c.getContext('2d');
    x.fillStyle='#315c42';x.fillRect(0,0,600,800);x.fillStyle='#d9a080';x.beginPath();x.ellipse(300,300,120,170,0,0,Math.PI*2);x.fill();x.fillStyle='#172537';x.fillRect(150,470,300,330);
    return c.toDataURL('image/png').split(',')[1];
  }),'base64');
}

test('experiment runs real models locally, exports opaque PNG and private timing report',async({page},testInfo)=>{
  test.setTimeout(180000);
  const requests=[],errors=[];page.on('request',r=>requests.push({url:r.url(),method:r.method()}));page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto('src/background-experiment/');
  expect(requests.some(r=>/\/vendor\//.test(r.url))).toBe(false);
  const image=await portrait(page);
  await page.locator('#photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:image});
  await expect(page.locator('#run')).toBeEnabled();
  await page.locator('#run').click();
  await expect(page.locator('#status')).toHaveText(/finished in|Could not process|worker stopped/,{timeout:100000});
  if((await page.locator('#status').innerText()).includes('cannot run the model in a worker')){
    await expect(page.locator('#original')).toBeVisible();
    await expect(page.locator('#run')).toBeEnabled();
    await page.screenshot({path:testInfo.outputPath('experiment-unsupported.png'),fullPage:true});
    console.log(`${testInfo.project.name}: this desktop engine lacks worker canvas/WebGL2 support; verified recoverable unavailability, not real-model inference.`);
    return;
  }
  await expect(page.locator('#status')).toContainText('finished in');
  for(const model of ['multiclass','multiclass']){
    await page.locator('#model').selectOption(model);
    await page.locator('#run').click();
    await expect(page.locator('#status')).toHaveText(/finished in|Could not process|worker stopped/,{timeout:100000});
    await expect(page.locator('#status')).toContainText('finished in');
  }
  await expect(page.locator('#comparisons figure')).toHaveCount(3);
  const result=await page.locator('#comparisons figure').last().locator('img').evaluate(async img=>{
    await img.decode();const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;const x=c.getContext('2d');x.drawImage(img,0,0);const p=x.getImageData(0,0,1,1).data;return {width:c.width,height:c.height,pixel:Array.from(p)};
  });
  expect([result.width,result.height]).toEqual([600,800]);expect(result.pixel[3]).toBe(255);
  const download=page.waitForEvent('download');await page.locator('#report').click();
  const file=await download;const stream=await file.createReadStream();const chunks=[];for await(const chunk of stream)chunks.push(chunk);const report=JSON.parse(Buffer.concat(chunks).toString());
  expect(report.runs).toHaveLength(3);expect(report.runs[2].reused).toBe(true);
  expect(JSON.stringify(report)).not.toContain('synthetic.png');
  const origin=new URL(page.url()).origin;
  expect(requests.every(r=>r.method==='GET'&&(r.url.startsWith(origin+'/')||r.url.startsWith('blob:'+origin+'/')))).toBe(true);
  expect(errors).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:testInfo.outputPath('experiment-phone.png'),fullPage:true});
  console.log(JSON.stringify({browser:testInfo.project.name,runs:report.runs},null,2));
  await page.locator('#photo').setInputFiles({name:'broken.jpg',mimeType:'image/jpeg',buffer:Buffer.from('not a photo')});
  await expect(page.locator('#status')).toContainText('Choose a JPEG');
  await expect(page.locator('#comparisons figure')).toHaveCount(3);
  await page.locator('#clear').click();await expect(page.locator('#run')).toBeDisabled();await expect(page.locator('#comparisons figure:visible')).toHaveCount(0);
});

test('cancelled model download cannot install a stale result',async({page})=>{
  await page.goto('src/background-experiment/');
  await page.locator('#photo').setInputFiles({name:'synthetic.png',mimeType:'image/png',buffer:await portrait(page)});
  await expect(page.locator('#run')).toBeEnabled();
  let release;const gate=new Promise(resolve=>release=resolve);
  await page.route('**/selfie.tflite',async route=>{await gate;await route.continue().catch(()=>{});});
  const requested=page.waitForRequest('**/selfie.tflite');await page.locator('#run').click();await requested;
  await page.locator('#cancel').click();release();
  await expect(page.locator('#status')).toContainText('Cancelled');await expect(page.locator('#run')).toBeEnabled();await expect(page.locator('#comparisons figure')).toHaveCount(1);
});

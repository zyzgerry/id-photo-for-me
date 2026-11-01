import { test, expect } from '@playwright/test';
import { openApp } from './open-app.js';

test('real JPEG encoder meets near-maximum and tight caps without changing exact-pixel output',async({page})=>{
  await openApp(page,'single');
  const result=await page.evaluate(async()=>{
    const {exportSingle}=await import('./src/single.js');
    const image=document.createElement('canvas');image.width=412;image.height=529;
    const ctx=image.getContext('2d'),pixels=ctx.createImageData(412,529);let seed=21;
    for(let i=0;i<pixels.data.length;i+=4) {
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      pixels.data[i]=seed>>>24;pixels.data[i+1]=(i/4)%256;pixels.data[i+2]=150;pixels.data[i+3]=255;
    }
    ctx.putImageData(pixels,0,0);
    const options={width:412,height:529,maxBytes:Infinity,allowResize:false,minWidth:1,minHeight:1};
    const settings={ratio:412/529};
    const best=await exportSingle(image,settings,options);
    const unchanged=await exportSingle(image,settings,{...options,maxBytes:best.blob.size+1,allowResize:true});
    const near=await exportSingle(image,settings,{...options,maxBytes:best.blob.size-1,allowResize:true});
    const cap=Math.floor(best.blob.size*0.15);
    const tight=await exportSingle(image,settings,{...options,maxBytes:cap,allowResize:true});
    const bytes=async b=>Array.from(new Uint8Array(await b.arrayBuffer()));
    const decoded=await createImageBitmap(tight.blob);
    const actual=[decoded.width,decoded.height];decoded.close();
    return {best:await bytes(best.blob),unchanged:await bytes(unchanged.blob),
      near:{bytes:near.blob.size,width:near.width,height:near.height,quality:near.quality},
      tight:{bytes:tight.blob.size,width:tight.width,height:tight.height},cap,actual};
  });
  expect(result.unchanged).toEqual(result.best);
  expect(result.near.bytes).toBeLessThan(result.best.length);
  expect(result.near.width).toBe(412);expect(result.near.height).toBe(529);
  expect(result.near.quality).toBeGreaterThanOrEqual(0.9);
  expect(result.tight.bytes).toBeLessThanOrEqual(result.cap);
  expect(result.actual).toEqual([result.tight.width,result.tight.height]);
});

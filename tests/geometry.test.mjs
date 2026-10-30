import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutSheet, cropRect, withJpegDensity, mmToPx } from '../src/geometry.js';
import { inspectImage } from '../src/image.js';

test('six exact 2-inch copies tile a 1800x1200 sheet with shared boundaries', () => {
  const result = layoutSheet(50.8,50.8);
  assert.equal(result.count,6);
  assert.deepEqual(result.copies.map(c=>[c.x,c.y,c.width,c.height]),[
    [0,0,600,600],[600,0,600,600],[1200,0,600,600],
    [0,600,600,600],[600,600,600,600],[1200,600,600,600]]);
});
test('metric dimensions and rotated layouts stay within one pixel without shrinking', () => {
  for (const [w,h] of [[35,45],[45,35],[55,30],[10,10],[101.6,152.4],[152.4,101.6]]) {
    const layout=layoutSheet(w,h);
    const expected = Math.max(Math.floor((152.4+1e-8)/w)*Math.floor((101.6+1e-8)/h),Math.floor((152.4+1e-8)/h)*Math.floor((101.6+1e-8)/w));
    assert.equal(layout.count,expected);
    for (const c of layout.copies) {
      assert.ok(Math.abs(c.width-mmToPx(c.rotated?h:w))<1);
      assert.ok(Math.abs(c.height-mmToPx(c.rotated?w:h))<1);
      assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=1800&&c.y+c.height<=1200);
    }
  }
});
test('impossible and invalid custom dimensions fail explicitly', () => {
  for (const dims of [[0,35],[NaN,35],[Infinity,50],[9,10],[153,20],[110,110]]) assert.throws(()=>layoutSheet(...dims));
});
test('crop preserves proportions, matching frames, positions, and zoom', () => {
  assert.deepEqual(cropRect(700,900,35/45), {x:0,y:0,width:700,height:900});
  assert.deepEqual(cropRect(1200,800,1,1,100,0), {x:400,y:0,width:800,height:800});
  assert.deepEqual(cropRect(1200,800,1,2,50,50), {x:400,y:200,width:400,height:400});
});
test('JPEG density is 300ppi with no competing JFIF header', () => {
  const original=new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0,255,217]);
  const bytes=withJpegDensity(original);
  assert.equal(bytes.length,original.length);
  assert.deepEqual([...bytes.slice(13,18)],[1,1,44,1,44]);
  assert.deepEqual([...bytes.slice(-2)],[255,217]);
});
test('file headers enforce size limits before native decoding', () => {
  const bytes=new Uint8Array(33); const v=new DataView(bytes.buffer);
  bytes.set([137,80,78,71]);v.setUint32(16,12000);v.setUint32(20,12000);
  assert.throws(()=>inspectImage(bytes),/pixelLimit/);
  assert.throws(()=>inspectImage(new Uint8Array([71,73,70,56])),/unsupported/);
});

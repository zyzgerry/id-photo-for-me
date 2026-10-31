import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutSheet, cropRect, withJpegDensity, mmToPx } from '../src/geometry.js';
import { inspectImage } from '../src/image.js';
import { validateSingle } from '../src/single.js';
import { PRESETS, VERIFIED } from '../src/presets.js';
import { messages } from '../src/i18n.js';

test('every document preset has unique identity, bilingual guidance, dated sources and valid print geometry',()=>{
  const ids=new Set();
  for(const p of PRESETS) {
    assert.ok(!ids.has(p.id),`duplicate preset ${p.id}`);ids.add(p.id);
    assert.match(p.country,/^[a-z]{2}$/);assert.equal(new URL(p.source).protocol,'https:');
    assert.ok(p.sourceName);assert.match(p.checked||VERIFIED,/^\d{4}-\d{2}-\d{2}$/);
    for(const lang of ['en','zh']) {
      assert.ok(typeof p.document==='string'?messages[lang][p.document]:p.document[lang],`${p.id} document ${lang}`);
      assert.ok(typeof p.note==='string'?messages[lang][p.note]:p.note[lang],`${p.id} note ${lang}`);
      assert.notEqual(new Intl.DisplayNames([lang],{type:'region'}).of(p.country.toUpperCase()),p.country.toUpperCase());
    }
    if(p.head)assert.ok(p.head.length===2&&p.head[0]>0&&p.head[0]<=p.head[1]&&p.head[1]<1,`${p.id} head range`);
    const layout=layoutSheet(p.widthMm,p.heightMm);
    for(const c of layout.copies) {
      assert.ok(Math.abs(c.width-mmToPx(c.rotated?p.heightMm:p.widthMm))<1,`${p.id} width`);
      assert.ok(Math.abs(c.height-mmToPx(c.rotated?p.widthMm:p.heightMm))<1,`${p.id} height`);
      assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=1800&&c.y+c.height<=1200,`${p.id} bounds`);
    }
  }
  for(const [id,size] of [['us-passport',[50.8,50.8]],['cn-visa',[33,48]],['fi-passport',[36,47]],['dm-passport',[35,45]],['pe-visa',[50,50]]]) {
    const p=PRESETS.find(p=>p.id===id);assert.deepEqual([p.widthMm,p.heightMm],size);
  }
});

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

test('requested copy counts retain size, stay within capacity, and never overlap',()=>{
  for(const [w,h] of [[50.8,50.8],[35,45],[55,30],[10,10]]) {
    const maximum=layoutSheet(w,h).capacity;
    for(const n of [...new Set([1,Math.ceil(maximum/2),maximum])]) {
      const result=layoutSheet(w,h,n);assert.equal(result.count,n);assert.equal(result.copies.length,n);assert.equal(result.capacity,maximum);
      for(const [i,c] of result.copies.entries()) {
        assert.ok(Math.abs(c.width-mmToPx(c.rotated?h:w))<1);
        assert.ok(Math.abs(c.height-mmToPx(c.rotated?w:h))<1);
        assert.ok(c.x>=0&&c.y>=0&&c.x+c.width<=1800&&c.y+c.height<=1200);
        for(const other of result.copies.slice(i+1)) assert.ok(c.x+c.width<=other.x||other.x+other.width<=c.x||c.y+c.height<=other.y||other.y+other.height<=c.y);
      }
    }
    for(const invalid of [0,-1,1.5,maximum+1,NaN]) assert.throws(()=>layoutSheet(w,h,invalid),/copyLimit/);
  }
  const four=layoutSheet(50.8,50.8,4);assert.equal(four.columns,2);assert.equal(four.rows,2);
  assert.ok(layoutSheet(50.8,50.8,2).copies.every(c=>c.x>0&&c.y>0&&c.x+c.width<1800&&c.y+c.height<1200));
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

test('single-JPEG validation enforces pixel minimums and decimal-KB byte limits',()=>{
  const base={width:1200,height:900,maxKB:300,allowResize:true,minWidth:600,minHeight:450};
  assert.equal(validateSingle(base).maxBytes,300000);
  assert.equal(validateSingle({...base,maxKB:null}).maxBytes,Infinity);
  assert.equal(validateSingle({...base,maxKB:30.5}).maxBytes,30500);
  for(const change of [{width:0},{height:4097},{width:1.5},{minWidth:1201},{minHeight:901},{maxKB:0},{maxKB:Infinity}]) assert.throws(()=>validateSingle({...base,...change}),/singleDimensionsError/);
});

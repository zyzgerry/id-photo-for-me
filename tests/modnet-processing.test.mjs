import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareInput, buildMask, compositeWhite} from '../src/modnet-experiment/processing.js';
test('MODNet letterboxing preserves channels, normalization and neutral padding', () => {
 const rgba = Uint8Array.from({length:4*512*512}, (_,i) => [255,0,128,255][i%4]);
 const input = prepareInput(rgba,512,512), plane=512*768;
 assert.equal(input.length,3*plane);
 assert.equal(input[0],0);
 assert.equal(input[128*512],1);
 assert.equal(input[plane+128*512],-1);
 assert.ok(Math.abs(input[2*plane+128*512] - 1/255)<1e-7);
});
test('MODNet alpha removes letterbox and keeps opaque source pixels', () => {
 const values = new Float32Array(512*768);
 values.fill(1,128*512,640*512);
 const mask=buildMask(values,512,512);
 assert.ok(mask.every(v=>v===255));
 const pixels=new Uint8ClampedArray([32,64,128,255]);
 assert.deepEqual(Array.from(compositeWhite(pixels,new Uint8Array([255]))),[32,64,128,255]);
 assert.deepEqual(Array.from(compositeWhite(pixels,new Uint8Array([0]))),[255,255,255,255]);
 values[0]=NaN;
 assert.throws(()=>buildMask(values,512,512),/invalid alpha/);
 assert.throws(()=>prepareInput(new Uint8Array(0),0,512),/Invalid/);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareInput, buildMask, tightenFullMask, compositeWhite} from '../src/modnet-experiment/processing.js';
import {RECIPE} from '../src/modnet-experiment/model.js';
const baseline = {inputWidth: 512, inputHeight: 768};

test('MODNet letterboxing preserves channels, normalization and neutral padding', () => {
 const rgba = Uint8Array.from({length:4*512*512}, (_,i) => [255,0,128,255][i%4]);
 const input = prepareInput(rgba,512,512,baseline), plane=512*768;
 assert.equal(input.length,3*plane);
 assert.equal(input[0],0);
 assert.equal(input[128*512],1);
 assert.equal(input[plane+128*512],-1);
 assert.ok(Math.abs(input[2*plane+128*512] - 1/255)<1e-7);
});
test('MODNet alpha removes letterbox and keeps opaque source pixels', () => {
 const values = new Float32Array(512*768);
 values.fill(1,128*512,640*512);
 const mask=buildMask(values,512,512,baseline);
 assert.ok(mask.every(v=>v===255));
 const pixels=new Uint8ClampedArray([32,64,128,255]);
 assert.deepEqual(Array.from(compositeWhite(pixels,new Uint8Array([255]))),[32,64,128,255]);
 assert.deepEqual(Array.from(compositeWhite(pixels,new Uint8Array([0]))),[255,255,255,255]);
 values[0]=NaN;
 assert.throws(()=>buildMask(values,512,512,baseline),/invalid alpha/);
 assert.throws(()=>prepareInput(new Uint8Array(0),0,512),/Invalid/);
});
test('The selected resolution uses neutral padding and tightens the entire quantized mask', () => {
 const {inputWidth: width, inputHeight: height} = RECIPE;
 assert.deepEqual([width, height], [1024, 1536]);
 const input = prepareInput(new Uint8Array(4 * width * width).fill(255), width, width);
 assert.equal(input[255 * width], 0);
 assert.equal(input[256 * width], 1);
 assert.equal(input[width * height - 1], 0);
 const mask = new Uint8Array([0, 51, 64, 128, 178, 179, 255]);
 tightenFullMask(mask);
 assert.deepEqual(Array.from(mask), [0, 0, 22, 128, 212, 213, 255]);
});

test('MODNet letterboxing retains one row for an extremely wide supported image', () => {
 const {inputWidth, inputHeight} = RECIPE;
 const input = prepareInput(new Uint8Array(4096 * 4).fill(255), 4096, 1);
 assert.equal(input[(inputHeight / 2 - 1) * inputWidth], 1);
});

test('MODNet rejects a mask that would erase the whole photo', () => {
 const empty = new Uint8Array([0, 15, 51]);
 assert.throws(() => tightenFullMask(empty), /no foreground/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resizeBytes, prepareInput, protectMask, buildMask, compositeWhite} from '../src/portrait-experiment/processing.js';

const fixtures = JSON.parse(await readFile(new URL('./fixtures/portrait-resample.json', import.meta.url), 'utf8'));
for (const [index, f] of fixtures.entries()) test(`portrait Lanczos resampling matches Pillow golden ${index + 1}`, () => {
  const output = resizeBytes(Uint8Array.from(f.input), f.width, f.height, f.outWidth, f.outHeight, f.channels);
  assert.deepEqual(Array.from(output), f.expected);
});
test('portrait preprocessing uses RGB maximum, excludes alpha, and orders channels', () => {
  const input = prepareInput(Uint8Array.from([128, 64, 32, 255]), 1, 1), n = 1024 * 1024;
  assert.equal(input.length, 3 * n);
  assert.equal(input[0], Math.fround((1 - .485) / .229));
  assert.equal(input[n], Math.fround((.5 - .456) / .224));
  assert.equal(input[2 * n], Math.fround((.25 - .406) / .225));
});
test('portrait mask protects interiors and preserves soft boundaries', () => {
  const mask = protectMask(new Uint8Array(81).fill(254), 9, 9);
  assert.equal(mask[4 * 9 + 4], 255); assert.equal(mask[0], 254);
  const low = protectMask(Uint8Array.from([0, 1, 2, 3]), 2, 2);
  assert.deepEqual(Array.from(low), [0, 0, 0, 3]);
});
test('portrait compositing retains opaque source RGB and makes empty background white', () => {
  const source = Uint8ClampedArray.from([17, 40, 80, 255, 80, 90, 100, 255, 20, 40, 60, 255]);
  const result = compositeWhite(source, Uint8Array.from([255, 0, 128]));
  assert.deepEqual(Array.from(result.slice(0, 8)), [17, 40, 80, 255, 255, 255, 255, 255]);
  assert.deepEqual(Array.from(result.slice(8)), [137, 147, 157, 255]);
});
test('portrait processing rejects invalid dimensions and unusable outputs', () => {
  assert.throws(() => resizeBytes(new Uint8Array(2), 1, 1, 2, 2, 4));
  assert.throws(() => buildMask(new Float32Array(4), 2, 2), /distinguish/);
  assert.throws(() => buildMask(Float32Array.from([0, NaN, 1, 2]), 2, 2), /invalid mask/);
});

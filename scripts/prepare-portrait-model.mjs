import {mkdir, stat, readFile, writeFile, rename, rm, mkdtemp} from 'node:fs/promises';
import {createReadStream, createWriteStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, dirname, basename} from 'node:path';
import {once} from 'node:events';
import assert from 'node:assert/strict';
import {MODEL} from '../src/portrait-experiment/model.js';

const root = resolve(import.meta.dirname, '..'), models = resolve(root, 'dist/models'), target = resolve(models, MODEL.directory);
assert(target.startsWith(models + '/') || target.startsWith(models + '\\'));
await mkdir(models, {recursive: true});
const work = await mkdtemp(resolve(models, '.portrait-'));
assert(dirname(work) === models && basename(work).startsWith('.portrait-'));
let completed = false;
try {
  let source;
  if (process.env.PORTRAIT_MODEL_FILE) source = createReadStream(resolve(process.env.PORTRAIT_MODEL_FILE));
  else {
    const response = await fetch(MODEL.source, {signal: AbortSignal.timeout(600000)});
    if (!response.ok || !response.body) throw new Error(`Model asset download failed (${response.status})`);
    source = response.body;
  }
  const hash = createHash('sha256'); let part = 0, written = 0, total = 0, stream;
  const open = () => { stream = createWriteStream(resolve(work, `part-${part}.bin`)); stream.on('error', () => {}); };
  const close = async () => { stream.end(); await once(stream, 'finish'); };
  open();
  try {
    for await (const value of source) {
      const buffer = Buffer.from(value); hash.update(buffer); let offset = 0;
      while (offset < buffer.length) {
        if (part >= MODEL.partSizes.length) throw new Error('Model exceeds expected length');
        const count = Math.min(buffer.length - offset, MODEL.partSizes[part] - written);
        if (!stream.write(buffer.subarray(offset, offset + count))) await once(stream, 'drain');
        offset += count; written += count; total += count;
        if (written === MODEL.partSizes[part]) { await close(); part++; written = 0; if (part < MODEL.partSizes.length) open(); }
      }
    }
  } finally { if (!stream.closed && !stream.writableFinished) { const closed = once(stream, 'close'); stream.destroy(); await closed; } }
  if (total !== MODEL.bytes || part !== MODEL.partSizes.length || hash.digest('hex') !== MODEL.sha256) throw new Error('Model asset integrity check failed');
  const manifest = {sha256: MODEL.sha256, bytes: total, parts: MODEL.partSizes.map((bytes, i) => ({file: `part-${i}.bin`, bytes}))};
  for (let i = 0; i < MODEL.partSizes.length; i++) assert.equal((await stat(resolve(work, `part-${i}.bin`))).size, MODEL.partSizes[i]);
  await writeFile(resolve(work, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await writeFile(resolve(work, 'MODEL-NOTICE.txt'), await readFile(resolve(root, 'src/portrait-experiment/MODEL-NOTICE.txt')));
  try { await stat(target); throw new Error('Model output already exists; run a fresh build first.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  await rename(work, target); completed = true;
  console.log(`Verified model prepared outside Git: ${total} bytes in ${part} same-origin parts.`);
} finally {
  if (!completed) { assert(dirname(work) === models && basename(work).startsWith('.portrait-')); await rm(work, {recursive: true, force: true}); }
}

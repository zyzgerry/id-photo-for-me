import {MODEL} from './model.js';
import {prepareInput, buildMask, compositeWhite} from './processing.js';
let session, ort, mode, preparation;
const now = () => performance.now();
const send = (id, data, transfer = []) => self.postMessage({id, ...data}, transfer);
const stage = (id, code, text) => send(id, {stage: code, status: text});

async function prepare({id, base, provider, fresh}) {
  if (session) throw new Error('Release the previous model before preparing another.');
  mode = provider;
  if (!['webgpu', 'wasm'].includes(mode)) throw new Error('Choose graphics or CPU mode.');
  const started = now(), capabilities = {secureContext: self.isSecureContext, workerGpu: !!navigator.gpu};
  if (!self.isSecureContext) throw new Error('Open this test through its HTTPS link.');
  if (mode === 'webgpu') {
    stage(id, 'capabilities', 'Checking graphics support…');
    const adapter = await navigator.gpu?.requestAdapter();
    if (!adapter) throw new Error('Graphics acceleration is unavailable. Select CPU compatibility mode and prepare again.');
    capabilities.limits = {maxBufferSize: adapter.limits.maxBufferSize, maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize, maxStorageBuffersPerShaderStage: adapter.limits.maxStorageBuffersPerShaderStage};
    if (adapter.limits.maxBufferSize < 1006632960 || adapter.limits.maxStorageBufferBindingSize < 1006632960) throw new Error('This browser’s graphics limits are too small for this model. Try CPU compatibility mode.');
  }
  stage(id, 'download', 'Downloading the model…');
  await import('./vendor/sha256.js');
  let hasher = await globalThis.hashwasm.createSHA256(); hasher.init();
  let bytes = new Uint8Array(MODEL.bytes), offset = 0, hashMs = 0, lastProgress = 0;
  const downloadStart = now(), origin = new URL(base);
  if (origin.origin !== self.location.origin) throw new Error('The model must come from this test site.');
  for (let part = 0; part < MODEL.partSizes.length; part++) {
    const response = await fetch(new URL(`part-${part}.bin`, origin), {cache: fresh ? 'reload' : 'default', credentials: 'omit'});
    if (!response.ok) throw new Error(`Model download failed (${response.status}). Retry with a stable connection.`);
    let received = 0;
    const consume = value => {
      if (received + value.length > MODEL.partSizes[part]) throw new Error('The model download has an unexpected size.');
      bytes.set(value, offset); offset += value.length; received += value.length;
      const t = now(); hasher.update(value); hashMs += now() - t;
      if (now() - lastProgress > 100 || offset === MODEL.bytes) { send(id, {progress: {current: offset, total: MODEL.bytes}}); lastProgress = now(); }
    };
    if (response.body) {
      const reader = response.body.getReader();
      try { for (;;) { const {done, value} = await reader.read(); if (done) break; consume(value); } }
      finally { reader.releaseLock(); }
    } else consume(new Uint8Array(await response.arrayBuffer()));
    if (received !== MODEL.partSizes[part]) throw new Error('The model download was incomplete. Prepare again with Fresh download selected.');
  }
  const downloadMs = now() - downloadStart;
  stage(id, 'verify', 'Checking the downloaded model…');
  if (offset !== MODEL.bytes || hasher.digest('hex') !== MODEL.sha256) throw new Error('The model integrity check failed. Select Fresh download and prepare again.');
  hasher = null;
  stage(id, 'initialize', mode === 'webgpu' ? 'Preparing graphics processing…' : 'Preparing CPU processing…');
  ort = await import(mode === 'webgpu' ? './vendor/ort.webgpu.min.mjs' : './vendor/ort.wasm.min.mjs');
  ort.env.wasm.wasmPaths = new URL('./vendor/', import.meta.url).href;
  ort.env.wasm.numThreads = 1; ort.env.wasm.proxy = false;
  const init = now();
  session = await ort.InferenceSession.create(bytes, {
    executionProviders: mode === 'webgpu' ? [{name: 'webgpu', defaultBufferCacheMode: 'disabled'}, 'wasm'] : ['wasm'],
    graphOptimizationLevel: 'disabled', logSeverityLevel: 2,
  });
  bytes = null;
  preparation = {mode, modelHash: MODEL.sha256, modelBytes: MODEL.bytes, downloadMs, streamingHashCpuMs: hashMs, initializeMs: now() - init, totalMs: now() - started, cacheRequest: fresh ? 'reload' : 'default', capabilities, runtime: ort.env.versions};
  const resources = performance.getEntriesByType('resource').filter(r => /\/vendor\/|\/models\//.test(r.name)).map(r => ({url: r.name, durationMs: r.duration, transferBytes: r.transferSize ?? null, encodedBodyBytes: r.encodedBodySize ?? null, decodedBodyBytes: r.decodedBodySize ?? null}));
  send(id, {ready: true, preparation: {...preparation, resources}});
}

async function run({id, pixels, width, height}) {
  if (!session) throw new Error('Prepare the model first.');
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || Math.max(width, height) > 4096 || pixels.length !== width * height * 4) throw new Error('Invalid working image.');
  const started = now(); let tensor, output;
  try {
    stage(id, 'preprocess', 'Preparing the photo…');
    const input = prepareInput(pixels, width, height), prepared = now();
    tensor = new ort.Tensor('float32', input, [1, 3, 1024, 1024]);
    stage(id, 'inference', 'Removing the background…');
    const infer = now(); output = await session.run({[session.inputNames[0]]: tensor});
    const values = await output[session.outputNames[0]].getData(), inferred = now();
    if (values.length !== 1024 * 1024) throw new Error('Unexpected model output dimensions.');
    stage(id, 'mask', 'Finishing the edges and keeping the original colors…');
    const mask = buildMask(values, width, height); compositeWhite(pixels, mask);
    const composited = now();
    const timing = {mode, width, height, reusedModel: true, prepareImageMs: prepared - started, inferenceMs: inferred - infer, maskAndCompositeMs: composited - inferred};
    stage(id, 'encode', 'Preparing the full-size PNG…');
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(width, height), ctx = canvas.getContext('2d', {colorSpace: 'srgb'});
      if (ctx && canvas.convertToBlob) {
        ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
        const blob = await canvas.convertToBlob({type: 'image/png'}); canvas.width = canvas.height = 1;
        timing.encodeMs = now() - composited; timing.workerTotalMs = now() - started;
        send(id, {result: {blob, width, height}, timing}); return;
      }
    }
    timing.encodeMs = 0; timing.workerTotalMs = now() - started;
    send(id, {result: {pixels, width, height}, timing}, [pixels.buffer]);
  } finally { if (output) for (const value of Object.values(output)) value.dispose(); tensor?.dispose(); }
}

self.onmessage = async ({data}) => {
  try { if (data.type === 'prepare') await prepare(data); else if (data.type === 'run') await run(data); else throw new Error('Unknown test action.'); }
  catch (error) { send(data.id, {error: String(error.message || error)}); }
};

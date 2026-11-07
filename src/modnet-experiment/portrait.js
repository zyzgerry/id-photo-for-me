import {decodePhoto} from '../image.js';
import {MODEL, RECIPE} from './model.js';
const $ = id => document.getElementById(id), checkpointKey = 'modnet-checkpoint-v1';
const build = document.documentElement.dataset.release || 'modnet-development';
let worker, ready = false, busy = false, active = 0, source, originalUrl, resultUrl, photoSession = 0, phase = 'idle', started = 0, ticker, deadline;
let priorCheckpoint;
const mode = 'wasm';
const runs = [], errors = [], preparations = [], stages = [];
try { priorCheckpoint = JSON.parse(localStorage.getItem(checkpointKey) || 'null'); } catch {}
function controls() {
  $('run').disabled = busy || !source;
  $('release').disabled = busy || !worker; $('cancel').disabled = !busy; $('fresh').disabled = busy;
  $('photo').disabled = busy;
}
function checkpoint(state) {
  const record = {build, modelHash: MODEL.sha256, at: new Date().toISOString(), state, phase, mode, recipe: RECIPE.key, photoSession, completedRuns: runs.length};
  try { localStorage.setItem(checkpointKey, JSON.stringify(record)); } catch {}
}
function status(text, code = phase) { phase = code; $('status').textContent = text; stages.push({at: new Date().toISOString(), phase}); if (stages.length > 100) stages.shift(); checkpoint(busy ? 'busy' : 'idle'); }
function finish() { busy = false; clearTimeout(deadline); clearInterval(ticker); $('progress').hidden = true; controls(); checkpoint('idle'); }
function terminate() { worker?.terminate(); worker = null; ready = false; $('model-status').textContent = 'The next run will prepare the model.'; }
function cancel(message = 'Cancelled. Your original photo and previous result are preserved.') { active++; terminate(); finish(); status(message, 'cancelled'); }
function fail(raw) {
  errors.push({at: new Date().toISOString(), phase, mode, recipe: RECIPE.key, message: raw});
  let message = raw;
  if (/bad_alloc|out of memory|memory access|unaligned|null function/i.test(raw)) message = 'Processing stopped while allocating or using working memory. Release other heavy tabs and retry. ';
  if (/dynamically imported module|processing tools/i.test(raw)) message = 'The processing tools could not load. Reload this page and retry.';
  cancel(`Could not finish: ${message}`); phase = 'error'; checkpoint('error');
}
function begin(code, timeout) {
  busy = true; phase = code; started = performance.now(); const id = ++active; controls();
  $('elapsed').textContent = 'Elapsed: 0 seconds';
  ticker = setInterval(() => { $('elapsed').textContent = `Elapsed: ${Math.floor((performance.now() - started) / 1000)} seconds`; }, 1000);
  deadline = setTimeout(() => { if (id === active) fail('This attempt exceeded its time limit. Check the connection and retry.'); }, timeout);
  checkpoint('busy'); return id;
}
function measurements() {
  const lines = preparations.map((p, i) => `Preparation ${i + 1}: ${(p.totalMs / 1000).toFixed(1)} s total · download ${(p.downloadMs / 1000).toFixed(1)} s · initialization ${(p.initializeMs / 1000).toFixed(1)} s`);
  for (const r of runs) lines.push(`Photo ${r.photoSession}, run ${r.run}: ${RECIPE.label} · ${(r.totalMs / 1000).toFixed(1)} s total · model ${(r.inferenceMs / 1000).toFixed(1)} s`);
  $('measurements').textContent = lines.join('\n\n') || 'No completed runs yet.';
}
async function acceptResult(data, id) {
  let blob = data.result.blob, fallbackEncodeMs = 0;
  if (!blob) {
    const t = performance.now(), canvas = document.createElement('canvas'); canvas.width = data.result.width; canvas.height = data.result.height;
    canvas.getContext('2d', {colorSpace: 'srgb'}).putImageData(new ImageData(data.result.pixels, canvas.width, canvas.height), 0, 0);
    blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png')); canvas.width = canvas.height = 1; fallbackEncodeMs = performance.now() - t;
  }
  if (id !== active) return;
  if (!blob?.size) throw new Error('The PNG could not be encoded. Retry or release model memory.');
  if (resultUrl) URL.revokeObjectURL(resultUrl); resultUrl = URL.createObjectURL(blob);
  $('result').src = resultUrl; $('result-open').href = resultUrl; $('save').href = resultUrl;
  const recipeKey = data.timing.recipe;
  $('result-label').textContent = RECIPE.label + ' · white background';
  $('save').download = `modnet-${recipeKey}-photo${photoSession}-run${runs.length + 1}.png`; $('result-figure').hidden = false;
  runs.push({...data.timing, photoSession, run: runs.length + 1, encodeMs: data.timing.encodeMs + fallbackEncodeMs, totalMs: performance.now() - started, pngBytes: blob.size});
  measurements(); finish(); status(`Finished in ${(runs.at(-1).totalMs / 1000).toFixed(1)} seconds. Inspect and save the result, then run it again.`, 'complete');
}
function attachWorker() {
  const instance = new Worker(new URL('./worker.js', import.meta.url), {type: 'module'}); worker = instance;
  instance.onerror = () => { if (worker === instance) fail('The browser stopped processing. The report includes the last completed stage.'); };
  instance.onmessage = async ({data}) => {
    if (worker !== instance || data.id !== active) return;
    if (data.stage) { status(data.status, data.stage); $('progress').hidden = data.stage !== 'download'; }
    if (data.progress) { $('progress').hidden = false; $('progress').max = data.progress.total; $('progress').value = data.progress.current; $('model-status').textContent = `Downloaded ${(data.progress.current / 1000000).toFixed(1)} / ${(data.progress.total / 1000000).toFixed(1)} MB`; }
    if (data.error) { fail(data.error); return; }
    if (data.ready) {
      ready = true; preparations.push(data.preparation); measurements(); finish();
      $('model-status').textContent = `Model verified and prepared in ${(data.preparation.totalMs / 1000).toFixed(1)} seconds. It stays in memory until released or this page closes.`;
      startRun(false);
    }
    if (data.result) { try { await acceptResult(data, data.id); } catch (error) { if (data.id === active) fail(error.message); } }
  };
  return instance;
}
function startRun(reusedModel) {
  const id = begin('preprocess', 300000); status('Preparing the photo…', 'preprocess');
  try {
    const pixels = source.getContext('2d').getImageData(0, 0, source.width, source.height).data;
    worker.postMessage({type: 'run', id, pixels, width: source.width, height: source.height, reusedModel}, [pixels.buffer]);
  } catch (error) { fail(error.message); }
}
$('run').onclick = () => {
  if ($('run').disabled) return;
  const fresh = $('fresh').checked;
  if (ready && !fresh) { startRun(true); return; }
  if (worker) terminate();
  const id = begin('download', 600000);
  status('Preparing the model…', 'download');
  const base = new URL('../../models/' + MODEL.directory + '/', document.baseURI).href;
  try {
    attachWorker().postMessage({type: 'prepare', id, base, provider: mode, fresh});
    $('fresh').checked = false;
  } catch (error) { fail(error.message); }
};
$('cancel').onclick = () => cancel();
$('release').onclick = () => { active++; terminate(); finish(); status('Model memory released. Your photo and result are preserved.', 'released'); };
$('photo').onchange = async () => {
  const file = $('photo').files[0]; if (!file) return;
  if (busy) cancel(); const id = begin('decode', 60000); status('Opening the photo…', 'decode');
  try {
    const decoded = await decodePhoto(file);
    if (id !== active) { decoded.canvas.width = decoded.canvas.height = 1; return; }
    const blob = await new Promise(resolve => decoded.canvas.toBlob(resolve, 'image/png'));
    if (id !== active) { decoded.canvas.width = decoded.canvas.height = 1; return; }
    if (!blob) throw new Error('Could not prepare the original preview.');
    if (source) source.width = source.height = 1; source = decoded.canvas; photoSession++;
    if (originalUrl) URL.revokeObjectURL(originalUrl); if (resultUrl) URL.revokeObjectURL(resultUrl); resultUrl = null;
    originalUrl = URL.createObjectURL(blob); $('original').src = originalUrl; $('original-open').href = originalUrl; $('original-figure').hidden = false;
    $('result').removeAttribute('src'); $('result-figure').hidden = true;
    $('photo-info').textContent = `Original: ${decoded.originalWidth} × ${decoded.originalHeight}. Working image: ${source.width} × ${source.height}.`;
    finish(); status('Photo ready. Choose Remove background.', 'ready');
  } catch (error) {
    if (id !== active) return;
    const messages = {fileLimit: 'Choose a photo up to 30 MB.', pixelLimit: 'Choose a photo up to 50 megapixels and 12,000 pixels per side.', unsupported: 'Choose a JPEG, PNG or HEIC photo.', decodeError: 'Could not open this photo. Try a JPEG exported from Photos.', decoderError: 'HEIC decoding failed. Retry or choose a JPEG.'};
    errors.push({at: new Date().toISOString(), phase: 'decode', message: error.message}); finish(); status(messages[error.message] || error.message, 'error');
  }
};
$('report').onclick = () => {
  const report = {build, date: new Date().toISOString(), device: $('device').value, os: $('os').value, deviceLabelSource: 'user-entered, not hardware detection', notes: $('notes').value, userAgent: navigator.userAgent, secureContext: isSecureContext, graphicsApi: !!navigator.gpu, crossOriginIsolated, model: MODEL, recipes: {[RECIPE.key]: RECIPE}, preparations, runs, errors, stages, priorCheckpoint, lastStage: phase, measurementNotes: 'All photos stay on device. Download timing includes streaming hash work. Transfer bytes may be zero for cached or unavailable browser measurements; zero alone does not prove a cache hit. Preparation and image processing timings are recorded separately. No total device-memory measurement is available. Full image, letterboxed MODNet. Each run records the option and input dimensions.'};
  const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], {type: 'application/json'})), link = document.createElement('a');
  link.href = url; link.download = 'modnet-report.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
};
$('reset').onclick = () => {
  active++; terminate(); finish(); if (source) source.width = source.height = 1; source = null;
  for (const url of [originalUrl, resultUrl]) if (url) URL.revokeObjectURL(url); originalUrl = resultUrl = null;
  for (const id of ['original', 'result']) $(id).removeAttribute('src'); $('original-figure').hidden = $('result-figure').hidden = true;
  $('photo').value = ''; $('fresh').checked = false; $('photo-info').textContent = ''; $('elapsed').textContent = ''; $('notes').value = '';
  runs.length = errors.length = preparations.length = stages.length = 0; priorCheckpoint = null; photoSession = 0;
  measurements(); status('Test reset. Choose a photo.', 'idle'); try { localStorage.removeItem(checkpointKey); } catch {} controls();
};
const phaseNames={download:'the model download',verify:'the model check',initialize:'model preparation',preprocess:'photo preparation',inference:'background removal',mask:'finishing the edges',encode:'PNG export',decode:'opening the photo'};
if (priorCheckpoint?.state === 'busy') $('status').textContent = `The previous attempt ended during ${phaseNames[priorCheckpoint.phase]||priorCheckpoint.phase}. Its photo-free stage marker will be included in the report.`;
controls();

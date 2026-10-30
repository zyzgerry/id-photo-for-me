import { PRESETS, VERIFIED } from './presets.js';
import { messages } from './i18n.js';
import { layoutSheet, cropRect } from './geometry.js';
import { renderCrop, renderSheet, exportJpeg } from './render.js';
import { decodePhoto, prepareDecoder } from './image.js';

const $ = id => document.getElementById(id);
let lang = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
let photo = null, preset = PRESETS[0], layout = null;
let file = null, downloadUrl = null, revision = 0, renderTimer, loading = false;
let statusKey = '', errorKey = '', exportKey = '';
const settings = { ratio: 1, zoom: 1, x: 50, y: 50, brightness: 0, contrast: 0 };
const t = key => messages[lang][key] || messages[lang].decodeError;
const sizeLabel = () => {
  if (!layout) return '';
  return preset?.country === 'us' ? (lang === 'zh' ? '2×2 英寸' : '2×2 inches') :
    `${Number(layout.widthMm.toFixed(3))}×${Number(layout.heightMm.toFixed(3))} ${lang === 'zh' ? '毫米' : 'mm'}`;
};

function setStatus(key = '') { statusKey = key; $('status').textContent = key ? t(key) : ''; }
function setError(key = '') { errorKey = key; $('error').textContent = key ? t(key) : ''; $('error').hidden = !key; }
function setExport(key = '') { exportKey = key; $('export-status').textContent = key ? t(key) : ''; }
function discardExport() {
  file = null; if (downloadUrl) URL.revokeObjectURL(downloadUrl); downloadUrl = null;
  $('save').disabled = $('share').disabled = true;
}
function updateLanguage() {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  document.title = t('title'); $('language').value = lang;
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  $('crop').ariaLabel = lang === 'zh' ? '裁剪预览，可用方向键移动照片' : 'Crop preview; use arrow keys to move the photo';
  $('sheet').ariaLabel = lang === 'zh' ? '完整的 4×6 英寸打印排版' : 'Complete 4 by 6 inch print sheet';
  $('photo').ariaLabel = t(photo ? 'replace' : 'choose');
  $('language').ariaLabel = t('language');
  $('tool-tabs').ariaLabel = lang === 'zh' ? '照片调整工具' : 'Photo editing tools';
  $('choose-label').textContent = t(photo ? 'replace' : 'choose');
  updateDocuments(false); updatePresetDetails();
  setStatus(statusKey); setError(errorKey); setExport(exportKey); updateReadouts();
}

function updateDocuments(reset = true) {
  const old = $('document').value;
  $('document').replaceChildren(...PRESETS.filter(p => p.country === $('country').value).map(p => {
    const option = document.createElement('option'); option.value = p.id; option.textContent = t(p.document); return option;
  }));
  if (!reset && [...$('document').options].some(o => o.value === old)) $('document').value = old;
}

function updatePresetDetails() {
  $('custom-fields').hidden = $('country').value !== 'custom';
  $('document-fields').hidden = $('country').value === 'custom';
  $('preset-note').textContent = t(preset?.note || 'customNote');
  $('preset-reference').hidden = !preset;
  if (preset) {
    $('reference').href = preset.source;
    $('reference').textContent = `${t('reference')}: ${preset.sourceName}`;
    $('verified').textContent = `${t('checked')}: ${VERIFIED}`;
  }
  $('guide-control').hidden = !preset?.head;
  $('allow-edits-row').hidden = !preset?.restrictEdits;
  $('adjust-controls').disabled = !photo || (!!preset?.restrictEdits && !$('allow-edits').checked);
}

function chooseSize() {
  const previousRatio = settings.ratio;
  preset = PRESETS.find(p => p.id === $('document').value) || null;
  if ($('country').value === 'custom') preset = null;
  const multiplier = $('units').value === 'inch' ? 25.4 : 1;
  const width = preset?.widthMm ?? Number($('width').value) * multiplier;
  const height = preset?.heightMm ?? Number($('height').value) * multiplier;
  setError();
  try {
    layout = layoutSheet(width, height); settings.ratio = width / height;
    if (Math.abs(previousRatio - settings.ratio) > 1e-6) {
      settings.x = settings.y = 50; settings.zoom = 1;
      if (photo) setStatus('cropChanged');
    }
  } catch (e) { layout = null; setError(e.message === 'noFit' ? 'noFit' : 'dimensionsError'); }
  $('allow-edits').checked = false;
  settings.brightness = settings.contrast = 0;
  updatePresetDetails(); updateReadouts(); scheduleRender();
}

function updateReadouts() {
  $('cut-note').textContent = t($('cut-guides').checked ? 'cut' : 'cutPlain');
  for (const key of ['zoom','x','y','brightness','contrast']) {
    $(key).value = settings[key];
    $(`${key}-value`).textContent = key === 'zoom' ? `${settings[key].toFixed(2)}×` :
      ['x','y'].includes(key) ? `${Math.round(settings[key])}%` : settings[key];
  }
  $('size-readout').textContent = sizeLabel();
  $('copy-count').textContent = layout ? `${layout.count} ${t('copies')}` : '';
  $('rotated').hidden = !layout?.rotated;
  $('bounded').hidden = !photo || Math.max(photo.originalWidth,photo.originalHeight) <= 4096;
  $('resolution').textContent = '';
  $('upscale').hidden = true;
  if (photo && layout) {
    const rect = cropRect(photo.canvas.width, photo.canvas.height, settings.ratio, settings.zoom,settings.x,settings.y);
    const ppi = Math.floor(Math.min(rect.width / (layout.widthMm / 25.4), rect.height / (layout.heightMm / 25.4)));
    $('resolution').textContent = `${t('resolution')}: ${ppi} ppi`;
    $('upscale').hidden = ppi >= 300;
  }
  const showGuides = !!photo && !!preset?.head && $('guides').checked;
  $('guide-overlay').hidden = $('guide-note').hidden = !showGuides;
  $('guide-overlay').replaceChildren();
  if (showGuides) {
    for (const fraction of preset.head) {
      for (const position of [(1 - fraction)/2, (1 + fraction)/2]) {
        const line = document.createElement('div'); line.className = 'guide-line'; line.style.top = `${position*100}%`;
        $('guide-overlay').append(line);
      }
    }
  }
}

function scheduleRender() {
  const current = ++revision;
  clearTimeout(renderTimer); discardExport(); setExport();
  if (!photo || !layout) {
    $('sheet').hidden = true; $('sheet-empty').hidden = false; return;
  }
  drawCrop(); updateReadouts();
  setExport('saving');
  renderTimer = setTimeout(async () => {
    let sheet;
    try {
      sheet = renderSheet(photo.canvas, settings, layout, $('cut-guides').checked);
      const jpeg = await exportJpeg(sheet);
      if (current !== revision) return;
      $('sheet').getContext('2d').drawImage(sheet,0,0);
      $('sheet').hidden = false; $('sheet-empty').hidden = true;
      file = new File([jpeg], 'id-photo-4x6-300ppi.jpg', { type: 'image/jpeg' });
      $('save').disabled = false;
      $('share').hidden = !navigator.canShare || !navigator.canShare({ files: [file] });
      $('share').disabled = $('share').hidden;
      setExport();
    } catch { if (current === revision) { setError('exportError'); setExport(); $('sheet').hidden = true; $('sheet-empty').hidden = false; } }
    finally { if (sheet) sheet.width = sheet.height = 1; }
  }, 110);
}

function drawCrop() {
  if (!photo || !layout) return;
  const width = Math.round(600 * Math.min(1,settings.ratio));
  const height = Math.round(width / settings.ratio);
  const preview = renderCrop(photo.canvas, settings, width, height, $('original').checked);
  $('crop').width = width; $('crop').height = height;
  $('crop').getContext('2d').drawImage(preview,0,0);
  preview.width = preview.height = 1;
  // Keep overlay and canvas bounds identical even for a tall custom photo.
  $('crop-wrap').style.setProperty('--crop-ratio', settings.ratio);
}

function clearPhoto() {
  selectTool('framing');
  revision++; clearTimeout(renderTimer); discardExport();
  if (photo) photo.canvas.width = photo.canvas.height = 1;
  photo = null; $('photo').value = ''; $('clear').disabled = true;
  document.querySelector('.file-button').classList.replace('quiet','primary');
  $('edit-controls').disabled = $('reset-crop').disabled = true;
  $('crop-empty').hidden = false; $('crop-wrap').hidden = true;
  $('sheet').hidden = true; $('sheet-empty').hidden = false;
  for (const id of ['crop','sheet']) $(id).getContext('2d').clearRect(0,0,$(id).width,$(id).height);
  Object.assign(settings, { zoom:1,x:50,y:50,brightness:0,contrast:0 });
  $('allow-edits').checked = $('original').checked = false;
  $('choose-label').textContent = t('choose'); setStatus(); setError(); setExport(); updatePresetDetails(); updateReadouts();
}

$('photo').addEventListener('change', async event => {
  const selected = event.target.files[0]; if (!selected || loading) return;
  clearPhoto(); loading = true; $('photo').disabled = true; $('photo').setAttribute('aria-busy','true');
  setStatus('loading');
  try {
    const result = await decodePhoto(selected);
    photo = result; setStatus('ready');
    document.querySelector('.file-button').classList.replace('primary','quiet');
    $('clear').disabled = $('edit-controls').disabled = $('reset-crop').disabled = false;
    $('crop-empty').hidden = true; $('crop-wrap').hidden = false;
    $('choose-label').textContent = t('replace'); $('photo').ariaLabel = t('replace');
    updatePresetDetails(); scheduleRender();
    if (matchMedia('(max-width: 760px)').matches) $('crop-title').scrollIntoView({block:'start',behavior:'auto'});
  } catch (e) { setStatus(); setError(messages.en[e.message] ? e.message : 'decodeError'); }
  finally { loading = false; $('photo').disabled = false; $('photo').removeAttribute('aria-busy'); }
});
$('clear').onclick = clearPhoto;
$('country').onchange = () => { updateDocuments(); chooseSize(); };
$('document').onchange = chooseSize;
for (const id of ['width','height']) $(id).oninput = chooseSize;
$('units').onchange = () => {
  const inch = $('units').value === 'inch';
  for (const id of ['width','height']) {
    $(id).value = Number((Number($(id).value) * (inch ? 1/25.4 : 25.4)).toFixed(6));
    $(id).min = inch ? 10/25.4 : 10; $(id).max = inch ? 6 : 152.4;
  }
  chooseSize();
};
for (const id of ['zoom','x','y','brightness','contrast']) $(id).oninput = () => { settings[id] = Number($(id).value); scheduleRender(); };
$('reset-crop').onclick = () => { Object.assign(settings,{zoom:1,x:50,y:50}); scheduleRender(); };
$('reset-edits').onclick = () => { settings.brightness = settings.contrast = 0; scheduleRender(); };
$('allow-edits').onchange = () => {
  if (!$('allow-edits').checked) settings.brightness = settings.contrast = 0;
  updatePresetDetails(); scheduleRender();
};
$('original').onchange = () => { if (photo && layout) drawCrop(); };
$('guides').onchange = updateReadouts;
$('cut-guides').onchange = () => { updateReadouts(); scheduleRender(); };
function selectTool(name, focus = false) {
  if (name === 'framing' && $('original').checked) {
    $('original').checked = false;
    if (photo && layout) drawCrop();
  }
  for (const tool of ['framing','adjustments']) {
    const selected = tool === name;
    $(`${tool}-tab`).setAttribute('aria-selected',String(selected));
    $(`${tool}-tab`).tabIndex = selected ? 0 : -1;
    $(`${tool}-panel`).hidden = !selected;
  }
  if (focus) $(`${name}-tab`).focus();
}
for (const name of ['framing','adjustments']) {
  $(`${name}-tab`).onclick = () => selectTool(name);
  $(`${name}-tab`).onkeydown = e => {
    if (['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) {
      e.preventDefault(); selectTool(e.key === 'Home' ? 'framing' : e.key === 'End' ? 'adjustments' : name === 'framing' ? 'adjustments' : 'framing',true);
    }
  };
}
$('language').onchange = () => { lang = $('language').value; updateLanguage(); };
$('save').onclick = () => {
  if (!file) return;
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a'); link.href = downloadUrl; link.download = file.name;
  document.body.append(link); link.click(); link.remove(); setExport('saved');
};
$('share').onclick = async () => {
  if (!file) return;
  try { await navigator.share({ files:[file], title:t('title') }); setExport('shared'); }
  catch (e) { if (e.name !== 'AbortError') setError('shareError'); }
};

const pointers = new Map();
let gesture;
const distance = () => {
  const points = [...pointers.values()];
  return points.length < 2 ? 0 : Math.hypot(points[0].x-points[1].x, points[0].y-points[1].y);
};
function startGesture() {
  const point = [...pointers.values()][0]; if (!point || !photo) return;
  gesture = { ...point, distance: distance(), zoom: settings.zoom, sx:settings.x, sy:settings.y };
}
$('crop').onpointerdown = e => {
  if (!photo || !layout) return;
  $('crop').setPointerCapture(e.pointerId); pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}); startGesture();
};
$('crop').onpointermove = e => {
  if (!pointers.has(e.pointerId) || !gesture || !photo || !layout) return;
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if (pointers.size >= 2 && gesture.distance) settings.zoom = Math.min(4,Math.max(1,gesture.zoom * distance()/gesture.distance));
  else {
    const crop = cropRect(photo.canvas.width, photo.canvas.height, settings.ratio, settings.zoom,settings.x,settings.y);
    const box = $('crop').getBoundingClientRect();
    const dx = (e.clientX-gesture.x)/box.width * crop.width;
    const dy = (e.clientY-gesture.y)/box.height * crop.height;
    const clamp = n => Math.min(100,Math.max(0,n));
    if (photo.canvas.width > crop.width) settings.x = clamp(gesture.sx - dx/(photo.canvas.width-crop.width)*100);
    if (photo.canvas.height > crop.height) settings.y = clamp(gesture.sy - dy/(photo.canvas.height-crop.height)*100);
  }
  scheduleRender();
};
for (const type of ['pointerup','pointercancel','lostpointercapture']) $('crop').addEventListener(type,e => { pointers.delete(e.pointerId); startGesture(); });
$('crop').onkeydown = e => {
  const moves = {ArrowLeft:['x',2],ArrowRight:['x',-2],ArrowUp:['y',2],ArrowDown:['y',-2]};
  if (!moves[e.key] || !photo) return;
  e.preventDefault(); const [axis,delta] = moves[e.key]; settings[axis] = Math.min(100,Math.max(0,settings[axis]+delta)); scheduleRender();
};

updateDocuments(); chooseSize(); updateLanguage();
setStatus('decoderLoading');
prepareDecoder().then(() => { if (statusKey === 'decoderLoading') setStatus(); }).catch(() => {
  if (!photo && !loading) setStatus('decoderError');
});

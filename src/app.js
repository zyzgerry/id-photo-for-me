import { PRESETS, VERIFIED } from './presets.js';
import { messages } from './i18n.js';
import { SHEET, layoutSheet, cropRect } from './geometry.js';
import { renderCrop, renderSheet, exportJpeg } from './render.js';
import { decodePhoto, prepareDecoder } from './image.js';
import { validateSingle, exportSingle, drawJpegPreview } from './single.js';

const $ = id => document.getElementById(id);
let lang = navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
let photo = null, preset = PRESETS[0], layout = null;
let file = null, downloadUrl = null, revision = 0, renderTimer, loading = false;
let statusKey = '', errorKey = '', exportKey = '';
const printSettings = { ratio: 1, zoom: 1, x: 50, y: 50, brightness: 0, contrast: 0 };
const singleSettings = {...printSettings};
let settings=printSettings, mode='print', singleOptions=null, singleResult=null, requestedCopies=null, printCapacity=6;
const canFrame=()=>mode==='print'||$('single-fit').value==='crop';
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
  $('sheet').ariaLabel = t(mode==='print'?'sheetPreview':'singlePreview');
  $('photo').ariaLabel = t(photo ? 'replace' : 'choose');
  $('language').ariaLabel = t('language');
  $('tool-tabs').ariaLabel = lang === 'zh' ? '照片调整工具' : 'Photo editing tools';
  $('choose-label').textContent = t(photo ? 'replace' : 'choose');
  updateCountries(); updateDocuments(false); updatePresetDetails();
  updateModeLabels();
  setStatus(statusKey); setError(errorKey); setExport(exportKey); updateReadouts();
}

function updateCountries() {
  const old = $('country').value;
  const names = new Intl.DisplayNames([lang], {type:'region'});
  const countries = [...new Set(PRESETS.map(p=>p.country))]
    .map(code=>({code,name:names.of(code.toUpperCase())})).sort((a,b)=>a.name.localeCompare(b.name,lang));
  $('country').replaceChildren(...countries.map(({code,name})=>new Option(name,code)), new Option(t('custom'),'custom'));
  $('country').value = old || PRESETS[0].country;
}

function updateDocuments(reset = true) {
  const old = $('document').value;
  $('document').replaceChildren(...PRESETS.filter(p => p.country === $('country').value).map(p => {
    const option = document.createElement('option'); option.value = p.id;
    option.textContent = typeof p.document === 'string' ? t(p.document) : p.document[lang]; return option;
  }));
  if (!reset && [...$('document').options].some(o => o.value === old)) $('document').value = old;
}

function updatePresetDetails() {
  $('custom-fields').hidden = $('country').value !== 'custom';
  $('document-fields').hidden = $('country').value === 'custom';
  $('preset-location').hidden = !preset?.scope;
  $('preset-scope').hidden = !preset?.scope;
  $('preset-scope').textContent = preset?.scope?.[lang] || '';
  $('preset-note').textContent = preset ? (typeof preset.note === 'string' ? t(preset.note) : preset.note[lang]) : t('customNote');
  $('preset-reference').hidden = !preset;
  if (preset) {
    $('reference').href = preset.source;
    $('reference').textContent = `${t('reference')}: ${preset.sourceName}`;
    $('verified').textContent = `${t('checked')}: ${preset.checked || VERIFIED}`;
  }
  $('guide-control').hidden = mode!=='print'||!preset?.head;
  $('allow-edits-row').hidden = mode!=='print'||!preset?.restrictEdits;
  $('adjust-controls').disabled = !photo || (mode==='print' && !!preset?.restrictEdits && !$('allow-edits').checked);
}

function updateModeLabels() {
  document.querySelector('.intro h1').textContent=t(mode==='print'?'workspaceTitle':'singleWorkspaceTitle');
  document.querySelector('.intro .lead').textContent=t(mode==='print'?'subtitle':'singleSubtitle');
  $('size-title').textContent=t(mode==='print'?'step1':'singleStep1');
  $('sheet-title').textContent=t(mode==='print'?'step3':'singleStep3');
  $('sheet-empty').textContent=t(mode==='print'?'sheetEmpty':'singleEmpty');
  document.querySelector('#crop-empty p').textContent=t(mode==='print'?'empty':'singleEmpty');
  $('output-info').textContent=t(mode==='print'?'output':'singleOutput');
  $('framing-help').textContent=t(canFrame()?'drag':'keepFullHint');
  $('crop-controls').hidden=!canFrame();
  $('reset-crop').disabled=!photo||!canFrame();
  $('upscale').textContent=t(mode==='print'?'upscale':'singleUpscale');
}

function printLayout(clamp = false) {
  const multiplier=$('units').value==='inch'?25.4:1;
  const width=preset?.widthMm??Number($('width').value)*multiplier;
  const height=preset?.heightMm??Number($('height').value)*multiplier;
  const maximum=layoutSheet(width,height);
  printCapacity=maximum.capacity;
  if(clamp && requestedCopies!==null) {
    const previous=requestedCopies;
    requestedCopies=Math.min(printCapacity,Math.max(1,requestedCopies||1));
    if(photo&&previous!==requestedCopies) setStatus('copyAdjusted');
  }
  return layoutSheet(width,height,requestedCopies??undefined);
}

function chooseSize() {
  const previousRatio = settings.ratio;
  preset = PRESETS.find(p => p.id === $('document').value) || null;
  if ($('country').value === 'custom') preset = null;
  setError();
  try {
    layout = printLayout(true); settings.ratio = layout.widthMm/layout.heightMm;
    if (Math.abs(previousRatio - settings.ratio) > 1e-6) {
      settings.x = settings.y = 50; settings.zoom = 1;
      if (photo) setStatus('cropChanged');
    }
  } catch (e) { layout = null; setError(e.message === 'noFit' ? 'noFit' : 'dimensionsError'); }
  $('allow-edits').checked = false;
  settings.brightness = settings.contrast = 0;
  updatePresetDetails(); updateReadouts(); scheduleRender();
}

function configureSingle(changed) {
  const aspect=photo?photo.canvas.width/photo.canvas.height:1;
  if($('single-fit').value==='original' && photo && ['pixel-width','pixel-height','fit'].includes(changed)) {
    const value=Number($(changed==='fit'?'pixel-width':changed).value);
    if(value>0 && Number.isFinite(value)) {
      if(changed!=='pixel-height') $('pixel-height').value=Math.max(1,Math.round(value/aspect));
      else $('pixel-width').value=Math.max(1,Math.round(value*aspect));
    }
  }
  const ratio=$('single-fit').value==='original'?aspect:Number($('pixel-width').value)/Number($('pixel-height').value);
  if(Number.isFinite(ratio)&&ratio>0) {
    if(Math.abs(settings.ratio-ratio)>1e-6) {
      Object.assign(settings,{zoom:1,x:50,y:50});
      if(photo&&!loading&&canFrame()) setStatus('cropChanged');
    }
    settings.ratio=ratio;
  }
  if(!canFrame()) Object.assign(settings,{zoom:1,x:50,y:50});
  setError();$('single-error').hidden=true;
  try {
    if(['pixel-width','pixel-height','max-kb','min-width','min-height'].some(id=>$(id).validity.badInput)) throw new Error('singleDimensionsError');
    singleOptions=validateSingle({width:Number($('pixel-width').value),height:Number($('pixel-height').value),
      maxKB:$('max-kb').value===''?null:Number($('max-kb').value),allowResize:$('allow-resize').checked,
      minWidth:$('min-width').value===''?1:Number($('min-width').value),minHeight:$('min-height').value===''?1:Number($('min-height').value)});
  } catch(e) {singleOptions=null;showSingleError(e.message);}
  updateModeLabels();updatePresetDetails();updateReadouts();scheduleRender();
}

function showSingleError(key) {
  setError(key);$('single-error').textContent=t(key);$('single-error').hidden=false;
}

function setMode(next) {
  mode=next;settings=mode==='print'?printSettings:singleSettings;
  selectTool('framing');setError();singleResult=null;
  $('print-settings').hidden=mode!=='print';$('single-settings').hidden=mode!=='single';
  for(const id of ['print-output-settings','print-guides','print-note','print-summary']) $(id).hidden=mode!=='print';
  document.querySelector('.workspace').dataset.mode=mode;
  $('sheet').hidden=true;$('sheet-empty').hidden=false;
  updateModeLabels();
  if(mode==='single') configureSingle();
  else {
    try {layout=printLayout(true);} catch(e) {layout=null;setError(e.message==='noFit'?'noFit':'dimensionsError');}
    updatePresetDetails();updateReadouts();scheduleRender();
  }
}

function updateReadouts() {
  if(mode==='single'&&!$('single-error').hidden&&errorKey) $('single-error').textContent=t(errorKey);
  $('cut-note').textContent = t($('cut-guides').checked ? 'cut' : 'cutPlain');
  for (const key of ['zoom','x','y','brightness','contrast']) {
    $(key).value = settings[key];
    $(`${key}-value`).textContent = key === 'zoom' ? `${settings[key].toFixed(2)}×` :
      ['x','y'].includes(key) ? `${Math.round(settings[key])}%` : settings[key];
  }
  $('size-readout').textContent = sizeLabel();
  $('copies').max=printCapacity;
  $('copy-error').hidden=mode!=='print'||!!layout||!errorKey;
  if(!$('copy-error').hidden) $('copy-error').textContent=t(errorKey);
  if(layout) $('copies').value=layout.count;
  $('capacity').textContent=`${t('maximumCopies')}: ${printCapacity}. ${t('capacityNote')}`;
  $('copy-count').textContent = layout ? `${layout.count} ${t('copies')}` : '';
  $('rotated').hidden = !layout?.rotated;
  $('bounded').hidden = !photo || Math.max(photo.originalWidth,photo.originalHeight) <= 4096;
  $('resolution').textContent = '';
  $('upscale').hidden = true;
  if (photo && (mode==='print'?layout:singleOptions)) {
    const rect = cropRect(photo.canvas.width, photo.canvas.height, settings.ratio, settings.zoom,settings.x,settings.y);
    if(mode==='print') {
      const ppi = Math.floor(Math.min(rect.width / (layout.widthMm / 25.4), rect.height / (layout.heightMm / 25.4)));
      $('resolution').textContent = `${t('resolution')}: ${ppi} ppi`;
      $('upscale').hidden = ppi >= 300;
    } else {
      $('resolution').textContent=`${t('workingPixels')}: ${photo.canvas.width}×${photo.canvas.height} px`;
      $('upscale').hidden=singleOptions.width<=rect.width&&singleOptions.height<=rect.height;
    }
  }
  $('single-result').hidden=mode!=='single'||!singleResult;
  if(singleResult) {
    const {width,height,blob,quality}=singleResult;
    $('single-result').textContent=`${width}×${height} px · ${(blob.size/1000).toFixed(1)} KB (${blob.size} ${t('bytes')}) · ${t('jpegQuality')}: ${Math.round(quality*100)}/100`+
      (singleOptions&&(width!==singleOptions.width||height!==singleOptions.height)?` ${t('reducedPixels')}`:'');
  }
  const showGuides = mode==='print'&&!!photo && !!preset?.head && $('guides').checked;
  $('guide-overlay').hidden = $('guide-note').hidden = !showGuides;
  $('head-reference').hidden = !showGuides || !preset?.headSource;
  if(preset?.headSource) $('head-source').href = preset.headSource;
  $('guide-overlay').replaceChildren();
  if (showGuides) {
    for (const fraction of preset.head) {
      for (const position of [(1 - fraction)/2, (1 + fraction)/2]) {
        const line = document.createElement('div'); line.className = 'guide-line'; line.style.top = `${position*100}%`;
        $('guide-overlay').append(line);
      }
    }
  }
  $('cut-preview').hidden = mode!=='print' || !photo || !layout || !$('cut-guides').checked;
  $('cut-preview').replaceChildren();
  if (!$('cut-preview').hidden) {
    // Screen-pixel outlines stay legible when one-output-pixel print lines are downscaled.
    for (const copy of layout.copies) {
      const box = document.createElement('div'); box.className = 'cut-preview-box';
      Object.assign(box.style, {left:`${copy.x/SHEET.width*100}%`,top:`${copy.y/SHEET.height*100}%`,
        width:`${copy.width/SHEET.width*100}%`,height:`${copy.height/SHEET.height*100}%`});
      $('cut-preview').append(box);
    }
  }
}

function scheduleRender() {
  const current = ++revision;
  clearTimeout(renderTimer); discardExport(); setExport();
  singleResult=null;$('single-result').hidden=true;
  if (!photo || !(mode==='print'?layout:singleOptions)) {
    $('sheet').hidden = true; $('sheet-empty').hidden = false; return;
  }
  if(mode==='single') {setError();$('single-error').hidden=true;}
  drawCrop(); updateReadouts();
  setExport('saving');
  renderTimer = setTimeout(async () => {
    let sheet;
    try {
      let jpeg,filename;
      if(mode==='print') {
        sheet = renderSheet(photo.canvas, settings, layout, $('cut-guides').checked);
        jpeg = await exportJpeg(sheet);
        if (current !== revision) return;
        $('sheet').width=sheet.width;$('sheet').height=sheet.height;
        $('sheet').getContext('2d').drawImage(sheet,0,0);
        filename='id-photo-4x6-300ppi.jpg';
      } else {
        const result=await exportSingle(photo.canvas,{...settings},{...singleOptions},()=>current===revision);
        if(current!==revision) return;
        await drawJpegPreview(result.blob,$('sheet'),()=>current===revision);
        if(current!==revision) return;
        singleResult=result;jpeg=result.blob;filename=`photo-${result.width}x${result.height}.jpg`;
      }
      $('sheet').hidden = false; $('sheet-empty').hidden = true;
      file = new File([jpeg], filename, { type: 'image/jpeg' });
      $('save').disabled = false;
      $('share').hidden = !navigator.canShare || !navigator.canShare({ files: [file] });
      $('share').disabled = $('share').hidden;
      setExport();updateReadouts();
    } catch(e) { if (current === revision) { if(mode==='single') showSingleError(e.message==='fileTargetError'?'fileTargetError':'exportError');else setError('exportError'); setExport(); $('sheet').hidden = true; $('sheet-empty').hidden = false; } }
    finally { if (sheet) sheet.width = sheet.height = 1; }
  }, 110);
}

function drawCrop() {
  if (!photo || !(mode==='print'?layout:singleOptions)) return;
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
  for(const state of [printSettings,singleSettings]) Object.assign(state,{zoom:1,x:50,y:50,brightness:0,contrast:0});
  singleResult=null;$('single-result').hidden=true;$('single-error').hidden=true;
  $('allow-edits').checked = $('original').checked = false;
  $('choose-label').textContent = t('choose'); setStatus(); setError(); setExport(); updatePresetDetails(); updateReadouts();
}

$('photo').addEventListener('change', async event => {
  const selected = event.target.files[0]; if (!selected || loading) return;
  clearPhoto(); loading = true; $('start-photo').disabled = $('photo').disabled = true; $('photo').setAttribute('aria-busy','true');
  setStatus('loading');
  try {
    const result = await decodePhoto(selected);
    photo = result; setStatus('ready');
    document.querySelector('.file-button').classList.replace('primary','quiet');
    $('clear').disabled = $('edit-controls').disabled = $('reset-crop').disabled = false;
    $('crop-empty').hidden = true; $('crop-wrap').hidden = false;
    $('choose-label').textContent = t('replace'); $('photo').ariaLabel = t('replace');
    const scale=Math.min(1,1200/Math.max(photo.canvas.width,photo.canvas.height));
    $('pixel-width').value=Math.max(1,Math.round(photo.canvas.width*scale));
    $('pixel-height').value=Math.max(1,Math.round(photo.canvas.height*scale));
    updateModeLabels();updatePresetDetails();
    if(mode==='single') configureSingle();else scheduleRender();
    if (matchMedia('(max-width: 760px)').matches) $('crop-title').scrollIntoView({block:'start',behavior:'auto'});
  } catch (e) { setStatus(); setError(messages.en[e.message] ? e.message : 'decodeError'); }
  finally { loading = false; $('start-photo').disabled = $('photo').disabled = false; $('photo').removeAttribute('aria-busy'); }
});
$('clear').onclick = clearPhoto;
$('start-photo').onclick = () => $('photo').click();
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
$('original').onchange = () => { if (photo) drawCrop(); };
$('guides').onchange = updateReadouts;
$('cut-guides').onchange = () => { updateReadouts(); scheduleRender(); };
function chooseCopies(maximum = false) {
  requestedCopies=maximum?null:Number($('copies').value);setError();
  try {layout=printLayout();} catch(e) {layout=null;setError(['copyLimit','noFit'].includes(e.message)?e.message:'dimensionsError');}
  updateReadouts();scheduleRender();
}
$('copies').oninput=()=>chooseCopies();$('use-max').onclick=()=>chooseCopies(true);
for(const radio of document.querySelectorAll('[name=output-mode]')) radio.onchange=()=>setMode(radio.value);
for(const id of ['pixel-width','pixel-height','max-kb','min-width','min-height']) $(id).oninput=()=>configureSingle(id);
$('single-fit').onchange=()=>configureSingle('fit');$('allow-resize').onchange=()=>configureSingle();
function selectTool(name, focus = false) {
  if (name === 'framing' && $('original').checked) {
    $('original').checked = false;
    if (photo) drawCrop();
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
  if (!photo || !canFrame() || !(mode==='print'?layout:singleOptions)) return;
  $('crop').setPointerCapture(e.pointerId); pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}); startGesture();
};
$('crop').onpointermove = e => {
  if (!pointers.has(e.pointerId) || !gesture || !photo || !canFrame() || !(mode==='print'?layout:singleOptions)) return;
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
  if (!moves[e.key] || !photo || !canFrame()) return;
  e.preventDefault(); const [axis,delta] = moves[e.key]; settings[axis] = Math.min(100,Math.max(0,settings[axis]+delta)); scheduleRender();
};

const phoneLayout = matchMedia('(max-width: 760px)');
function placeSettings() {
  const active = document.activeElement, settingsPanel = document.querySelector('.settings');
  // Keep screen-reader and keyboard order aligned with the phone's photo-first layout.
  if (phoneLayout.matches) document.querySelector('.editor').after(settingsPanel);
  else document.querySelector('.setup-column').append(settingsPanel);
  if (settingsPanel.contains(active)) active.focus({preventScroll:true});
}
phoneLayout.addEventListener('change', placeSettings);
placeSettings();
updateCountries(); updateDocuments(); chooseSize(); updateLanguage();
setStatus('decoderLoading');
prepareDecoder().then(() => { if (statusKey === 'decoderLoading') setStatus(); }).catch(() => {
  if (!photo && !loading) setStatus('decoderError');
});

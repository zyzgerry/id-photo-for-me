import { PRESETS, PREPARATION_PRESETS, VERIFIED } from './presets.js';
import { DIGITAL_PRESETS, checkDigitalOutput } from './digital-presets.js';
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
const settings = { ratio:1,zoom:1,x:50,y:50,brightness:0,contrast:0 };
const catalog=PREPARATION_PRESETS;
const activeDigital=()=>mode==='single'?DIGITAL_PRESETS.find(p=>p.id===$('document').value):null;
const activeRequirement=()=>preset;
const compressing=()=>document.querySelector('[name=output-quality]:checked').value==='compress';
const effectiveSettings=()=>activeRequirement()?.restrictEdits&&!$('allow-edits').checked?{...settings,brightness:0,contrast:0}:settings;
function markFramingReview(){if(photo) settings.review=true;}
function updateExportAvailability(){
  $('framing-review').hidden=!photo||!settings.review;
  $('save').disabled=!file||!!settings.review;
  $('share').disabled=!file||!!settings.review||$('share').hidden;
}
let pixelsEdited=false;
let mode='single', singleOptions=null, singleResult=null, requestedCopies=null, printCapacity=6;
const canFrame=()=>!preset?.noCrop&&(mode==='print'||$('single-fit').value==='crop');
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
  const countries = [...new Set(catalog.map(p=>p.country))]
    .map(code=>({code,name:code==='schengen'?t('schengen'):names.of(code.toUpperCase())})).sort((a,b)=>a.name.localeCompare(b.name,lang));
  $('country').replaceChildren(...countries.map(({code,name})=>new Option(name,code)), new Option(t('custom'),'custom'));
  $('country').value = old || PRESETS[0].country;
}

function updateDocuments(reset = true) {
  const old = $('document').value;
  $('document').replaceChildren(...catalog.filter(p => p.country === $('country').value).map(p => {
    const option = document.createElement('option'); option.value = p.id;
    option.textContent = typeof p.document === 'string' ? t(p.document) : p.document[lang]; return option;
  }));
  if (!reset && [...$('document').options].some(o => o.value === old)) $('document').value = old;
}

function updatePresetDetails() {
  const requirement=activeRequirement();
  $('custom-fields').hidden = mode!=='print'||$('country').value !== 'custom';
  $('digital-framing').hidden=mode!=='single';
  $('ratio-fields').hidden=mode!=='single'||$('single-fit').value==='original';
  for(const id of ['single-fit','ratio-width','ratio-height']) $(id).disabled=!!preset;
  $('country-help').textContent=t(mode==='print'?'countryHelp':'digitalCountryHelp');
  $('allow-edits').disabled=!!requirement?.noCrop;
  $('digital-route-note').hidden=!requirement?.noCrop;
  $('document-fields').hidden = $('country').value === 'custom';
  $('preset-location').hidden = !requirement?.scope;
  $('preset-scope').hidden = !requirement?.scope;
  $('preset-scope').textContent = requirement?.scope?.[lang] || '';
  const details=requirement;
  $('preset-note').textContent = details ? (typeof details.note === 'string' ? t(details.note) : details.note[lang]) : t(mode==='print'?'customNote':'digitalCustomNote');
  $('preset-reference').hidden = !details;
  if(details){
    $('reference').href=details.source;
    $('reference').textContent=`${t('reference')}: ${details.sourceName}`;
    $('verified').textContent=`${t('checked')}: ${details.checked||VERIFIED}`;
  }
  $('guide-control').hidden=!preset;
  $('allow-edits-row').hidden=!requirement?.restrictEdits;
  $('adjust-controls').disabled=!photo||(!!requirement?.restrictEdits&&!$('allow-edits').checked);
  $('output-controls').disabled=!photo;
  $('copies').disabled=$('cut-guides').disabled=!photo;
  $('output-empty').hidden=!!photo;
  if(mode==='single'){
    const digital=activeDigital();
    $('size-readout').textContent=digital?`${digital.minWidth}×${digital.minHeight}–${digital.maxWidth}×${digital.maxHeight} px · ${digital.minKB}–${digital.maxKB} KB`:preset?`${preset.widthMm}×${preset.heightMm} ${lang==='zh'?'毫米':'mm'}`:t('digitalCustomSummary');
  }
  $('compression-settings').hidden=!compressing();
  $('quality-help').textContent=t(compressing()?'compressionHelp':'qualityHelp');

}

function updateModeLabels() {
  document.querySelector('.intro h1').textContent=t('workspaceTitle');
  document.querySelector('.intro .lead').textContent=t('subtitle');
  $('size-title').textContent=t('step1');
  $('save').textContent=t(mode==='print'?'savePrint':'saveSingle');
  $('sheet').ariaLabel=t(mode==='print'?'sheetPreview':'singlePreview');
  $('sheet-title').textContent=t(mode==='print'?'step3':'singleStep3');
  $('sheet-empty').textContent=t(mode==='print'?'sheetEmpty':'singleEmpty');
  document.querySelector('#crop-empty p').textContent=t('empty');
  $('output-info').textContent=t(mode==='print'?'output':'singleOutput');
  $('framing-help').textContent=t(canFrame()?'drag':'keepFullHint');
  $('crop-controls').hidden=!canFrame();
  $('reset-crop').disabled=!photo||!canFrame();
  $('upscale').textContent=t(mode==='print'?'upscale':'singleUpscale');
}

function printLayout(clamp = false) {
  const multiplier=$('units').value==='inch'?25.4:1;
  if(preset?.noCrop) throw new Error('printRouteError');
  const physical=PRESETS.find(p=>p.id===preset?.printId)||preset;
  const width=physical?.widthMm??Number($('width').value)*multiplier;
  const height=physical?.heightMm??Number($('height').value)*multiplier;
  const maximum=layoutSheet(width,height);
  printCapacity=maximum.capacity;
  if(clamp && requestedCopies!==null) {
    const previous=requestedCopies;
    requestedCopies=Math.min(printCapacity,Math.max(1,requestedCopies||1));
    if(photo&&previous!==requestedCopies) setStatus('copyAdjusted');
  }
  return layoutSheet(width,height,requestedCopies??undefined);
}

function chooseSize(review=true) {
  if(review) markFramingReview();
  const previousRatio = settings.ratio;
  preset = catalog.find(p => p.id === $('document').value) || null;
  if ($('country').value === 'custom') preset = null;
  setError();
  try {
    layout = printLayout(true); settings.ratio = layout.widthMm/layout.heightMm;
    $('single-fit').value='crop';$('ratio-width').value=layout.widthMm;$('ratio-height').value=layout.heightMm;
    if (Math.abs(previousRatio - settings.ratio) > 1e-6) {
      if (photo) {markFramingReview();setStatus('cropChanged');}
    }
  } catch (e) { layout = null; setError(['noFit','printRouteError'].includes(e.message)?e.message:'dimensionsError'); }
  updatePresetDetails(); updateReadouts(); scheduleRender();
}

function configureSingle(changed) {
  if(['pixel-width','pixel-height'].includes(changed)) pixelsEdited=true;
  const aspect=photo?photo.canvas.width/photo.canvas.height:1;
  const ratio=$('single-fit').value==='original'?aspect:Number($('ratio-width').value)/Number($('ratio-height').value);
  if(['fit','ratio'].includes(changed)) markFramingReview();
  if(Number.isFinite(ratio)&&ratio>0){
    if(changed==='mode'&&Math.abs(settings.ratio-ratio)>1e-6) markFramingReview();
    settings.ratio=ratio;
    if(changed==='pixel-height') $('pixel-width').value=Math.max(1,Math.round(Number($('pixel-height').value)*ratio));
    else if(($('single-fit').value==='original'&&photo)||['pixel-width','fit','ratio','preset','photo','mode'].includes(changed)) $('pixel-height').value=Math.max(1,Math.round(Number($('pixel-width').value)/ratio));
  }
  if(!canFrame()) Object.assign(settings,{zoom:1,x:50,y:50});
  setError();$('single-error').hidden=true;
  try {
    singleOptions=singleOutputOptions();
  } catch(e) {singleOptions=null;showSingleError(e.message);
    if(compressing()&&['pixel-width','pixel-height','min-width','min-height'].some(id=>!$(id).checkValidity()||($(id).value!==''&&Number($(id).value)<1))) $('pixel-settings').open=true;
  }
  updateModeLabels();updatePresetDetails();updateReadouts();scheduleRender();
}

function showSingleError(key) {
  setError(key);$('single-error').textContent=t(key);$('single-error').hidden=false;
}

function setMode(next) {
  mode=next;
  selectTool('framing');setError();singleResult=null;
  $('single-settings').hidden=mode!=='single';
  $('output-controls').hidden=mode==='print';
  for(const id of ['print-guides','print-note','print-summary']) $(id).hidden=mode!=='print';
  document.querySelector('.workspace').dataset.mode=mode;
  $('sheet').hidden=true;$('sheet-empty').hidden=false;
  updateModeLabels();
  if(mode==='single') {
    if(preset){$('single-fit').value=preset.fit||'crop';$('ratio-width').value=preset.width??preset.widthMm;$('ratio-height').value=preset.height??preset.heightMm;}
    else if($('single-fit').value==='crop'){
      const multiplier=$('units').value==='inch'?25.4:1;
      $('ratio-width').value=Number($('width').value)*multiplier;$('ratio-height').value=Number($('height').value)*multiplier;
    }
    configureSingle('mode');
  }
  else {
    if(!preset) $('height').value=Number((Number($('width').value)/settings.ratio).toFixed(6));
    chooseSize(false);
  }
}

function bestQualityOptions(){
  const rect=cropRect(photo.canvas.width,photo.canvas.height,settings.ratio,settings.zoom,settings.x,settings.y);
  return validateSingle({width:Math.max(1,Math.floor(rect.width)),height:Math.max(1,Math.floor(rect.height)),maxKB:null,allowResize:false,minWidth:1,minHeight:1});
}

function singleOutputOptions(){
  if(!Number.isFinite(settings.ratio)||settings.ratio<=0||
    (canFrame()&&['ratio-width','ratio-height'].some(id=>!Number($(id).value)||!$(id).checkValidity()))) throw new Error('singleDimensionsError');
  if(!compressing()) return photo?bestQualityOptions():null;
  const p=activeDigital();
  if(['pixel-width','pixel-height','max-kb','min-width','min-height'].some(id=>$(id).validity.badInput)) throw new Error('singleDimensionsError');
  if(photo&&!pixelsEdited){
    const natural=bestQualityOptions();
    const scale=p?Math.min(1,p.maxWidth/natural.width,p.maxHeight/natural.height):1;
    $('pixel-width').value=Math.max(1,Math.floor(natural.width*scale));
    $('pixel-height').value=Math.max(1,Math.floor(natural.height*scale));
  }
  const options=validateSingle({width:Number($('pixel-width').value),height:Number($('pixel-height').value),
    maxKB:$('max-kb').value===''?null:Number($('max-kb').value),allowResize:$('allow-resize').checked,
    minWidth:$('min-width').value===''?1:Number($('min-width').value),minHeight:$('min-height').value===''?1:Number($('min-height').value)});
  if(p&&(options.width<p.minWidth||options.height<p.minHeight||options.width>p.maxWidth||options.height>p.maxHeight)) throw new Error('digitalConstraintsError');
  return options;
}

function updateReadouts() {
  if(mode==='single'&&!$('single-error').hidden&&errorKey) $('single-error').textContent=t(errorKey);
  $('cut-note').textContent = t($('cut-guides').checked ? 'cut' : 'cutPlain');
  for (const key of ['zoom','x','y','brightness','contrast']) {
    $(key).value = settings[key];
    $(`${key}-value`).textContent = key === 'zoom' ? `${settings[key].toFixed(2)}×` :
      ['x','y'].includes(key) ? `${Math.round(settings[key])}%` : settings[key];
  }
  if(mode==='print') $('size-readout').textContent = sizeLabel();
  updateExportAvailability();
  $('copies').max=printCapacity;
  $('copy-error').hidden=mode!=='print'||!!layout||!errorKey;
  if(!$('copy-error').hidden) $('copy-error').textContent=t(errorKey);
  if(layout) $('copies').value=layout.count;
  $('capacity').textContent=t('sheetCapacity').replace('{count}',printCapacity);
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
  const showGuides = !!photo && !!preset && $('guides').checked;
  $('manual-guide-controls').hidden=!showGuides||!!preset?.head;
  $('guide-note').textContent=t(preset?.head?'guideNote':'manualGuideNote');
  for(const id of ['guide-crown','guide-chin']) $(`${id}-value`).textContent=`${$(id).value}%`;
  $('guide-overlay').hidden = $('guide-note').hidden = !showGuides;
  $('head-reference').hidden = !showGuides || !preset?.headSource;
  if(preset?.headSource) $('head-source').href = preset.headSource;
  $('guide-overlay').replaceChildren();
  if (showGuides) {
    const positions=preset.head?preset.head.flatMap(fraction=>[(1-fraction)/2,(1+fraction)/2]):[Number($('guide-crown').value)/100,Number($('guide-chin').value)/100];
    for(const position of positions){
      const line=document.createElement('div');line.className='guide-line';line.style.top=`${position*100}%`;$('guide-overlay').append(line);
    }
    const center=document.createElement('div');center.className='guide-center';$('guide-overlay').append(center);
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
  if(mode==='single'&&photo){
    try{singleOptions=singleOutputOptions();}catch(e){singleOptions=null;showSingleError(e.message);}
  }
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
        sheet = renderSheet(photo.canvas, effectiveSettings(), layout, $('cut-guides').checked);
        jpeg = await exportJpeg(sheet);
        if (current !== revision) return;
        $('sheet').width=sheet.width;$('sheet').height=sheet.height;
        $('sheet').getContext('2d').drawImage(sheet,0,0);
        filename='id-photo-4x6-300ppi.jpg';
      } else {
        const result=await exportSingle(photo.canvas,{...effectiveSettings()},{...singleOptions},()=>current===revision);
        if(compressing()) checkDigitalOutput(activeDigital(),result);
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
    } catch(e) { if (current === revision) { if(mode==='single') showSingleError(['fileTargetError','digitalConstraintsError'].includes(e.message)?e.message:'exportError');else setError('exportError'); setExport(); $('sheet').hidden = true; $('sheet-empty').hidden = false; } }
    finally { if (sheet) sheet.width = sheet.height = 1; }
  }, 110);
}

function drawCrop() {
  if (!photo || !(mode==='print'?layout:singleOptions)) return;
  const width = Math.max(1,Math.round(600*Math.min(1,settings.ratio)));
  const height = Math.max(1,Math.round(600*Math.min(1,1/settings.ratio)));
  const preview = renderCrop(photo.canvas, effectiveSettings(), width, height, $('original').checked);
  $('crop').width = width; $('crop').height = height;
  $('crop').getContext('2d').drawImage(preview,0,0);
  preview.width = preview.height = 1;
  // Keep overlay and canvas bounds identical even for a tall custom photo.
  $('crop-wrap').style.setProperty('--crop-ratio', settings.ratio);
}

function clearPhoto() {
  pixelsEdited=false;
  selectTool('framing');
  revision++; clearTimeout(renderTimer); discardExport();
  if (photo) photo.canvas.width = photo.canvas.height = 1;
  photo = null; $('photo').value = ''; $('clear').disabled = true;
  document.querySelector('.file-button').classList.replace('quiet','primary');
  $('edit-controls').disabled = $('reset-crop').disabled = true;
  $('crop-empty').hidden = false; $('crop-wrap').hidden = true;
  $('sheet').hidden = true; $('sheet-empty').hidden = false;
  for (const id of ['crop','sheet']) $(id).getContext('2d').clearRect(0,0,$(id).width,$(id).height);
  Object.assign(settings,{zoom:1,x:50,y:50,brightness:0,contrast:0,review:false});
  singleResult=null;$('single-result').hidden=true;$('single-error').hidden=true;
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
    const scale=Math.min(1,1200/Math.max(photo.canvas.width,photo.canvas.height));
    if(!preset){
      $('pixel-width').value=Math.max(1,Math.round(photo.canvas.width*scale));
      $('pixel-height').value=Math.max(1,Math.round(photo.canvas.height*scale));
    }
    updateModeLabels();updatePresetDetails();
    if(mode==='single') configureSingle('photo');else chooseSize(false);
    if (matchMedia('(max-width: 760px)').matches) $('crop-title').scrollIntoView({block:'start',behavior:'auto'});
  } catch (e) { setStatus(); setError(messages.en[e.message] ? e.message : 'decodeError'); }
  finally { loading = false; $('photo').disabled = false; $('photo').removeAttribute('aria-busy'); }
});
$('clear').onclick = clearPhoto;
function updateRequirementSelection(){
  pixelsEdited=false;
  preset=catalog.find(p=>p.id===$('document').value)||null;
  if(preset){
    const digital=DIGITAL_PRESETS.includes(preset);
    $('single-fit').value=preset.fit||'crop';
    $('ratio-width').value=digital?preset.width:preset.widthMm;
    $('ratio-height').value=digital?preset.height:preset.heightMm;
    $('pixel-width').value=digital?preset.width:Math.round(preset.widthMm*300/25.4);
    $('pixel-height').value=digital?preset.height:Math.round(preset.heightMm*300/25.4);
    $('max-kb').value=digital?preset.maxKB:300;
    $('min-width').value=digital?preset.minWidth:'';$('min-height').value=digital?preset.minHeight:'';
    $('allow-resize').checked=!digital;
    if(preset.noCrop) $('allow-edits').checked=false;
  }
  if(mode==='print') chooseSize();
  else {markFramingReview();configureSingle('preset');}
}
$('country').onchange = () => {updateDocuments();updateRequirementSelection();};
$('document').onchange = ()=>updateRequirementSelection();
$('custom-requirements').onclick=()=>{$('country').value='custom';updateDocuments();updateRequirementSelection();updatePresetDetails();};
$('review-framing').onclick=()=>{selectTool('framing');$('crop-title').scrollIntoView({block:'start'});$('crop').focus({preventScroll:true});};
$('confirm-framing').onclick=()=>{settings.review=false;updateExportAvailability();};
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
for(const id of ['guide-crown','guide-chin']) $(id).oninput=()=>{
  if(Number($('guide-crown').value)>=Number($('guide-chin').value)){
    if(id==='guide-crown') $('guide-chin').value=Number($('guide-crown').value)+1;
    else $('guide-crown').value=Number($('guide-chin').value)-1;
  }
  updateReadouts();
};
$('cut-guides').onchange = () => { updateReadouts(); scheduleRender(); };
function chooseCopies() {
  requestedCopies=Number($('copies').value);setError();
  try {layout=printLayout();} catch(e) {layout=null;setError(['copyLimit','noFit'].includes(e.message)?e.message:'dimensionsError');}
  updateReadouts();scheduleRender();
}
$('copies').oninput=chooseCopies;
for(const radio of document.querySelectorAll('[name=output-mode]')) radio.onchange=()=>setMode(radio.value);
for(const id of ['pixel-width','pixel-height','max-kb','min-width','min-height']) $(id).oninput=()=>configureSingle(id);
$('single-fit').onchange=()=>configureSingle('fit');
for(const id of ['ratio-width','ratio-height']) $(id).oninput=()=>configureSingle('ratio');
$('allow-resize').onchange=()=>configureSingle();
for(const radio of document.querySelectorAll('[name=output-quality]')) radio.onchange=()=>configureSingle();
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
  if (!file||settings.review) return;
  if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  downloadUrl = URL.createObjectURL(file);
  const link = document.createElement('a'); link.href = downloadUrl; link.download = file.name;
  document.body.append(link); link.click(); link.remove(); setExport('saved');
};
$('share').onclick = async () => {
  if (!file||settings.review) return;
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

updateCountries(); updateDocuments(); updateRequirementSelection(); setMode('single'); updateLanguage();
setStatus('decoderLoading');
prepareDecoder().then(() => { if (statusKey === 'decoderLoading') setStatus(); }).catch(() => {
  if (!photo && !loading) setStatus('decoderError');
});

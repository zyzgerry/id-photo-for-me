import { createJpegViewer } from './jpeg-viewer.js';
import { PRESETS, PREPARATION_PRESETS, VERIFIED } from './presets.js';
import { messages } from './i18n.js';
import { PPI, SHEET, layoutSheet, cropRect } from './geometry.js';
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
const activeRequirement=()=>preset;
const pixelTarget=()=>document.querySelector('[name=compression-target]:checked').value==='pixels';
const compressing=()=>document.querySelector('[name=output-quality]:checked').value==='compress';
const effectiveSettings=()=>activeRequirement()?.restrictEdits&&!$('allow-edits').checked?{...settings,brightness:0,contrast:0}:settings;
function markFramingReview(){if(photo) settings.review=true;}
function updateExportAvailability(){
  $('framing-review').hidden=!photo||!settings.review;
  $('save').disabled=!file||!!settings.review;
  $('share').disabled=!file||!!settings.review||$('share').hidden;
}
let pixelEdge='width', pixelsEdited=false, customRequirements=false, customFraming=null;
let mode='print', singleOptions=null, singleResult=null, requestedCopies=null, printCapacity=6;
const canFrame=()=>mode==='print'||$('single-fit').value==='crop';
const t = key => messages[lang][key] || messages[lang].decodeError;
const viewer=createJpegViewer(t);
const sizeLabel = () => {
  if (!layout) return '';
  return preset?.country === 'us' ? (lang === 'zh' ? '2×2 英寸' : '2×2 inches') :
    `${Number(layout.widthMm.toFixed(3))}×${Number(layout.heightMm.toFixed(3))} ${lang === 'zh' ? '毫米' : 'mm'}`;
};

function setStatus(key = '') { statusKey = key; $('status').textContent = key ? t(key) : ''; }
function setError(key = '') { errorKey = key; $('error').textContent = key ? t(key) : ''; $('error').hidden = !key; }
function setExport(key = '') { exportKey = key; $('export-status').textContent = key ? t(key) : ''; }
function discardExport() {
  viewer.close();$('output-preview').removeAttribute('aria-busy');$('preview-status').hidden=true;$('sheet').removeAttribute('tabindex');$('sheet').setAttribute('role','img');$('sheet').removeAttribute('aria-haspopup');
  file = null; if (downloadUrl) URL.revokeObjectURL(downloadUrl); downloadUrl = null;
  $('save').disabled = $('share').disabled = true;
}
function updateLanguage() {
  document.documentElement.lang = lang === 'zh' ? 'zh-Hans' : 'en';
  document.title = t('title'); $('language').checked = lang === 'zh';
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  $('crop').ariaLabel = lang === 'zh' ? '裁剪预览，可用方向键移动照片' : 'Crop preview; use arrow keys to move the photo';
  $('sheet').ariaLabel = t(mode==='print'?'sheetPreview':'singlePreview');
  $('photo').ariaLabel = t(photo ? 'replace' : 'choose');
  $('language').ariaLabel = t('language');
  $('tool-tabs').ariaLabel = lang === 'zh' ? '照片调整工具' : 'Photo editing tools';
  $('choose-label').textContent = t(photo ? 'replace' : 'choose');
  updateCountries(); updateDocuments(false); updatePresetDetails();
  updateModeLabels();viewer.refresh();
  $('preview-status').textContent=t($('output-preview').getAttribute('aria-busy')==='true'?'previewUpdating':'previewPrevious');
  setStatus(statusKey); setError(errorKey); setExport(exportKey); updateReadouts();
}

function updateCountries() {
  const old = $('country').value;
  const names = new Intl.DisplayNames([lang], {type:'region'});
  const countries = [...new Set(catalog.map(p=>p.country))]
    .map(code=>({code,name:code==='schengen'?t('schengen'):names.of(code.toUpperCase())})).sort((a,b)=>a.name.localeCompare(b.name,lang));
  $('country').replaceChildren(...countries.map(({code,name})=>new Option(name,code)));
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
  $('document-requirements-panel').hidden=customRequirements;
  $('custom-requirements-panel').hidden=!customRequirements;
  for(const [id,selected] of [['document-requirements',!customRequirements],['custom-requirements',customRequirements]]) {$(id).setAttribute('aria-selected',String(selected));$(id).tabIndex=selected?0:-1;}
  document.querySelector('.requirements-tabs').ariaLabel=t('step1');
  $('custom-fields').hidden = mode!=='print'||!customRequirements;
  $('digital-framing').hidden=mode!=='single'||!customRequirements;
  $('ratio-fields').hidden=mode!=='single'||$('single-fit').value==='original';
  for(const id of ['single-fit','ratio-width','ratio-height']) $(id).disabled=!!preset;
  $('country-help').textContent=t(mode==='print'?'countryHelp':'digitalCountryHelp');
  $('document-fields').hidden = customRequirements;
  $('preset-location').hidden = !requirement;
  $('preset-warning').hidden = !requirement?.warning;
  $('preset-warning').textContent = requirement?.warning?.[lang] || '';
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
    $('size-readout').textContent=preset?`${preset.widthMm}×${preset.heightMm} ${lang==='zh'?'毫米':'mm'}`:t('digitalCustomSummary');
  }
  $('compression-settings').hidden=!compressing();
  $('file-size-settings').hidden=pixelTarget();$('pixel-settings').hidden=!pixelTarget();
  const heightAxis=pixelEdge==='height';
  $('pixel-width-label').textContent=t(pixelsEdited&&heightAxis?'calculatedWidth':'pixelWidth');
  $('pixel-height-label').textContent=t(pixelsEdited&&!heightAxis?'calculatedHeight':'pixelHeight');
  const ratioWidth=canFrame()?$('ratio-width').value:photo?.canvas.width;
  const ratioHeight=canFrame()?$('ratio-height').value:photo?.canvas.height;
  $('pixel-ratio').textContent=ratioWidth&&ratioHeight?`${t('linkedRatio')}: ${ratioWidth} : ${ratioHeight}`:t('pixelHelp');
  $('quality-help').textContent=t(compressing()?'compressionHelp':'qualityHelp');

}

function updateModeLabels() {
  document.querySelector('.intro h1').textContent=t('workspaceTitle');
  $('size-title').textContent=t('step1');
  $('save').textContent=t(mode==='print'?'savePrint':'saveSingle');
  $('sheet').ariaLabel=t(mode==='print'?'sheetPreview':singleResult?'inspectJpeg':'singlePreview');

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
  const physical=preset;
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
  if (customRequirements) preset = null;
  setError();
  try {
    layout = printLayout(true); settings.ratio = layout.widthMm/layout.heightMm;
    $('single-fit').value='crop';$('ratio-width').value=layout.widthMm;$('ratio-height').value=layout.heightMm;
    if (Math.abs(previousRatio - settings.ratio) > 1e-6) {
      if (photo) {markFramingReview();setStatus('cropChanged');}
    }
  } catch (e) { layout = null; setError(e.message==='noFit'?e.message:'dimensionsError'); }
  updatePresetDetails(); updateReadouts(); scheduleRender();
}

function configureSingle(changed) {
  if(['pixel-width','pixel-height'].includes(changed)){pixelsEdited=true;pixelEdge=changed==='pixel-height'?'height':'width';}
  const aspect=photo?photo.canvas.width/photo.canvas.height:1;
  const ratio=$('single-fit').value==='original'?aspect:Number($('ratio-width').value)/Number($('ratio-height').value);
  if(['fit','ratio'].includes(changed)) markFramingReview();
  if(Number.isFinite(ratio)&&ratio>0){
    if(changed==='mode'&&Math.abs(settings.ratio-ratio)>1e-6) markFramingReview();
    settings.ratio=ratio;
  }
  if(!canFrame()) Object.assign(settings,{zoom:1,x:50,y:50});
  setError();$('single-error').hidden=true;
  try {
    singleOptions=singleOutputOptions();
  } catch(e) {singleOptions=null;showSingleError(e.message);

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
  $('output-controls').hidden=mode==='print';$('print-controls').hidden=mode!=='print';
  for(const id of ['print-guides','print-note','print-summary']) $(id).hidden=mode!=='print';
  document.querySelector('.workspace').dataset.mode=mode;
  $('sheet').hidden=true;$('sheet-empty').hidden=false;
  updateModeLabels();
  if(mode==='single') {
    if(preset){$('single-fit').value='crop';$('ratio-width').value=preset.widthMm;$('ratio-height').value=preset.heightMm;}
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
  if(!photo) return null;
  const pixels=pixelTarget(), automatic=bestQualityOptions();
  if(!pixelsEdited){$('pixel-width').value=automatic.width;$('pixel-height').value=automatic.height;}
  else {
    const edge=Number($('pixel-'+pixelEdge).value);
    const other=pixelEdge==='width'?'height':'width';
    $('pixel-'+other).value=edge>0?Math.max(1,Math.round(pixelEdge==='width'?edge/settings.ratio:edge*settings.ratio)):'';
  }
  const fields=pixels?['pixel-width','pixel-height']:['max-kb'];
  if(fields.some(id=>!$(id).checkValidity()||!Number($(id).value))) throw new Error(pixels?'pixelDimensionsError':'fileSizeError');
  if(pixels&&(!$('jpeg-quality').checkValidity()||!Number($('jpeg-quality').value))) throw new Error('qualitySettingError');
  const width=pixels?Number($('pixel-width').value):automatic.width,height=pixels?Number($('pixel-height').value):automatic.height;
  const options=validateSingle({width,height,
    maxKB:pixels?null:Number($('max-kb').value),allowResize:!pixels,
    minWidth:1,minHeight:1,quality:pixels?Number($('jpeg-quality').value)/100:1});
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
      $('upscale').hidden = ppi >= PPI;
    } else {
      $('resolution').textContent=`${t('workingPixels')}: ${photo.canvas.width}×${photo.canvas.height} px`;
      $('upscale').hidden=singleOptions.width<=rect.width&&singleOptions.height<=rect.height;
    }
  }
  $('single-result').hidden=mode!=='single'||!singleResult;
  if(singleResult) {
    const {width,height,blob,quality}=singleResult;
    $('result-size').textContent=new Intl.NumberFormat(lang,{maximumFractionDigits:1,minimumFractionDigits:1}).format(blob.size/1000)+' KB';
    $('result-pixels').textContent=`${width}×${height} px`;
    $('result-quality').textContent=`${t('jpegQuality')}: ${Math.round(quality*100)}/100`+
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
  if(mode==='print')singleResult=null;
  if(mode==='single'&&singleResult){$('sheet').setAttribute('role','button');$('sheet').tabIndex=0;$('sheet').setAttribute('aria-haspopup','dialog');}
  $('single-result').hidden=mode!=='single'||!singleResult;
  $('output-preview').setAttribute('aria-busy',String(mode==='single'&&!!photo));
  $('preview-status').hidden=mode!=='single'||!singleResult;
  $('preview-status').textContent=t('previewUpdating');
  if (!photo || !(mode==='print'?layout:singleOptions)) {
    $('output-preview').removeAttribute('aria-busy');
    $('preview-status').textContent=t('previewPrevious');
    $('sheet').hidden = !singleResult; $('sheet-empty').hidden = !!singleResult; return;
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
        jpeg = await exportJpeg(sheet,1,PPI);
        if (current !== revision) return;
        $('sheet').width=sheet.width;$('sheet').height=sheet.height;
        $('sheet').getContext('2d').drawImage(sheet,0,0);
        filename=`id-photo-4x6-${PPI}ppi.jpg`;
      } else {
        const result=await exportSingle(photo.canvas,{...effectiveSettings()},{...singleOptions},()=>current===revision);
        if(current!==revision) return;
        await drawJpegPreview(result.blob,$('sheet'),()=>current===revision);
        if(current!==revision) return;
        singleResult=result;jpeg=result.blob;filename=`photo-${result.width}x${result.height}.jpg`;
      }
      $('sheet').hidden = false; $('sheet-empty').hidden = true;
      file = new File([jpeg], filename, { type: 'image/jpeg' });
      $('output-preview').removeAttribute('aria-busy');$('preview-status').hidden=true;
      $('sheet').setAttribute('role',mode==='single'?'button':'img');
      if(mode==='single'){$('sheet').tabIndex=0;$('sheet').ariaLabel=t('inspectJpeg');$('sheet').setAttribute('aria-haspopup','dialog');}
      else $('sheet').removeAttribute('aria-haspopup');
      $('save').disabled = false;
      $('share').hidden = !navigator.canShare || !navigator.canShare({ files: [file] });
      $('share').disabled = $('share').hidden;
      setExport();updateReadouts();
    } catch(e) { if (current === revision) { if(mode==='single') showSingleError(e.message==='fileTargetError'?e.message:'exportError');else setError('exportError'); setExport(); $('sheet').hidden = !singleResult; $('sheet-empty').hidden = !!singleResult; $('output-preview').removeAttribute('aria-busy');$('preview-status').hidden=!singleResult;$('preview-status').textContent=t('previewPrevious'); } }
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
  pixelsEdited=false;pixelEdge='width';$('jpeg-quality').value=$('jpeg-quality-slider').value=100;
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
  loading = true; $('photo').disabled = $('clear').disabled = true; $('photo').setAttribute('aria-busy','true');
  setStatus('loading');
  try {
    const result = await decodePhoto(selected);
    clearPhoto();
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
  } catch (e) { setStatus(photo?'ready':''); setError(messages.en[e.message] ? e.message : 'decodeError'); }
  finally { loading = false; $('photo').disabled = false; $('clear').disabled = !photo; $('photo').value = ''; $('photo').removeAttribute('aria-busy'); }
});
$('clear').onclick = clearPhoto;
function updateRequirementSelection(){
  preset=customRequirements?null:catalog.find(p=>p.id===$('document').value)||null;
  if(preset){
    $('single-fit').value=preset.fit||'crop';
    $('ratio-width').value=preset.widthMm;
    $('ratio-height').value=preset.heightMm;
  }
  if(mode==='print') chooseSize();
  else {markFramingReview();configureSingle('preset');}
}
$('country').onchange = () => {updateDocuments();updateRequirementSelection();};
$('document').onchange = ()=>updateRequirementSelection();
function selectRequirementsTab(custom){
  if(customRequirements===custom) return;
  const fields=['single-fit','ratio-width','ratio-height'];
  if(customRequirements) customFraming=fields.map(id=>$(id).value);
  else if(customFraming) fields.forEach((id,index)=>{$(id).value=customFraming[index];});
  customRequirements=custom;updateRequirementSelection();updatePresetDetails();
}
for(const [id,custom] of [['document-requirements',false],['custom-requirements',true]]) {
  $(id).onclick=()=>selectRequirementsTab(custom);
  $(id).onkeydown=e=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
    e.preventDefault();
    const next=e.key==='Home'?false:e.key==='End'?true:!custom;
    selectRequirementsTab(next);$(next?'custom-requirements':'document-requirements').focus();
  };
}
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
for(const id of ['pixel-width','pixel-height','max-kb']) $(id).oninput=()=>configureSingle(id);
// WebKit may scroll a focused field underneath a sticky sibling.
$('output-controls').addEventListener('focusin',event=>{
  const target=event.target;
  if(!target.matches(':focus-visible'))return;
  requestAnimationFrame(()=>{
    if(mode!=='single'||document.activeElement!==target||getComputedStyle($('output-preview')).position!=='sticky')return;
    const preview=$('output-preview').getBoundingClientRect(),field=target.getBoundingClientRect();
    const label=target.labels?.[0];
    const top=label&&!label.classList.contains('visually-hidden')?label.getBoundingClientRect().top:field.top;
    if(top<preview.bottom+12)window.scrollBy({top:top-preview.bottom-12,behavior:'instant'});
  });
});
$('single-fit').onchange=()=>configureSingle('fit');
for(const id of ['ratio-width','ratio-height']) $(id).oninput=()=>configureSingle('ratio');
for(const id of ['jpeg-quality','jpeg-quality-slider']) $(id).oninput=()=>{
  const other=id==='jpeg-quality'?'jpeg-quality-slider':'jpeg-quality';
  $(other).value=$(id).value;configureSingle();
};
function inspectOutput(event){if(mode==='single'&&singleResult) viewer.open(singleResult.blob,singleResult.width,singleResult.height,event?.currentTarget);}
$('sheet').onclick=inspectOutput;
$('sheet').onkeydown=e=>{if(mode==='single'&&['Enter',' '].includes(e.key)){e.preventDefault();inspectOutput(e);}};
$('reset-pixels').onclick=()=>{
  const natural=bestQualityOptions();
  pixelsEdited=false;
  $('pixel-width').value=natural.width;$('pixel-height').value=natural.height;
  configureSingle();
};
for(const radio of document.querySelectorAll('[name=compression-target]')) radio.onchange=()=>configureSingle();
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
$('language').onchange = () => { lang = $('language').checked ? 'zh' : 'en'; updateLanguage(); };
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

updateCountries(); updateDocuments(); updateRequirementSelection(); setMode('print'); updateLanguage();
setStatus('decoderLoading');
prepareDecoder().then(() => { if (statusKey === 'decoderLoading') setStatus(); }).catch(() => {
  if (!photo && !loading) setStatus('decoderError');
});

import {decodePhoto} from '../image.js';
const $=id=>document.getElementById(id);
let source, worker, runId=0, photoId=0, busy=false, timer;
const results=new Map(), runs=[];
let originalUrl;
const build='background-experiment-2026-11-02';
const modelNames={selfie:'A · Small portrait model',multiclass:'B · Larger portrait model'};
function controls(){ $('run').disabled=!source||busy; $('model').disabled=busy; $('cancel').disabled=!busy; }
function status(text){$('status').textContent=text;}
function stop(message){runId++;clearTimeout(timer);worker?.terminate();worker=null;busy=false;$('progress').hidden=true;controls();if(message)status(message);}
function removeResults(){for(const {url,figure} of results.values()){URL.revokeObjectURL(url);figure.remove();}results.clear();}
function clear(){photoId++;stop();source=null;removeResults();if(originalUrl)URL.revokeObjectURL(originalUrl);originalUrl=null;$('original').removeAttribute('src');$('original-figure').hidden=true;$('photo').value='';$('photo-info').textContent='';runs.length=0;$('measurements').textContent='No runs yet.';controls();status('Choose a photo to begin.');}
$('clear').onclick=clear;
$('cancel').onclick=()=>stop('Cancelled. Your original photo and previous results are still available.');
$('photo').onchange=async()=>{
  const file=$('photo').files[0];if(!file)return;
  stop();const id=++photoId;const operation=runId;busy=true;controls();status('Opening photo…');
  try{
    const decoded=await decodePhoto(file);if(id!==photoId||operation!==runId)return;
    const blob=await new Promise(resolve=>decoded.canvas.toBlob(resolve,'image/png'));if(id!==photoId||operation!==runId)return;
    if(!blob)throw new Error('Could not prepare this photo. Try another photo.');
    removeResults();if(originalUrl)URL.revokeObjectURL(originalUrl);
    source=decoded.canvas;originalUrl=URL.createObjectURL(blob);
    $('original').src=originalUrl;$('original-open').href=originalUrl;$('original-figure').hidden=false;
    $('photo-info').textContent=`Original: ${decoded.originalWidth} × ${decoded.originalHeight}. Working image: ${source.width} × ${source.height}.`;
    status('Photo ready. Run A, then B, and compare the edges.');
  }catch(error){if(id===photoId&&operation===runId){const messages={fileLimit:'Choose a photo up to 30 MB.',pixelLimit:'Choose a photo up to 50 megapixels and 12,000 pixels per side.',unsupported:'Choose a JPEG, PNG or HEIC photo.',decodeError:'Could not open this photo. Try exporting a JPEG from Photos.',decoderError:'HEIC decoding failed. Retry or choose a JPEG.'};status(messages[error.message]||error.message);}}
  finally{if(id===photoId&&operation===runId){busy=false;controls();}}
};
$('run').onclick=async()=>{
  if(!source||busy)return;
  busy=true;controls();const id=++runId;const photo=photoId;const model=$('model').value;const started=performance.now();
  status('Preparing…');$('progress').hidden=true;
  timer=setTimeout(()=>{if(id===runId)stop('This run exceeded two minutes. Try again, or try model A. Previous results are preserved.');},120000);
  try{
    const image=await createImageBitmap(source);if(id!==runId||photo!==photoId){image.close();return;}
    worker ||=new Worker(new URL('./experiment-worker.js',import.meta.url));
    worker.onerror=()=>{if(id===runId)stop('The processing worker stopped. Try again, or try model A.');};
    worker.onmessage=async({data})=>{
      if(id!==runId||photo!==photoId)return;
      if(data.status){status(data.status);$('progress').hidden=true;}
      if(data.progress){$('progress').hidden=false;$('progress').max=data.progress.total;$('progress').value=data.progress.current;}
      if(data.error){stop(`Could not process this photo: ${data.error} Try again or choose model A.`);return;}
      if(!data.mask)return;
      try{
        status('Preparing full-size result…');
        const compositeStart=performance.now();
        const mask=document.createElement('canvas');mask.width=data.mask.width;mask.height=data.mask.height;
        mask.getContext('2d').putImageData(new ImageData(data.mask.pixels,mask.width,mask.height),0,0);
        const output=document.createElement('canvas');output.width=source.width;output.height=source.height;
        const ctx=output.getContext('2d');ctx.drawImage(source,0,0);ctx.globalCompositeOperation='destination-in';ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(mask,0,0,output.width,output.height);
        ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#ffffff';ctx.fillRect(0,0,output.width,output.height);
        const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));
        if(id!==runId||photo!==photoId)return;
        if(!blob)throw new Error('Could not encode the result.');
        const previous=results.get(model);if(previous){URL.revokeObjectURL(previous.url);previous.figure.remove();}
        const url=URL.createObjectURL(blob),figure=document.createElement('figure');
        const caption=document.createElement('figcaption');caption.textContent=modelNames[model];
        const img=new Image();img.src=url;img.alt=`White-background result from ${modelNames[model]}`;
        const open=document.createElement('a');open.href=url;open.target='_blank';open.rel='noopener';open.textContent='Open full-size result';
        const save=document.createElement('a');save.href=url;save.download=`background-test-${model}.png`;save.textContent='Save PNG';
        figure.append(caption,img,open,save);$('comparisons').append(figure);results.set(model,{url,figure});
        runs.push({...data.timing,photoSession:photo,width:source.width,height:source.height,compositeAndEncodeMs:performance.now()-compositeStart,totalMs:performance.now()-started});
        $('measurements').textContent=runs.map((r,i)=>`${i+1}. ${modelNames[r.model]} · photo ${r.photoSession}\n   Total ${(r.totalMs/1000).toFixed(2)} s · preparation ${(r.prepareMs/1000).toFixed(2)} s · inference + mask ${(r.inferenceAndMaskMs/1000).toFixed(2)} s · composite + PNG ${(r.compositeAndEncodeMs/1000).toFixed(2)} s\n   ${r.reused?'Model already initialized':'Model initialized this run'} · ${r.width} × ${r.height}`).join('\n\n');
        clearTimeout(timer);busy=false;controls();$('progress').hidden=true;status(`${modelNames[model]} finished in ${((performance.now()-started)/1000).toFixed(2)} seconds. Inspect the result below, then try the other model.`);
      }catch(error){stop(`${error.message} Try model A or a smaller photo.`);}
    };
    worker.postMessage({model,image},[image]);
  }catch(error){if(id===runId)stop(`Could not start: ${error.message} Try another photo.`);}
};
$('report').onclick=()=>{
  const report={build,date:new Date().toISOString(),device:$('device').value,notes:$('notes').value,userAgent:navigator.userAgent,crossOriginIsolated:window.crossOriginIsolated,runs,measurementNotes:'modelBodyBytes is decoded response size, not network transfer. Resource encodedBytes/transferBytes are browser-reported and may be zero or cache-derived. Preparation includes downloads and initialization. Inference timing includes mask extraction. PNG output only; no crop or print integration in this experiment.'};
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='background-experiment-report.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
};

import { renderCrop, exportJpeg } from './render.js';

export function validateSingle({width,height,maxKB,allowResize,minWidth,minHeight,quality=1}) {
  if (![width,height,minWidth,minHeight].every(n=>Number.isInteger(n)&&n>=1&&n<=4096) ||
      minWidth>width || minHeight>height ||
      (!Number.isFinite(quality)||quality<0.01||quality>1) ||
      (maxKB!==null && (!Number.isFinite(maxKB)||maxKB<1||maxKB>30000))) throw new Error('singleDimensionsError');
  return {width,height,maxBytes:maxKB===null?Infinity:Math.floor(maxKB*1000),allowResize,minWidth,minHeight,quality};
}

export async function exportSingle(image, settings, options, isCurrent = ()=>true) {
  let {width,height}=options;
  let canvas;
  const active=()=>{if(!isCurrent()) throw new DOMException('Superseded','AbortError');};
  try {
    if(options.maxBytes===Infinity) {
      active();canvas=renderCrop(image,settings,width,height);
      const quality=options.quality??1;
      const blob=await exportJpeg(canvas,quality);active();
      return {blob,width,height,quality};
    }
    const minimumScale=Math.max(options.minWidth/options.width,options.minHeight/options.height);
    let scale=1;
    for (;;) {
      // Prefer gentle compression, then modest resizing, before stronger compression.
      const scales=options.allowResize?[scale,Math.max(minimumScale,scale*0.95),Math.max(minimumScale,scale*0.9)]:[1];
      let smallestBlob;
      for(const [floorIndex,floor] of [0.9,0.8,0.7,0.55].entries()) {
        const visited=new Set();
        for(const candidateScale of scales) {
          width=Math.max(options.minWidth,Math.round(options.width*candidateScale));
          height=Math.max(options.minHeight,Math.round(options.height*candidateScale));
          const key=width+'x'+height;
          if(visited.has(key)) continue;
          visited.add(key);
          active();
          if(canvas) canvas.width=canvas.height=1;
          canvas=renderCrop(image,settings,width,height);
          if(floorIndex===0) {
            const blob=await exportJpeg(canvas,1); active();
            if(blob.size<=options.maxBytes) return {blob,width,height,quality:1};
          }
          const blob=await exportJpeg(canvas,floor); active();
          smallestBlob=blob;
          if(blob.size>options.maxBytes) continue;
          let best={blob,width,height,quality:floor},low=floor,high=1;
          // Search close enough to 1.0 to catch narrow high-quality encoder steps.
          for(let i=0;i<14 && high-low>0.0001;i++) {
            const quality=(low+high)/2;
            const candidate=await exportJpeg(canvas,quality); active();
            if(candidate.size<=options.maxBytes) {best={blob:candidate,width,height,quality};low=quality;}
            else high=quality;
          }
          return best;
        }
      }
      if(!options.allowResize || scales.at(-1)<=minimumScale) throw new Error('fileTargetError');
      const nextScale=Math.max(minimumScale,Math.min(scale*0.85,scales.at(-1)*Math.sqrt(options.maxBytes/smallestBlob.size)*0.9));
      const nextWidth=Math.max(options.minWidth,Math.round(options.width*nextScale));
      const nextHeight=Math.max(options.minHeight,Math.round(options.height*nextScale));
      if(nextWidth>=width && nextHeight>=height) throw new Error('fileTargetError');
      scale=nextScale;
    }
  } finally {if(canvas) canvas.width=canvas.height=1;}
}

export async function drawJpegPreview(blob, canvas, isCurrent = ()=>true) {
  const url=URL.createObjectURL(blob);
  try {
    const image=new Image(); image.src=url; await image.decode();
    if(!isCurrent()) throw new DOMException('Superseded','AbortError');
    const scale=Math.min(1,900/Math.max(image.naturalWidth,image.naturalHeight));
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
  } finally {URL.revokeObjectURL(url);}
}

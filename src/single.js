import { renderCrop, exportJpeg } from './render.js';

export function validateSingle({width,height,maxKB,allowResize,minWidth,minHeight}) {
  if (![width,height,minWidth,minHeight].every(n=>Number.isInteger(n)&&n>=1&&n<=4096) ||
      minWidth>width || minHeight>height ||
      (maxKB!==null && (!Number.isFinite(maxKB)||maxKB<1||maxKB>30000))) throw new Error('singleDimensionsError');
  return {width,height,maxBytes:maxKB===null?Infinity:Math.floor(maxKB*1000),allowResize,minWidth,minHeight};
}

export async function exportSingle(image, settings, options, isCurrent = ()=>true) {
  let {width,height}=options;
  let canvas;
  const active=()=>{if(!isCurrent()) throw new DOMException('Superseded','AbortError');};
  try {
    for (;;) {
      active();
      if (canvas) canvas.width=canvas.height=1;
      canvas=renderCrop(image,settings,width,height);
      let blob=await exportJpeg(canvas,1); active();
      if(blob.size<=options.maxBytes) return {blob,width,height,quality:1};
      const floor=0.55;
      blob=await exportJpeg(canvas,floor); active();
      if(blob.size<=options.maxBytes) {
        let best={blob,width,height,quality:floor},low=floor,high=1;
        for(let i=0;i<7;i++) {
          const quality=(low+high)/2;
          const candidate=await exportJpeg(canvas,quality); active();
          if(candidate.size<=options.maxBytes) {best={blob:candidate,width,height,quality};low=quality;}
          else high=quality;
        }
        return best;
      }
      if(!options.allowResize) throw new Error('fileTargetError');
      const minimumScale=Math.max(options.minWidth/options.width,options.minHeight/options.height);
      const currentScale=width/options.width;
      const nextScale=Math.max(minimumScale,Math.min(currentScale*0.85,currentScale*Math.sqrt(options.maxBytes/blob.size)*0.9));
      const nextWidth=Math.max(options.minWidth,Math.round(options.width*nextScale));
      const nextHeight=Math.max(options.minHeight,Math.round(options.height*nextScale));
      if(nextWidth>=width && nextHeight>=height) throw new Error('fileTargetError');
      width=nextWidth; height=nextHeight;
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

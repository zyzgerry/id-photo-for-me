// Classic worker allows MediaPipe's WASM loader to use importScripts.
let segmenter;
let selected;
let vision;
const sizes = {selfie:249537,multiclass:16371837};
self.onmessage = async ({data:{model,image}}) => {
  const started = performance.now();
  let modelDownloadMs = 0;
  let downloadedBytes = 0;
  const reused = selected === model && !!segmenter;
  try {
    if (!reused) {
      segmenter?.close(); segmenter = null; selected = null;
      self.postMessage({status:'Preparing runtime…'});
      vision ||= await import('./vendor/vision_bundle.mjs');
      const fileset = await vision.FilesetResolver.forVisionTasks(new URL('./vendor/wasm',self.location.href).href);
      self.postMessage({status:'Downloading model…'});
      const downloadStart = performance.now();
      const response = await fetch(`./vendor/${model}.tflite`);
      if (!response.ok) throw new Error(`Model download failed (${response.status}).`);
      const reader = response.body?.getReader();
      let modelBytes;
      if (reader) {
        const chunks=[];
        while (true) {
          const {done,value}=await reader.read();
          if(done) break;
          chunks.push(value); downloadedBytes+=value.length;
          self.postMessage({progress:{current:downloadedBytes,total:sizes[model]}});
        }
        modelBytes=new Uint8Array(downloadedBytes);
        let offset=0; for(const chunk of chunks){modelBytes.set(chunk,offset);offset+=chunk.length;}
      } else { modelBytes=new Uint8Array(await response.arrayBuffer()); downloadedBytes=modelBytes.length; }
      modelDownloadMs=performance.now()-downloadStart;
      if(typeof OffscreenCanvas==='undefined')throw new Error('This browser cannot run the model in a worker. Please try current Safari on your iPhone');
      const canvas=new OffscreenCanvas(1,1);
      if(!canvas.getContext('webgl2'))throw new Error('This browser cannot run the model in a worker because WebGL2 is unavailable. Please try current Safari on your iPhone');
      self.postMessage({status:'Preparing model and downloading WASM if needed…'});
      segmenter=await vision.ImageSegmenter.createFromOptions(fileset,{
        canvas,
        baseOptions:{modelAssetBuffer:modelBytes,delegate:'CPU'},
        runningMode:'IMAGE',outputConfidenceMasks:true,outputCategoryMask:false
      });
      selected=model;
    }
    const prepared=performance.now();
    self.postMessage({status:'Removing background…'});
    const result=segmenter.segment(image);
    let mask;
    try {
      // A exposes one foreground confidence channel; B exposes background + five person classes.
      const confidence=result.confidenceMasks[0];
      const values=confidence.getAsFloat32Array();
      const pixels=new Uint8ClampedArray(values.length*4);
      for(let i=0;i<values.length;i++){
        const alpha=Math.round(255*Math.max(0,Math.min(1,model==='selfie'?values[i]:1-values[i])));
        pixels[i*4]=pixels[i*4+1]=pixels[i*4+2]=255;pixels[i*4+3]=alpha;
      }
      mask={pixels,width:confidence.width,height:confidence.height};
    } finally {result.close();}
    const finished=performance.now();
    const resources=performance.getEntriesByType('resource').filter(e=>/vendor\//.test(e.name)).map(e=>({asset:e.name.split('/').pop(),encodedBytes:e.encodedBodySize,transferBytes:e.transferSize}));
    performance.clearResourceTimings();
    self.postMessage({mask,timing:{model,reused,prepareMs:prepared-started,modelDownloadMs,modelBodyBytes:downloadedBytes,inferenceAndMaskMs:finished-prepared,workerTotalMs:finished-started,resources}},[mask.pixels.buffer]);
  } catch(error){ self.postMessage({error:error.message||'Processing failed.'}); }
  finally{image.close();}
};

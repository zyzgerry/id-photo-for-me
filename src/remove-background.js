import { MODEL } from './modnet-experiment/model.js';

export async function removeBackground(source, signal, onProgress) {
  signal.throwIfAborted();
  const worker = new Worker(new URL('./modnet-experiment/worker.js', import.meta.url), {type:'module'});
  const {width, height} = source;
  let timer, abort;
  try {
    return await new Promise((resolve, reject) => {
      abort = () => reject(signal.reason);
      signal.addEventListener('abort', abort, {once:true});
      const setDeadline = ms => {
        clearTimeout(timer);
        timer = setTimeout(() => reject(new Error('Background removal timed out')), ms);
      };
      worker.onerror = () => reject(new Error('Background removal stopped'));
      worker.onmessageerror = worker.onerror;
      worker.onmessage = ({data}) => {
        try {
          if (data.error) { reject(new Error(data.error)); return; }
          if (data.stage || data.progress) onProgress(data);
          if (data.ready) {
            const {data:pixels} = source.getContext('2d').getImageData(0, 0, width, height);
            setDeadline(300000);
            worker.postMessage({type:'run', id:2, width, height, pixels, cutout:true}, [pixels.buffer]);
          }
          if (data.cutout) {
            const canvas = document.createElement('canvas');
            canvas.width = width; canvas.height = height;
            canvas.getContext('2d', {colorSpace:'srgb'}).putImageData(new ImageData(data.cutout, width, height), 0, 0);
            resolve(canvas);
          }
        } catch (error) { reject(error); }
      };
      const base = new URL('./models/' + MODEL.directory + '/', document.baseURI).href;
      setDeadline(600000);
      worker.postMessage({type:'prepare', id:1, base, provider:'wasm'});
    });
  } finally {
    clearTimeout(timer);
    signal.removeEventListener('abort', abort);
    worker.terminate();
  }
}

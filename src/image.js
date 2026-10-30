const MAX_BYTES = 30 * 1024 * 1024;
const MAX_PIXELS = 50_000_000;
const MAX_SIDE = 12000;
let worker;
let decoderReady;

export function prepareDecoder() {
  if (decoderReady) return decoderReady;
  decoderReady = new Promise((resolve, reject) => {
    worker = new Worker(new URL('./decode-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = event => { if (event.data.ready) resolve(); };
    worker.onerror = () => { reject(new Error('decoderError')); };
  });
  return decoderReady;
}

function checkSize(width, height) {
  if (!width || !height || width * height > MAX_PIXELS || Math.max(width, height) > MAX_SIDE) {
    throw new Error('pixelLimit');
  }
}

export function inspectImage(bytes) {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (start, end) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes[0] === 137 && text(1, 4) === 'PNG' && v.byteLength >= 24) {
    checkSize(v.getUint32(16), v.getUint32(20));
    // Animated PNG is outside the single-photo workflow.
    for (let p = 8; p + 12 <= bytes.length;) {
      const size = v.getUint32(p); const type = text(p+4, p+8);
      if (type === 'acTL') throw new Error('unsupported');
      if (type === 'IEND') break;
      p += size + 12;
    }
    return 'png';
  }
  if (bytes[0] === 255 && bytes[1] === 216) {
    for (let p = 2; p + 8 < bytes.length;) {
      if (bytes[p++] !== 255) throw new Error('decodeError');
      while (bytes[p] === 255) p++;
      const marker = bytes[p++];
      if (marker === 218 || marker === 217) break;
      const length = v.getUint16(p);
      if (length < 2 || p + length > bytes.length) throw new Error('decodeError');
      if ([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)) {
        checkSize(v.getUint16(p+5), v.getUint16(p+3)); return 'jpeg';
      }
      p += length;
    }
    throw new Error('decodeError');
  }
  if (v.byteLength > 24 && text(4,8) === 'ftyp') {
    const brandEnd = v.getUint32(0);
    if (brandEnd < 16 || brandEnd > Math.min(4096, bytes.length)) throw new Error('decodeError');
    const brands = text(8, brandEnd);
    if (/msf1|hevc|hevx/.test(brands)) throw new Error('unsupported');
    if (!/heic|heix|mif1/.test(brands)) throw new Error('unsupported');
    // HEIF spatial extents are checked before handing the container to any decoder.
    let extents = 0;
    for (let p = 4; p + 16 <= bytes.length; p++) {
      if (bytes[p] === 105 && bytes[p+1] === 115 && bytes[p+2] === 112 && bytes[p+3] === 101 && v.getUint32(p-4) === 20) {
        checkSize(v.getUint32(p+8), v.getUint32(p+12)); extents++;
      }
    }
    if (!extents) throw new Error('decodeError');
    return 'heic';
  }
  throw new Error('unsupported');
}

async function nativeDecode(file) {
  // HTMLImageElement applies EXIF/container orientation in current target browsers.
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    checkSize(img.naturalWidth, img.naturalHeight);
    return img;
  } finally { URL.revokeObjectURL(url); }
}

export async function decodePhoto(file) {
  if (!file.size || file.size > MAX_BYTES) throw new Error('fileLimit');
  const kind = inspectImage(new Uint8Array(await file.arrayBuffer()));
  let image;
  try { image = await nativeDecode(file); }
  catch (error) {
    if (error.message === 'pixelLimit') throw error;
    if (kind !== 'heic') throw new Error('decodeError');
    await prepareDecoder();
    image = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        worker.terminate(); worker = null; decoderReady = null; reject(new Error('decoderError'));
      }, 45000);
      worker.onmessage = ({ data }) => {
        clearTimeout(timer);
        if (data.bitmap) resolve(data.bitmap); else reject(new Error('decodeError'));
      };
      worker.onerror = () => { clearTimeout(timer); reject(new Error('decoderError')); };
      worker.postMessage({ file });
    });
  }
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  try {
    checkSize(width, height);
    const scale = Math.min(1, 4096 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(image,0,0,canvas.width,canvas.height);
    return { canvas, originalWidth: width, originalHeight: height };
  } finally { image.close?.(); if (image instanceof HTMLImageElement) image.src = ''; }
}

import { heicTo } from '../vendor/heic-to.js';
self.postMessage({ ready: true });
self.onmessage = async ({ data: { file } }) => {
  try {
    const bitmap = await heicTo({ blob: file, type: 'bitmap' });
    self.postMessage({ bitmap }, [bitmap]);
  } catch { self.postMessage({ error: true }); }
};

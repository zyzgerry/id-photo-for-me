import { SHEET, cropRect, mmToPx, withJpegDensity } from './geometry.js';

export function renderCrop(image, settings, width, height, original = false) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d', { colorSpace: 'srgb' });
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = 'high';
  const crop = cropRect(image.width, image.height, settings.ratio, settings.zoom, settings.x, settings.y);
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);
  // Pixel adjustments also work on Safari versions that lack Canvas2D.filter.
  if (!original && (settings.brightness || settings.contrast)) {
    const pixels = ctx.getImageData(0, 0, width, height);
    const contrast = 1 + settings.contrast / 100;
    const brightness = settings.brightness * 2.55;
    for (let i = 0; i < pixels.data.length; i += 4) {
      for (let c = 0; c < 3; c++) pixels.data[i+c] = (pixels.data[i+c] - 128) * contrast + 128 + brightness;
    }
    ctx.putImageData(pixels, 0, 0);
  }
  return canvas;
}

export function renderSheet(image, settings, layout) {
  const crop = renderCrop(image, settings, Math.round(mmToPx(layout.widthMm)), Math.round(mmToPx(layout.heightMm)));
  const sheet = document.createElement('canvas');
  sheet.width = SHEET.width; sheet.height = SHEET.height;
  const ctx = sheet.getContext('2d', { colorSpace: 'srgb' });
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, sheet.width, sheet.height);
  ctx.imageSmoothingQuality = 'high';
  for (const copy of layout.copies) {
    ctx.save();
    if (copy.rotated) {
      ctx.translate(copy.x + copy.width, copy.y); ctx.rotate(Math.PI / 2);
      ctx.drawImage(crop, 0, 0, copy.height, copy.width);
    } else ctx.drawImage(crop, copy.x, copy.y, copy.width, copy.height);
    ctx.restore();
  }
  crop.width = crop.height = 1;
  return sheet;
}

export async function exportJpeg(canvas) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.97));
  if (!blob) throw new Error('exportError');
  return new Blob([withJpegDensity(new Uint8Array(await blob.arrayBuffer()))], { type: 'image/jpeg' });
}

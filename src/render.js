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

export function renderSheet(image, settings, layout, cutGuides = false) {
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
  if (cutGuides) drawCutGuides(ctx, layout);
  crop.width = crop.height = 1;
  return sheet;
}

export function drawCutGuides(ctx, layout) {
  const left = Math.min(...layout.copies.map(c=>c.x));
  const top = Math.min(...layout.copies.map(c=>c.y));
  const right = Math.max(...layout.copies.map(c=>c.x+c.width));
  const bottom = Math.max(...layout.copies.map(c=>c.y+c.height));
  const xs = [...new Set(layout.copies.flatMap(c=>[c.x,c.x+c.width]))];
  const ys = [...new Set(layout.copies.flatMap(c=>[c.y,c.y+c.height]))];
  ctx.save(); ctx.fillStyle = '#727272';
  // One output pixel (0.085 mm): no gutters, scaling, or thick retained borders.
  // Each dash is placed inside the grid; outer trim ticks stay in unused paper.
  const edges = new Map();
  for (const c of layout.copies) {
    for (const edge of [['v',c.x,c.y,c.y+c.height],['v',c.x+c.width,c.y,c.y+c.height],
      ['h',c.y,c.x,c.x+c.width],['h',c.y+c.height,c.x,c.x+c.width]]) edges.set(edge.join(','),edge);
  }
  for (const [axis,boundary,start,end] of edges.values()) {
    const limit = axis==='v' ? ctx.canvas.width : ctx.canvas.height;
    const position = Math.min(boundary,limit-1);
    for (let p=Math.floor(start/16)*16;p<end;p+=16) {
      const from=Math.max(p,start),to=Math.min(p+8,end);
      if (to>from) {
        if (axis==='v') ctx.fillRect(position,from,1,to-from);
        else ctx.fillRect(from,position,to-from,1);
      }
    }
  }
  for (const x of xs) {
    if (top>=14) ctx.fillRect(Math.min(x,ctx.canvas.width-1),top-12,1,8);
    if (bottom<=ctx.canvas.height-14) ctx.fillRect(Math.min(x,ctx.canvas.width-1),bottom+4,1,8);
  }
  for (const y of ys) {
    if (left>=14) ctx.fillRect(left-12,Math.min(y,ctx.canvas.height-1),8,1);
    if (right<=ctx.canvas.width-14) ctx.fillRect(right+4,Math.min(y,ctx.canvas.height-1),8,1);
  }
  ctx.restore();
}

export async function exportJpeg(canvas, quality = 1) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('exportError');
  return new Blob([withJpegDensity(new Uint8Array(await blob.arrayBuffer()))], { type: 'image/jpeg' });
}

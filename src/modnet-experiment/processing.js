import {compositeWhite} from '../portrait-experiment/processing.js';
export {compositeWhite};
import {RECIPES, edgeRadius} from './model.js';
const roundEven = value => value % 1 === .5 ? 2 * Math.round(value / 2) : Math.round(value);

function geometry(width, height, inputWidth, inputHeight) {
  if (![width, height].every(v => Number.isInteger(v) && v > 0 && v <= 4096)) throw new Error('Invalid working dimensions.');
  const scale = Math.min(inputWidth / width, inputHeight / height);
  const rw = roundEven(width * scale), rh = roundEven(height * scale);
  return {rw, rh, left: Math.floor((inputWidth - rw) / 2), top: Math.floor((inputHeight - rh) / 2)};
}

// Area overlap weights preserve fine source contributions while reducing resolution.
function areaWeights(size, target) {
  const scale = size / target;
  return Array.from({length: target}, (_, index) => {
    const start = index * scale, end = (index + 1) * scale, result = [];
    for (let p = Math.floor(start); p < Math.ceil(end); p++) {
      if (p < size) result.push([p, (Math.min(end, p + 1) - Math.max(start, p)) / scale]);
    }
    return result;
  });
}

export function prepareInput(pixels, width, height, recipe = RECIPES.standard) {
  const {inputWidth, inputHeight, extendBottom} = recipe;
  const {rw, rh, left, top} = geometry(width, height, inputWidth, inputHeight);
  if (pixels.length !== width * height * 4) throw new Error('Invalid source pixels.');
  const xs = areaWeights(width, rw), ys = areaWeights(height, rh);
  const horizontal = new Float32Array(height * rw * 3);
  for (let y = 0; y < height; y++) for (let x = 0; x < rw; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (const [sx, weight] of xs[x]) sum += Math.fround((pixels[(y * width + sx) * 4 + c] - 127.5) / 127.5) * weight;
      horizontal[(y * rw + x) * 3 + c] = sum;
    }
  }
  const plane = inputWidth * inputHeight, tensor = new Float32Array(plane * 3);
  for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (const [sy, weight] of ys[y]) sum += horizontal[(sy * rw + x) * 3 + c] * weight;
      tensor[c * plane + (top + y) * inputWidth + left + x] = sum;
    }
  }
  if (extendBottom) {
    const lastRow = top + rh - 1;
    for (let c = 0; c < 3; c++) {
      const start = c * plane + lastRow * inputWidth;
      for (let y = lastRow + 1; y < inputHeight; y++) {
        tensor.copyWithin(c * plane + y * inputWidth, start, start + inputWidth);
      }
    }
  }
  return tensor;
}

export function buildMask(values, width, height, recipe = RECIPES.standard) {
  const {inputWidth, inputHeight, alphaCutoff} = recipe;
  const {rw, rh, left, top} = geometry(width, height, inputWidth, inputHeight);
  const alphaRange = 1 - 2 * alphaCutoff;
  if (values.length !== inputWidth * inputHeight) throw new Error('Unexpected alpha dimensions.');
  for (const value of values) if (!Number.isFinite(value) || value < -.001 || value > 1.001) throw new Error('The model produced an invalid alpha mask.');
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const sy = Math.max(0, Math.min(rh - 1, (y + .5) * rh / height - .5));
    const y0 = Math.floor(sy), y1 = Math.min(rh - 1, y0 + 1), dy = sy - y0;
    for (let x = 0; x < width; x++) {
      const sx = Math.max(0, Math.min(rw - 1, (x + .5) * rw / width - .5));
      const x0 = Math.floor(sx), x1 = Math.min(rw - 1, x0 + 1), dx = sx - x0;
      const a = values[(top + y0) * inputWidth + left + x0] * (1 - dx) + values[(top + y0) * inputWidth + left + x1] * dx;
      const b = values[(top + y1) * inputWidth + left + x0] * (1 - dx) + values[(top + y1) * inputWidth + left + x1] * dx;
      const alpha = (a * (1 - dy) + b * dy - alphaCutoff) / alphaRange;
      mask[y * width + x] = roundEven(Math.max(0, Math.min(1, alpha)) * 255);
    }
  }
  return mask;
}

// Blend the strongest mark at overlaps so a second tap does not compound the curve.
export function tightenMarkedEdges(mask, width, height, marks, cutoff) {
  const radius = edgeRadius(width, height), weights = new Float32Array(width);
  const startY = Math.max(0, Math.floor(Math.min(...marks.map(mark => mark.y)) - radius));
  const endY = Math.min(height - 1, Math.ceil(Math.max(...marks.map(mark => mark.y)) + radius));
  for (let y = startY; y <= endY; y++) {
    weights.fill(0);
    let first = width, last = -1;
    for (const mark of marks) {
      const dy = y - mark.y;
      if (Math.abs(dy) >= radius) continue;
      const halfWidth = Math.sqrt(radius * radius - dy * dy);
      const left = Math.max(0, Math.ceil(mark.x - halfWidth));
      const right = Math.min(width - 1, Math.floor(mark.x + halfWidth));
      first = Math.min(first, left); last = Math.max(last, right);
      for (let x = left; x <= right; x++) {
        const value = mask[y * width + x];
        if (value === 0 || value === 255) continue;
        const distance = Math.hypot(x - mark.x, dy);
        const weight = Math.max(0, Math.min(1, (radius - distance) / (radius * .25)));
        weights[x] = Math.max(weights[x], weight);
      }
    }
    for (let x = first; x <= last; x++) {
      if (weights[x] === 0) continue;
      const index = y * width + x, alpha = mask[index] / 255;
      const tightened = Math.max(0, Math.min(1, (alpha - cutoff) / (1 - 2 * cutoff)));
      mask[index] = roundEven((alpha + weights[x] * (tightened - alpha)) * 255);
    }
  }
}

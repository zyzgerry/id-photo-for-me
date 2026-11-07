import {compositeWhite} from '../portrait-experiment/processing.js';
export {compositeWhite};
const WIDTH = 512, HEIGHT = 768;
const roundEven = value => value % 1 === .5 ? 2 * Math.round(value / 2) : Math.round(value);

function geometry(width, height) {
  if (![width, height].every(v => Number.isInteger(v) && v > 0 && v <= 4096)) throw new Error('Invalid working dimensions.');
  const scale = Math.min(WIDTH / width, HEIGHT / height);
  const rw = roundEven(width * scale), rh = roundEven(height * scale);
  return {rw, rh, left: Math.floor((WIDTH - rw) / 2), top: Math.floor((HEIGHT - rh) / 2)};
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

export function prepareInput(pixels, width, height) {
  const {rw, rh, left, top} = geometry(width, height);
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
  const plane = WIDTH * HEIGHT, tensor = new Float32Array(plane * 3);
  for (let y = 0; y < rh; y++) for (let x = 0; x < rw; x++) {
    for (let c = 0; c < 3; c++) {
      let sum = 0;
      for (const [sy, weight] of ys[y]) sum += horizontal[(sy * rw + x) * 3 + c] * weight;
      tensor[c * plane + (top + y) * WIDTH + left + x] = sum;
    }
  }
  return tensor;
}

export function buildMask(values, width, height) {
  const {rw, rh, left, top} = geometry(width, height);
  if (values.length !== WIDTH * HEIGHT) throw new Error('Unexpected alpha dimensions.');
  for (const value of values) if (!Number.isFinite(value) || value < -.001 || value > 1.001) throw new Error('The model produced an invalid alpha mask.');
  const mask = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const sy = Math.max(0, Math.min(rh - 1, (y + .5) * rh / height - .5));
    const y0 = Math.floor(sy), y1 = Math.min(rh - 1, y0 + 1), dy = sy - y0;
    for (let x = 0; x < width; x++) {
      const sx = Math.max(0, Math.min(rw - 1, (x + .5) * rw / width - .5));
      const x0 = Math.floor(sx), x1 = Math.min(rw - 1, x0 + 1), dx = sx - x0;
      const a = values[(top + y0) * WIDTH + left + x0] * (1 - dx) + values[(top + y0) * WIDTH + left + x1] * dx;
      const b = values[(top + y1) * WIDTH + left + x0] * (1 - dx) + values[(top + y1) * WIDTH + left + x1] * dx;
      mask[y * width + x] = roundEven(Math.max(0, Math.min(1, a * (1 - dy) + b * dy)) * 255);
    }
  }
  return mask;
}

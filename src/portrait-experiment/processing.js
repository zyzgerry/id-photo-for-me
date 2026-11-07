// Lanczos3 with 22-bit integer coefficients matches Pillow's 8-bit resampling.
// Algorithm reference: python-pillow/Pillow 13.0.0, libImaging/Resample.c.
const SCALE = 4194304, HALF = 2097152;
const clip = value => Math.max(0, Math.min(255, Math.floor(value / SCALE)));
function coefficients(input, output) {
  const scale = input / output, filterScale = Math.max(1, scale), support = 3 * filterScale;
  const result = [];
  for (let x = 0; x < output; x++) {
    const center = (x + .5) * scale;
    const start = Math.max(0, Math.trunc(center - support + .5));
    const end = Math.min(input, Math.trunc(center + support + .5));
    const weights = []; let sum = 0;
    for (let i = start; i < end; i++) {
      const distance = (i - center + .5) / filterScale;
      const sinc = value => value === 0 ? 1 : Math.sin(Math.PI * value) / (Math.PI * value);
      const weight = distance >= -3 && distance < 3 ? sinc(distance) * sinc(distance / 3) : 0;
      weights.push(weight); sum += weight;
    }
    result.push({start, weights: weights.map(w => {
      const value = w / sum * SCALE;
      return Math.trunc(value < 0 ? value - .5 : value + .5);
    })});
  }
  return result;
}

export function resizeBytes(source, width, height, outWidth, outHeight, channels) {
  if (![width, height, outWidth, outHeight, channels].every(v => Number.isInteger(v) && v > 0) || source.length !== width * height * channels) throw new Error('Invalid image dimensions.');
  if (Math.max(width, height, outWidth, outHeight) > 4096 || ![1, 4].includes(channels)) throw new Error('Working image exceeds the supported size.');
  let horizontal = source;
  if (width !== outWidth) {
    const filters = coefficients(width, outWidth);
    horizontal = new Uint8Array(outWidth * height * channels);
    for (let y = 0; y < height; y++) for (let x = 0; x < outWidth; x++) {
      const {start, weights} = filters[x];
      for (let c = 0; c < channels; c++) {
        let sum = HALF;
        for (let k = 0; k < weights.length; k++) sum += source[(y * width + start + k) * channels + c] * weights[k];
        horizontal[(y * outWidth + x) * channels + c] = clip(sum);
      }
    }
  }
  if (height === outHeight) return horizontal;
  const filters = coefficients(height, outHeight), output = new Uint8Array(outWidth * outHeight * channels);
  for (let y = 0; y < outHeight; y++) {
    const {start, weights} = filters[y];
    for (let x = 0; x < outWidth; x++) for (let c = 0; c < channels; c++) {
      let sum = HALF;
      for (let k = 0; k < weights.length; k++) sum += horizontal[((start + k) * outWidth + x) * channels + c] * weights[k];
      output[(y * outWidth + x) * channels + c] = clip(sum);
    }
  }
  return output;
}

export function prepareInput(pixels, width, height) {
  const resized = resizeBytes(pixels, width, height, 1024, 1024, 4);
  let max = 0;
  for (let i = 0; i < resized.length; i += 4) max = Math.max(max, resized[i], resized[i + 1], resized[i + 2]);
  max = Math.max(max, .000001);
  const count = 1024 * 1024, input = new Float32Array(count * 3);
  const means = [.485, .456, .406], std = [.229, .224, .225];
  for (let i = 0; i < count; i++) for (let c = 0; c < 3; c++) input[c * count + i] = (resized[i * 4 + c] / max - means[c]) / std[c];
  return input;
}

export function protectMask(mask, width, height) {
  if (mask.length !== width * height) throw new Error('Invalid mask dimensions.');
  let solid = Uint8Array.from(mask, value => value >= 250 ? 1 : 0);
  for (let pass = 0; pass < 3; pass++) {
    const next = new Uint8Array(solid.length);
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      const i = y * width + x;
      next[i] = solid[i] & solid[i - 1] & solid[i + 1] & solid[i - width] & solid[i + width];
    }
    solid = next;
  }
  for (let i = 0; i < mask.length; i++) {
    if (solid[i]) mask[i] = 255;
    if (mask[i] <= 2) mask[i] = 0;
  }
  return mask;
}

export function buildMask(logits, width, height) {
  const side = Math.sqrt(logits.length);
  if (!Number.isInteger(side) || side < 1) throw new Error('Unexpected mask output.');
  const f = Math.fround, values = new Float32Array(logits.length);
  let min = Infinity, max = -Infinity;
  for (let i = 0; i < logits.length; i++) {
    if (!Number.isFinite(logits[i])) throw new Error('The model produced an invalid mask.');
    const value = f(1 / f(1 + f(Math.exp(-logits[i]))));
    values[i] = value; min = Math.min(min, value); max = Math.max(max, value);
  }
  if (!(max > min)) throw new Error('The model could not distinguish this portrait from its background.');
  const range = f(max - min), raw = new Uint8Array(values.length);
  for (let i = 0; i < raw.length; i++) raw[i] = Math.trunc(f(f(f(values[i] - min) / range) * 255));
  return protectMask(resizeBytes(raw, side, side, width, height, 1), width, height);
}

export function compositeWhite(pixels, mask) {
  if (pixels.length !== mask.length * 4) throw new Error('Invalid source pixels.');
  for (let i = 0; i < mask.length; i++) {
    const alpha = mask[i], offset = i * 4;
    for (let c = 0; c < 3; c++) pixels[offset + c] = Math.floor((pixels[offset + c] * alpha + 255 * (255 - alpha) + 127) / 255);
    pixels[offset + 3] = 255;
  }
  return pixels;
}

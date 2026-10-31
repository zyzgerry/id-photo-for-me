export const PPI = 300;
export const SHEET = { width: 1800, height: 1200, widthMm: 152.4, heightMm: 101.6 };
export const mmToPx = mm => mm * PPI / 25.4;

export function layoutSheet(widthMm, heightMm, requested) {
  if (![widthMm, heightMm].every(n => Number.isFinite(n) && n >= 10 && n <= 152.4)) {
    throw new Error('dimensions');
  }
  const candidates = [false, true].map(rotated => {
    const w = rotated ? heightMm : widthMm;
    const h = rotated ? widthMm : heightMm;
    const columns = Math.floor((SHEET.widthMm + 1e-8) / w);
    const rows = Math.floor((SHEET.heightMm + 1e-8) / h);
    return { rotated, w, h, columns, rows, count: columns * rows };
  });
  const capacity = Math.max(...candidates.map(c=>c.count));
  if (!capacity) throw new Error('noFit');
  const count = requested ?? capacity;
  if (!Number.isInteger(count) || count < 1 || count > capacity) throw new Error('copyLimit');
  const arrangements = candidates.flatMap(candidate => {
    const grids = [];
    for (let columns=1;columns<=candidate.columns;columns++) {
      const rows = Math.ceil(count/columns);
      if (rows<=candidate.rows) grids.push({...candidate,columns,rows,count});
    }
    return grids;
  });
  const clearance=c=>Math.min(SHEET.widthMm-c.columns*c.w,SHEET.heightMm-c.rows*c.h);
  // Shared cut lines first, then fewer empty cells and a compact footprint.
  const best = arrangements.sort((a,b)=>(a.columns+a.rows)-(b.columns+b.rows) ||
    (a.columns*a.rows)-(b.columns*b.rows) ||
    (a.columns*a.w+a.rows*a.h)-(b.columns*b.w+b.rows*b.h) || clearance(b)-clearance(a) || Number(a.rotated)-Number(b.rotated))[0];
  // Round absolute boundaries so adjacent copies share exactly the same cut line.
  const x0 = (SHEET.widthMm - best.columns * best.w) / 2;
  const y0 = (SHEET.heightMm - best.rows * best.h) / 2;
  const copies = [];
  for (let row = 0; row < best.rows; row++) {
    for (let column = 0; column < best.columns; column++) {
      if (copies.length === count) break;
      const x = Math.round(mmToPx(x0 + column * best.w));
      const y = Math.round(mmToPx(y0 + row * best.h));
      copies.push({ x, y,
        width: Math.round(mmToPx(x0 + (column + 1) * best.w)) - x,
        height: Math.round(mmToPx(y0 + (row + 1) * best.h)) - y,
        rotated: best.rotated });
    }
  }
  return { ...best, capacity, copies, widthMm, heightMm };
}

export function cropRect(width, height, ratio, zoom = 1, x = 50, y = 50) {
  let cropWidth = Math.min(width, height * ratio) / zoom;
  let cropHeight = cropWidth / ratio;
  return { x: (width - cropWidth) * x / 100, y: (height - cropHeight) * y / 100,
    width: cropWidth, height: cropHeight };
}

export function withJpegDensity(bytes, density = PPI) {
  if (bytes[0] !== 255 || bytes[1] !== 216) throw new Error('jpeg');
  // Insert JFIF first; discard the encoder's old JFIF to avoid competing densities.
  let start = 2;
  if (bytes[2] === 255 && bytes[3] === 224 &&
      String.fromCharCode(...bytes.slice(6, 11)) === 'JFIF\0') {
    start = 4 + ((bytes[4] << 8) | bytes[5]);
  }
  const header = new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,1,2,1,
    density >> 8, density & 255, density >> 8, density & 255,0,0]);
  const result = new Uint8Array(header.length + bytes.length - start);
  result.set(header); result.set(bytes.subarray(start), header.length);
  return result;
}

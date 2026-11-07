export const MODEL = Object.freeze({
  name: 'MODNet photographic portrait FP32',
  bytes: 25888640,
  sha256: '07c308cf0fc7e6e8b2065a12ed7fc07e1de8febb7dc7839d7b7f15dd66584df9',
  directory: 'modnet-07c308cf',
  partSizes: [25888640],
  source: 'https://github.com/zyzgerry/id-photo-for-me/releases/download/modnet-safari-2026-11-07/modnet-photographic.onnx',
  runtime: '1.31.1',
  inputWidth: 512,
  inputHeight: 768,
});

const STANDARD = Object.freeze({label: 'Standard', inputWidth: 512, inputHeight: 768, alphaCutoff: 0, extendBottom: false});
export const MAX_EDGE_MARKS = 8;
export const edgeRadius = (width, height) => Math.max(1, Math.round(Math.min(width, height) * .085));

export const RECIPES = Object.freeze({
  standard: STANDARD,
  'edge-20-80': Object.freeze({...STANDARD, label: '20–80% edges', edgeCutoff: .20}),
  'edge-30-70': Object.freeze({...STANDARD, label: '30–70% edges', edgeCutoff: .30}),
  detail: Object.freeze({label: 'Detail', inputWidth: 1024, inputHeight: 1536, alphaCutoff: .02, extendBottom: true}),
});

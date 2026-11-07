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

export const RECIPE = Object.freeze({key: '1024x1536-20-80', label: '1024 × 1536 · 20–80% full photo', inputWidth: 1024, inputHeight: 1536, edgeCutoff: .20});

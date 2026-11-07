# Third-party software

HEIC fallback decoding uses the unmodified CSP distribution of [heic-to 1.6.7](https://github.com/hoppergee/heic-to/tree/v1.6.7), by Hopper Gee, under LGPL-3.0-or-later. It includes libheif and its codec components; their notices are retained in the upstream source distribution.

The build distributes the decoder as a separate, replaceable JavaScript module at `vendor/heic-to.js`, its license at `vendor/heic-to.LICENSE.txt`, and its supplied source at `vendor/heic-to-source/`. Full upstream source and build instructions are available from the linked version and the pinned package `https://registry.npmjs.org/heic-to/-/heic-to-1.6.7.tgz`. No decoder modifications are made by this application. Users may replace the module with a compatible version.

The application loads no third-party hosted assets at runtime. Official requirements links open only when a user chooses them.


The isolated portrait experiment uses ONNX Runtime Web 1.31.1 (Microsoft, MIT) and hash-wasm 4.12.0 (Daninet, MIT), pinned in the dependency lockfile. Runtime files and streaming SHA-256 code are copied into the experiment vendor directory at build time, including licenses and ONNX Runtime third-party notices. Source: https://github.com/microsoft/onnxruntime/tree/v1.31.1 and https://github.com/Daninet/hash-wasm/tree/v4.12.0. The main editor does not import these assets.

BiRefNet Portrait weights are distributed under MIT (Copyright 2024 ZhengPeng): https://huggingface.co/ZhengPeng7/BiRefNet-portrait and https://github.com/ZhengPeng7/BiRefNet. The validated INT4 derivative retains the learned weights/precision and rewrites split/join and channel-independent sampling operations for browser execution. Its exact hash and the original MIT license are in src/portrait-experiment/MODEL-NOTICE.txt. Large weights are release assets, not Git source files; CI verifies them and publishes same-origin model parts only in the generated Pages artifact.

The experiment's Lanczos implementation follows Pillow's 8-bit resampling conventions; the Pillow license and algorithm reference are included with the experiment. All portrait processing remains on-device. No personal photographs or masks are included in deployed assets.

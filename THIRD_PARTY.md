# Third-party software and models

The original app code uses the [MIT License](LICENSE.txt). The components below retain their own licenses.

HEIC fallback decoding uses the unmodified CSP distribution of [heic-to 1.6.7](https://github.com/hoppergee/heic-to/tree/v1.6.7), by Hopper Gee, under LGPL-3.0-or-later. It includes libheif and its codec components; their notices are retained in the upstream source distribution.

The build distributes the decoder as a separate, replaceable JavaScript module at `vendor/heic-to.js`, its license at `vendor/heic-to.LICENSE.txt`, and its supplied source at `vendor/heic-to-source/`. Full upstream source and build instructions are available from the linked version and the pinned package `https://registry.npmjs.org/heic-to/-/heic-to-1.6.7.tgz`. No decoder modifications are made by this application. Users may replace the module with a compatible version.

Runtime assets are served by this site. Official requirements links open only when a user chooses them.

The main editor loads the [MODNet photographic portrait model](src/modnet-experiment/MODEL-NOTICE.txt) when you choose Remove background. The standalone MODNet experiment uses the same weights. The model is distributed under [Apache 2.0](src/modnet-experiment/MODNET-LICENSE.txt). The build pipeline verifies the release asset and publishes the model from the same site.

The main editor’s background-removal worker and the MODNet and BiRefNet experiments use [ONNX Runtime Web 1.31.1](https://github.com/microsoft/onnxruntime/tree/v1.31.1) and [hash-wasm 4.12.0](https://github.com/Daninet/hash-wasm/tree/v4.12.0), both MIT. The build ships the [runtime license](src/portrait-experiment/ORT-LICENSE.txt), [runtime notices](src/portrait-experiment/ORT-NOTICES.txt), and the hash library license in the vendor assets.

BiRefNet Portrait weights are distributed under MIT (Copyright 2024 ZhengPeng): https://huggingface.co/ZhengPeng7/BiRefNet-portrait and https://github.com/ZhengPeng7/BiRefNet. The validated INT4 derivative retains the learned weights/precision and rewrites split/join and channel-independent sampling operations for browser execution. Its exact hash and the original MIT license are in src/portrait-experiment/MODEL-NOTICE.txt. Large weights are release assets, not Git source files; CI verifies them and publishes same-origin model parts only in the generated Pages artifact.

The portrait processing code follows Pillow’s 8-bit Lanczos resampling conventions. Its license and algorithm reference are included with the portrait experiment. The earlier MediaPipe experiment carries its own [software and model notices](src/background-experiment/NOTICE.txt). All portrait processing remains on-device. No personal photographs or masks are included in deployed assets.

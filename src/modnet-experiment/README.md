# MODNet Safari experiment

Open src/modnet-experiment/ on the published site. Choose Prepare model, choose a JPEG/PNG/HEIC portrait, then Remove background. Save PNG and diagnostic report. Repeat the same photo twice before testing another image.

The exact reviewed photographic FP32 ONNX file is checked by SHA-256. Full image is fit to 512x768 with neutral padding, RGB normalized to [-1,1], predicted soft alpha restored with bilinear interpolation and composited with original source RGB onto white. JavaScript area and bilinear sampling can differ slightly from OpenCV. CPU exports were compared with native outputs on identical decoded images.

The trial uses single-thread WASM CPU processing. A desktop graphics candidate completed but failed output parity, so CPU is the only offered provider. CPU inference, image handling and export timings are separate in reports. Download size is about 26 MB plus lazy-loaded runtime tools. Peak device memory is unmeasured.

Photo loading reuses the existing decoder. Desktop WebKit passes normalized PNG processing; its large raw JPEG/HEIC loading remains a validation gap. Chrome passes both originals. Actual Safari photo loading needs the physical device test. All processing and exports stay local. Only static same-origin model/runtime assets are fetched. Stage markers and reports exclude pixels and filenames by default. Cancel terminates the worker, releasing the inference session. Results remain until reset or another image is loaded.

Model weights stay outside source Git and are prepared by node scripts/prepare-portrait-model.mjs --modnet. Model and license identity are in MODEL-NOTICE.txt. No private portrait is a public asset.

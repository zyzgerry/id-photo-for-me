# MODNet Safari experiment

Open src/modnet-experiment/ on the published site. Choose Prepare model, choose a JPEG/PNG/HEIC portrait, then Remove background. Save PNG and diagnostic report. Save the Standard result, select Detail, and run the same photo again with the prepared model. Save the Detail result and one diagnostic report.

The exact reviewed photographic FP32 ONNX file is checked by SHA-256. Standard fits the full image to 512x768 with neutral padding. Detail uses 1024x1536, extends the last image row into lower padding, and clips the alpha range below 0.02 and above 0.98 with linear rescaling between. Both normalize RGB to [-1,1], restore soft alpha with bilinear interpolation, and composite the original RGB onto white. The run report records the option and input dimensions. Switching options reuses the worker and model. JavaScript area and bilinear sampling can differ slightly from OpenCV. CPU exports were compared with native outputs on identical decoded images.

The trial uses single-thread WASM CPU processing. A desktop graphics candidate completed but failed output parity, so CPU is the only offered provider. CPU inference, image handling and export timings are separate in reports. Download size is about 26 MB plus lazy-loaded runtime tools. Peak device memory is unmeasured.

Photo loading reuses the existing decoder. Desktop WebKit passes normalized PNG processing; its large raw JPEG/HEIC loading remains a validation gap. Chrome passes both originals. Actual Safari photo loading needs the physical device test. All processing and exports stay local. Only static same-origin model/runtime assets are fetched. Stage markers and reports exclude pixels and filenames by default. Cancel terminates the worker, releasing the inference session. Results remain until reset or another image is loaded.

Model weights stay outside source Git and are prepared by node scripts/prepare-portrait-model.mjs --modnet. Model and license identity are in MODEL-NOTICE.txt. No private portrait is a public asset.

The 20–80% and 30–70% options use Standard inference and adjust the alpha mask in up to eight user-marked circles. A circle radius is 8.5% of the working image's shorter side, with a taper across its outer quarter. Overlap uses the strongest mark. Both strengths reuse the same marks until cleared or another photo is loaded. The report records the number of marks and refinement time. Positions are held locally in the page and worker.

# MODNet Safari experiment

Open the MODNet experiment, choose a JPEG, PNG or HEIC portrait, and tap **Remove background**. The first run prepares the model and continues automatically. Save the PNG and diagnostic report. Repeat runs reuse the prepared model.


The trial uses single-thread WASM CPU processing. A desktop graphics candidate completed but failed output parity, so CPU is the only offered provider. CPU inference, image handling and export timings are separate in reports. Download size is about 26 MB plus lazy-loaded runtime tools. Peak device memory is unmeasured.

Photo loading reuses the existing decoder. Desktop WebKit passes normalized PNG processing; its large raw JPEG/HEIC loading remains a validation gap. Chrome passes both originals. Actual Safari photo loading needs the physical device test. All processing and exports stay local. Only static same-origin model/runtime assets are fetched. Stage markers and reports exclude pixels and filenames by default. Cancel terminates the worker, releasing the inference session. Results remain until reset or another image is loaded.

Model weights stay outside source Git and are prepared by node scripts/prepare-portrait-model.mjs --modnet. Model and license identity are in MODEL-NOTICE.txt. No private portrait is a public asset.

The trial uses a 1024 × 1536 MODNet mask with neutral padding. It tightens the quantized mask at 20–80% across the full working photo, then composites the original RGB over white. The report records preparation and processing separately.

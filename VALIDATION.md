# Validation and release checklist

## Automated verification

Run `pnpm test`, `pnpm build`, and `pnpm test:browser` from the repository. The browser checks cover:

- Exact 1800×1200 sheet and six 600×600-pixel copies for 2×2-inch photos; 300-ppi JFIF metadata in the saved JPEG.
- Metric raster tolerance, both uniform-grid orientations, impossible sizes, and shared boundaries without borders/gaps.
- Asymmetric crop preview/export agreement; ratio changes; JPEG EXIF orientation; synthetic HEIC decoding after going offline.
- Neutral adjustments, repeated slider changes, original comparison, and reset without cumulative edits.
- Unsupported/corrupt files, byte limits, and excessive pixel headers.
- No HTTP requests during an offline selection/edit/export session; no local/session storage or cookies; clear disables export and removes displayed photo data.
- English/Chinese switching, a 320-pixel-wide layout, keyboard crop movement, and pointer drag.
- Synthetic 12-, 24-, and 48-megapixel inputs, with bounded working-image dimensions and effective-resolution readouts.

On October 30, 2026, all six Node tests and all seven browser scenarios passed on local Windows Chrome. Hallmark's initialized desktop/mobile render scan reported zero failures, reflex findings, or warnings; its independent finish review returned `ship`. GitHub Actions repeats the functional checks on Linux Chromium before deployment.

Source photographs are not persisted. Ordinary hosting requests still occur on first load. HEIC is limited to still images and the first primary image. The limits are provisional until device testing.

## Human validation before calling v1 ready

1. Open the public Pages link on each actual iPhone. Record phone model, iOS/Safari version, and available memory/storage conditions. Test a second device without login.
2. Select from Photos and Files: JPEG, PNG with transparency, HEIC, portrait/landscape orientation, and representative 12-, 24-, and 48-megapixel photos. Check upright orientation, natural skin tones, HDR/wide-gamut behavior, decode failures, and responsiveness. Use consenting photos locally; do not add them to Git.
3. Move the crop by touch, pinch to zoom, change presets, compare/reset adjustments, and switch languages. Confirm no page-scroll gesture moves the crop unexpectedly.
4. After initial loading finishes, disconnect network access. Select, edit, generate, download, and share a photo. Reopen the JPEG from Files, and use the native share menu to save to Photos where offered. Record behavior and failures.
5. Print a complete sheet at exactly 4×6 inches with no automatic cropping/enlargement/fit/fill. Measure the paper and each ID photo, and note the printer/lab and settings. Borderless overscan is a printer issue; do not silently scale the photographs to compensate.
6. Confirm current document requirements with the applicable agency. The Portugal 35×45-mm preset is tied to the linked VFS Portugal U.S. short-stay checklist from 2022, not all Portuguese applications.

Real-iPhone and physical-print checks have not yet been performed. Supported device/browser versions and final large-file limits must follow this evidence.

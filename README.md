# ID Photo for Me

A personal, mobile-friendly utility for arranging accurately sized ID photos on a 4x6-inch print, or resizing/converting a single JPEG for upload. Photos are processed entirely on the user's device.

## Project locations

- Code: public GitHub repository `zyzgerry/id-photo-for-me`, made public with the owner's explicit authorization so the current GitHub plan can host Pages.
- Local development: clone this repository under the device's `repos` folder.
- Canonical purpose and specification: `AI_Project/id-photo-for-me/id-photo-print-spec.md` in iCloud Drive. Keep that document as the source of truth; do not maintain a duplicate specification here.

On Windows, the specification is normally at `~/iCloudDrive/AI_Project/id-photo-for-me/id-photo-print-spec.md`.
On macOS, it is normally at `~/Library/Mobile Documents/com~apple~CloudDocs/AI_Project/id-photo-for-me/id-photo-print-spec.md`.

## Requirements-first workflow

Country/document or custom requirements → upload → edit → choose Single photo or Printable sheet → customize output or arrange a 4×6 sheet → export. Desktop keeps two columns; phones follow that order vertically. All sections remain visible, with later controls inactive until upload. Requirements changes preserve edits and require framing review before export. Both output modes share the current photo requirements and edits. Printable sheet is the default output; the choice appears below the static 4. Customize output heading after the shared editor. Export is a separate step 5 section. Customize output defaults to source-detail maximum-quality JPEG; compression defaults to Auto compression with a maximum file-size cap. Full custom compression lets users choose JPEG quality (1–100) and linked pixel dimensions with no cap.

Document choices reuse the sourced printed-photo catalog, including a scoped Schengen framing format. They set crop proportions and physical print dimensions; they do not impose digital upload limits. Users set their own KB cap or pixel dimensions in Customize output and check their application requirements.

## Confirmed direction

- Static browser application; iPhone Safari first, Windows desktop browsers second.
- GitHub Pages hosting, with repository-subpath-compatible asset URLs.
- Local photo selection, optional crop and brightness/contrast, sheet preview, and JPEG export.
- Exact 4x6-inch sheet geometry; preserve each requested photo's physical dimensions.
- No photo uploads, backend, accounts, analytics, remote processing, or persistent photo history.
- Keep personal photos, credentials, and private project data out of Git.

## Run and verify

Requires Node.js 24 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

Open `http://127.0.0.1:4173/id-photo-for-me/`. The root URL works too. No server is needed in production beyond static hosting; the local server is for development.

```sh
pnpm exec playwright install chromium webkit firefox
pnpm test:browser
```

The suite runs Chromium, WebKit, and Firefox. On Windows, the Chromium project uses an installed Chrome if found; otherwise it uses Playwright Chromium. Run one project with `pnpm test:browser --project=webkit` (or `chromium` / `firefox`). Browser tests use synthetic quadrants, including a HEIC file and an EXIF-rotated JPEG; no personal photos are included. Fixture recreation is documented in `tests/fixtures/generate.py` and requires development-only Pillow/pillow-heif, not the application.

The GitHub Actions workflow verifies the app, builds static files, and deploys `dist/` to GitHub Pages on pushes to `main`. Relative asset URLs support both repository subpaths and root hosting.

## Scope and current limits

- English and Simplified Chinese; 99 printed-photo presets across 95 countries and regions, plus custom dimensions. Passport and visa routes are labeled separately, including application-location restrictions. Every preset links its government, consular, or authorized application-operator source and check date. See [catalog research and benchmark](research/photo-requirements.md) for the complete list and exclusions.
- All image processing is local. No analytics, remote fonts, image services, persistent browser storage, or service workers. At startup, a small same-origin GET checks the current release; no photo data is sent. A restrictive Content Security Policy blocks third-party connections; official sources open only when chosen.
- HEIC tries native decoding first, with an unmodified, locally bundled `heic-to` fallback. The fallback module loads at startup so it is available after disconnecting. See `THIRD_PARTY.md` for licensing and source.
- Provisional limits: 30 MiB, 50 megapixels, and 12,000 pixels per side. Images are reduced to a working edge of at most 4096 pixels. Effective crop resolution uses this working image and warns below 300 ppi.
- Print mode stays at 300 ppi (1800×1200 pixels), uses maximum JPEG encoder quality 1.0, and has no byte cap or resolution controls. The copy number beside the preview defaults to maximum and is editable up to the calculated grid capacity; the maximum is stated directly below it. Compact uniform grids consider both orientations without shrinking copies. Zero gaps; leftover paper stays white. Switchable one-pixel dashed guides outline all edges, with outer ticks in unused paper. Cut along guides to avoid traces. Metric sizes are accurate within one output pixel.
- ID preparation applies the selected format’s proportions; custom requirements can keep the full photo or use a chosen crop ratio. Best quality retains available crop detail by default. Optional compression offers explicit pixel dimensions from 1–4096. The preview reports actual encoded dimensions, exact bytes and quality.
- File-size mode defaults to 300 KB and accepts 1–30,000 KB. It uses automatic crop-derived pixels. Compression searches encoder settings to 0.0001 precision: first 0.90–1.0 at original, 95%, then 90% dimensions; then repeats those dimensions with floors of 0.80, 0.70 and 0.55 before shrinking further. The largest candidate in the first successful quality band wins; every candidate is measured after JPEG metadata is added. These are encoder settings, not visual-quality percentages. Full custom compression has no KB cap and uses the exact JPEG encoder setting (1–100) and pixels chosen by the user. The preview and measured size precede controls and remain visible in a compact sticky block while adjusting settings. Previous results are clearly marked during recomputation and export waits for a valid new result. Both pixel inputs are editable; the last edited side determines the other, labeled calculated. Reset pixels restores automatic crop dimensions without changing quality. Auto and Custom retain their own settings while switching; a replacement photo resets Custom to quality 100 and available crop dimensions. Pixel dimensions accept 1–4096 per side.
- Clicking the single-photo preview opens the actual export blob in a full-screen viewer with Fit, 100%, zoom controls, pinch/drag and keyboard navigation. Closing revokes its object URL and returns focus to the opener.
- Desktop uses a two-column workbench; wide editors place preview and tools side by side. Mobile keeps the crop preview visible while adjusting, with Framing/Adjustments tabs and optional fine-position controls. See `DESIGN.md` for interface decisions.
- Brightness and contrast are neutral by default. Presets with editing restrictions require explicitly enabling adjustments after the notice. Short document labels and dimensions stay visible; detailed guidance, application scope and source links are in the collapsed Requirements & sources section. Location-specific presets keep a brief visible caveat; paper, photographer, appointment, and portal requirements still apply. The app checks geometry, not government acceptance.
- HEIC HDR/wide-gamut appearance, large-photo memory behavior, native sharing, and saving on real iPhones remain subject to the release checks below. Current-browser orientation handling and sRGB canvas conversion are used; universal color fidelity is not claimed.

## Release validation

See [VALIDATION.md](VALIDATION.md) for automated evidence and the remaining real-iPhone and physical-print checklist. Desktop emulation is not a substitute for those checks.

## Browser updates

Each build gives its scripts, nested modules, styles and decoder a shared content-derived release path. A hash-authorized inline startup script checks `release.json` with a unique request URL and `cache: no-store`. If cached HTML belongs to an older release, it navigates to a release-specific page URL before enabling the editor, keeping HTML and assets together. Repeated builds of identical inputs produce the same version. Root and repository-subpath hosting are supported.

Update-check errors or a three-second timeout fall back to the page's own release. Already-open editors are not polled or automatically reloaded, preserving unsaved work; updates apply on the next normal visit/reload. This is not offline installation. Legacy unversioned assets remain available for the one-time migration; HTML cached before this updater existed can remain old until its existing cache expires (the observed GitHub Pages response allowed 600 seconds). A website cannot retroactively execute new update code inside an already cached old page.

Head-placement guides are available for every preset and hidden for custom shapes. Presets without sourced head-size ranges use clearly labeled adjustable manual references. Guide overlays never enter exported files.

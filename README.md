# ID Photo for Me

A personal, mobile-friendly utility for arranging accurately sized ID photos on a 4x6-inch print. Photos are processed entirely on the user's device.

## Project locations

- Code: public GitHub repository `zyzgerry/id-photo-for-me`, made public with the owner's explicit authorization so the current GitHub plan can host Pages.
- Local development: clone this repository under the device's `repos` folder.
- Canonical purpose and specification: `AI_Project/id-photo-for-me/id-photo-print-spec.md` in iCloud Drive. Keep that document as the source of truth; do not maintain a duplicate specification here.

On Windows, the specification is normally at `~/iCloudDrive/AI_Project/id-photo-for-me/id-photo-print-spec.md`.
On macOS, it is normally at `~/Library/Mobile Documents/com~apple~CloudDocs/AI_Project/id-photo-for-me/id-photo-print-spec.md`.

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
pnpm exec playwright install chromium
pnpm test:browser
```

On Windows, the tests use an installed Chrome if found. Otherwise they use Playwright Chromium. Browser tests use synthetic quadrants, including a HEIC file and an EXIF-rotated JPEG; no personal photos are included. Fixture recreation is documented in `tests/fixtures/generate.py` and requires development-only Pillow/pillow-heif, not the application.

The GitHub Actions workflow verifies the app, builds static files, and deploys `dist/` to GitHub Pages on pushes to `main`. Relative asset URLs support both repository subpaths and root hosting.

## Scope and current limits

- English and Simplified Chinese; U.S. passport, U.S. printed visa photo, Portugal short-stay Schengen visa, and custom dimensions.
- All image processing is local. No analytics, remote fonts, image services, persistent browser storage, or service workers. A restrictive Content Security Policy disables application network connections; official sources open only when chosen.
- HEIC tries native decoding first, with an unmodified, locally bundled `heic-to` fallback. The fallback module loads at startup so it is available after disconnecting. See `THIRD_PARTY.md` for licensing and source.
- Provisional limits: 30 MiB, 50 megapixels, and 12,000 pixels per side. Images are reduced to a working edge of at most 4096 pixels. Effective crop resolution uses this working image and warns below 300 ppi.
- JPEG export is 1800×1200 pixels, with JFIF density set to 300 ppi. A uniform grid considers both orientations without shrinking copies. Zero gaps and no thick borders; leftover paper remains white. Switchable cutting guides add one-pixel dashed shared edges and outer ticks in unused paper, without changing photo dimensions or capacity. Cut along the guides to avoid traces. Metric sizes are accurate within one output pixel.
- Desktop uses a compact three-region workbench. Mobile keeps the crop preview visible while adjusting, with Framing/Adjustments tabs and optional fine-position controls. See `DESIGN.md` for interface decisions.
- Brightness and contrast are neutral by default. U.S. presets require explicitly enabling adjustments after the editing-restriction notice. The app checks geometry, not government acceptance.
- HEIC HDR/wide-gamut appearance, large-photo memory behavior, native sharing, and saving on real iPhones remain subject to the release checks below. Current-browser orientation handling and sRGB canvas conversion are used; universal color fidelity is not claimed.

## Release validation

See [VALIDATION.md](VALIDATION.md) for automated evidence and the remaining real-iPhone and physical-print checklist. Desktop emulation is not a substitute for those checks.

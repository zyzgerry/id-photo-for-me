# ID Photo for Me

A personal, mobile-friendly utility for arranging accurately sized ID photos on a 4x6-inch print. Photos are processed entirely on the user's device.

## Project locations

- Code: private GitHub repository `zyzgerry/id-photo-for-me`.
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

## Status

Repository initialized. App implementation, validation, and GitHub Pages configuration have not started. Read the canonical specification before implementation, including its open release decisions and testing requirements.

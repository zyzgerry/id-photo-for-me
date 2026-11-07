# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users and purpose

The owner, family and friends prepare ID photos and print layouts using a private-on-device, mobile-friendly static web tool. iPhone Safari is the primary environment; desktop browsers are secondary.

## Capabilities and constraints

The existing editor supports requirements, photo upload, framing/adjustments, single-photo output and printable sheets. Preserve its behavior. Canonical detailed specifications and private validation data remain in the separate iCloud project; this document records confirmed product context only.

The owner approved an isolated browser experiment for the validated BiRefNet Portrait INT4 export. It must remain a separate page and load no model/runtime assets during ordinary editor use. Photos, masks and face pixels remain on device. Only static tools and model assets are downloaded. No accounts, analytics or cloud inference.

## Operating context

Prepare the model explicitly, select a JPEG/PNG/HEIC portrait, process, inspect hair and clothing, save a PNG and diagnostic report. Report actual preparation and processing stages separately. Cancellation, recovery and unchanged originals are essential. Persistent diagnostic markers contain metadata only, never photos.

## Product principles

- Keep ordinary photo editing independent of experimental model processing.
- Preserve the person's appearance and original colors.
- Show substantial download and processing costs before starting.
- Make failures recoverable and measurements honest.

## Evidence and open decisions

Local four-photo and desktop-browser validations support the chosen model quality. Actual iPhone resource limits, first-use wait, cache behavior and usability remain open until device testing. Production integration is not approved by the experiment.

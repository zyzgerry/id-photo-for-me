# ID Photo for Me interface

The app is a practical, private ID-photo workbench: cool neutral background, white surfaces, navy text, restrained blue actions, system fonts, English and Simplified Chinese. Photos remain local; no personal photographs or credentials enter Git.

## Requirements-first flow

The introduction explains both jobs. Two keyboard-operable native radio cards show illustrative result mockups and select Print a photo sheet or Prepare a digital ID photo. Mark examples as examples. Do not duplicate the selector in the workbench.

Keep the existing two-column desktop layout. Left: Requirements, then Upload photo. Right: Edit photo, then Arrange sheet / Adjust digital output, then Export. Phones read the same logical sequence vertically. All sections remain visible; editing/output/export controls are inactive before upload, with readable empty-state guidance. No wizard or duplicated controls. Requirements stay before upload in DOM, visual and keyboard order at every breakpoint.

Requirements include country/document or a direct custom option, essential dimensions and critical scope caveats. Detailed bilingual guidance, source links and check dates stay in Requirements & sources. Upload has one primary picker, format disclosure and decoding feedback. The empty editor explains its purpose without a competing picker.

Crop proportions come from requirements before editing. In custom digital mode users can retain original proportions or set a crop ratio. Later pixel dimensions stay linked to that ratio; file-size edits must not silently reframe the photo. Original-photo mode preserves the full image. Keep Framing/Adjustments tabs, optional fine positioning, keyboard/pointer controls, applicable head guides and editing restrictions. Restricted adjustments can remain stored while unapplied; a requirement change must not erase them. UK own-device passport mode retains the full photo and disables tonal adjustments.

Changing requirements retains the photo, valid framing and adjustments, updates proportions, and flags framing review. Export stays blocked until the user confirms Framing reviewed. Each mode retains its own requirements, framing, adjustments, review state and output settings in memory. Clearing/replacing the photo resets framing and adjustments for both modes.

## Output

Print arrangement is automatic, fixed 4×6 inches at 300 ppi (1800×1200 pixels). Copy count and cutting guides belong after editing. Never shrink individual physical photo dimensions to fit. Preserve zero-gap uniform-grid placement, exact counts, complete one-pixel dashed edges including partial rows, and maximum JPEG quality with no byte cap. Screen-pixel overlays stay aligned with the canvas and never enter the output.

Digital output shows the actual encoded JPEG, pixels, bytes and quality. Retain maximum file size, optional pixel minimums and explicit dimension-reduction permission. Verified presets enforce source pixel/byte bounds and applicable compression limits on the actual encoded output; impossible constraints block export. Never pad a file to pretend it meets a minimum. The UK route forbids cropping; Canada/Schengen guidance does not imply a verified editable preset. See research/digital-requirements.md.

Export labels identify print sheet or ID photo. Print instructions retain whole-sheet actual-size/no-fit guidance. Correct geometry and bytes do not guarantee acceptance, which also depends on the subject, background and application route.

## Accessibility and responsive behavior

Keep 44px touch areas, visible focus, readable inactive guidance, no horizontal overflow at 320px, and English/Chinese parity. On phones the crop preview remains visible within the editor while tools scroll. Short landscape viewports use ordinary scrolling. Do not add a separate sticky preview/navigation system. Source changes, resize and language changes must not reset values or steal focus.

Portugal head guides retain their distinct VFS UK source; print dimensions retain the U.S. checklist source. Preserve short document names, child eligibility qualifiers, scoped location notes, Schengen/national distinctions and collapsed source disclosures.

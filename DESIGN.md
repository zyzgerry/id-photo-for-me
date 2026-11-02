# ID Photo for Me interface

The app is a practical, private ID-photo workbench: cool neutral background, white surfaces, navy text, restrained blue actions, system fonts, English and Simplified Chinese. Photos remain local; no personal photographs or credentials enter Git.

## Requirements-first flow

The introduction explains the shared photo preparation workflow. Choose requirements, upload, and edit before choosing an output. A compact native radio selector immediately below the editor offers Single photo or Printable sheet (default). The latter reveals the existing sheet arrangement controls. Both use the same current edits; no output decision is needed at the beginning.

Keep the existing two-column desktop layout. Left: Requirements, then Upload photo. Right: Edit photo, then 4. Customize output, then a separate 5. Export section. Phones read the same logical sequence vertically. All sections remain visible; editing/output/export controls are inactive before upload, with readable empty-state guidance. No wizard or duplicated controls. Requirements stay before upload in DOM, visual and keyboard order at every breakpoint.

Requirements include country/document or a direct custom option, essential dimensions and critical scope caveats. Detailed bilingual guidance, source links and check dates stay in Requirements & sources. Upload has one primary picker, format disclosure and decoding feedback. The empty editor explains its purpose without a competing picker.

Crop proportions come from requirements before editing. In custom preparation mode users can retain original proportions or set a crop ratio. Later pixel dimensions stay linked to that ratio; file-size edits must not silently reframe the photo. Original-photo mode preserves the full image. Keep Framing/Adjustments tabs, optional fine positioning, keyboard/pointer controls, applicable head guides and editing restrictions. Restricted adjustments can remain stored while unapplied; a requirement change must not erase them.

Changing requirements retains the photo, valid framing and adjustments, updates proportions, and flags framing review. Export stays blocked until the user confirms Framing reviewed. Both outputs share the current requirements, crop, tonal adjustments, adjustment permission and framing-review state. Switching output modes must not restore an older edit session. Keep print arrangement and preparation output controls separately adjustable; clearing/replacing the source photo explicitly resets its edits.

## Output

Print arrangement is automatic, fixed 4×6 inches at 600 ppi (3600×2400 pixels). Copy count and cutting guides belong after editing. Never shrink individual physical photo dimensions to fit. Preserve zero-gap uniform-grid placement, exact counts, complete two-pixel dashed edges including partial rows, and maximum JPEG quality with no byte cap. Screen-pixel overlays stay aligned with the canvas and never enter the output.

Customize output offers Preserve best quality (default) and Compress output size. Compression has two mutually exclusive native radio choices: Set maximum file size (default) uses automatic dimensions and may reduce them to fit the KB cap; Set pixel dimensions uses exact linked dimensions at maximum JPEG quality, with no KB cap. Never validate hidden controls from the other target. Remove user-editable minimums, the resize checkbox and country-specific digital output bounds. Pixel reset restores current crop-derived dimensions. File-size mode starts from current crop detail, never silently enlarges. Show the actual resulting KB prominently beside the encoded preview, with pixels below; omit raw bytes. Keep JPEG encoder settings and their plain-language explanation in a collapsed disclosure. Selected document sources and acceptance caveats still apply.

Export labels identify print sheet or ID photo. Print instructions retain whole-sheet actual-size/no-fit guidance. Correct geometry and bytes do not guarantee acceptance, which also depends on the subject, background and application route.

## Accessibility and responsive behavior

Keep 44px touch areas, visible focus, readable inactive guidance, no horizontal overflow at 320px, and English/Chinese parity. On phones the crop preview remains visible within the editor while tools scroll. Short landscape viewports use ordinary scrolling. The single-photo output also has a compact section-bounded sticky preview and size, before its controls; short viewports use a smaller pinned preview. Source changes, resize and language changes must not reset values or steal focus.

Portugal head guides retain their distinct VFS UK source; print dimensions retain the U.S. checklist source. Preserve short document names, child eligibility qualifiers, scoped location notes, Schengen/national distinctions and collapsed source disclosures.

## File-size-only compression

Until the user explicitly edits output pixels, compression starts from the same available crop dimensions as best quality, without country-specific digital upload bounds. Do not silently upscale to physical-preset 600-ppi dimensions. If that maximum-quality JPEG already fits the cap, retain its pixels, quality and exact bytes. Recompute default dimensions after framing changes; preserve explicit pixel overrides until requirements or the source photo change. Keep generic input validation and the existing explicit-upscale warning.

## Compact editor and sheet controls

At wide desktop widths, put the crop preview and tool tabs/controls in adjacent columns inside the editor. Keep a bounded preview, compact spacing, short instructions and two-column tonal sliders; retain 44px targets, keyboard access, restriction notices and the phone sticky-preview behavior. Narrow layouts stack the same components in document order.

Make the copy number itself editable beside the sheet preview, followed by the localized dynamic sentence stating how many copies a 4×6-inch photo fits at maximum. Default to maximum until the user edits the count; retain/clamp explicit counts across size changes. Remove Use maximum and the separate top copy-count block. Put cutting-guide controls beside the preview and keep their detailed explanation disclosed. Count validation and print geometry remain unchanged.

Offer head-placement guides for every preset, including full-photo online routes. Only custom requirements hide the control. Keep verified centered head-height ranges where available; otherwise show adjustable manual crown/chin reference lines plus a center line, with a clear note that the preset has no verified range. Manual crown stays above chin. Keep guide controls outside the crop-only controls so full-photo mode can use them. These overlays never enter the JPEG or change framing.

Top-of-page mockups demonstrate both outputs without controls. Output radio choices include miniature versions. Single-photo output places a compact preview and measured size before its quality/compression controls in DOM order. The preview sticks within the output section while settings scroll; photo and metadata share a row on phones and desktop. Preserve the last encoded result while updating, label it explicitly as previous, and disable export until valid. Keep native controls and disclosure behavior.

The header uses a native checkbox switch styled as an English / 中文 pill, with both language labels always visible. The intro has a title and local-processing/reset note without a subtitle. The top single-photo example reads Make photo ID-ready and lists cropping, editing, compression; it has no JPEG badge. Output labels remain Single photo / Printable sheet.

Section 1 is Photo Dimensions Requirements. A keyboard-accessible two-tab switch defaults to Pick by document (country/document, sourced dimensions). Custom dimensions exposes only editable framing/ratio fields for single output or physical dimensions/units for sheets. Custom is not a country. Country/document selection survives switching to custom and back; current photo edits retain existing review safeguards.

Full custom compression combines a synchronized quality slider/number input (1–100) and two compact, editable, linked pixel inputs. The other side is labeled calculated after either is edited. Reset restores automatic crop-derived dimensions without changing quality or the inactive Auto KB value.

Digital-only presets and their validation module are removed. Printed document choices remain for crop proportions/physical printing. In Custom show the linked crop ratio and editable width/height inputs; remove the basis selector and Change crop ratio link. Preserve the chosen edge when editing the crop ratio. Document selection must not silently replace the user’s KB limit.


The close-up viewer uses a native full-screen dialog and the full-resolution encoded export blob. Clear Close, Fit, actual-pixel 100%, zoom buttons/readout and a neutral image stage support quality inspection. Preserve native focus trapping/Escape, explicitly restore opener focus in Safari, and provide keyboard panning alongside pinch/drag. Controls are at least 44px, wrap on small screens, honor safe-area insets and reduced motion, and release blob URLs when closed or invalidated.


Output has one static 4. Customize output heading above the mode selector, with no mode-specific subtitle. Printable sheet is selected initially. Step 5 is a sibling region with its own heading and download/share controls. The preview canvas alone opens the close-up viewer, by pointer or keyboard; no separate Inspect button. Compact two-column radio choices and linked numeric fields keep 44px targets; repeated explanations live in Output guidance. Reserve preview space during initial encoding and keep focused controls below the sticky block.

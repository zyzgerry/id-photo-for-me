# ID Photo for Me interface

The app is a practical, private photo-printing workbench. Keep it calm and precise: cool neutral background, white work surfaces, navy text, restrained blue actions, and system fonts that render English and Chinese without external downloads.

Choose between Print sheet and Single JPEG using a labeled native radio group. Desktop uses two columns: mode, photo selection, and settings on the left; a larger editor with a compact result/export area underneath on the right. Copy count and cutting guides belong with the print settings. Keep the introduction compact and the photo/output visible. Print mode has physical dimensions and copy count; single mode has pixel dimensions and file-size constraints. Hide unrelated controls in each mode. Put detailed guidance, printing instructions, and minimum-pixel requirements in labeled disclosures.

Keep mode selection directly above the left-aligned photo picker. Put the plain-language privacy explanation below the introduction, before photo selection: photos stay on the device during editing, the website does not upload or store them, and the browser runs the editing tools. Keep supported formats and photo loading/error feedback with the picker; keep format limits collapsed until requested. The empty editor offers the same photo picker as a second starting point. At phone widths, use mode → photo selection → editor → output settings → result. Move the existing settings section when crossing the breakpoint so DOM, screen-reader, and keyboard order follow the visible phone layout without duplicating controls or resetting values.

On phones, choosing a photo moves to the editor. The preview remains visible within the editor while controls scroll. Framing and Adjustments use accessible tabs; fine position sliders are disclosed only when needed. Keep at least 44px hit areas, visible focus, safe-area padding, keyboard alternatives, and no horizontal overflow. Very short landscape viewports use ordinary scrolling to avoid a sticky preview taking over the screen.

The entire sheet is previewed using the same raster as the download. Cut guides are enabled by default and switchable: one-pixel dashed outlines on every placed photo edge (approximately 0.085 mm at fixed 300 ppi), plus small outer alignment ticks in unused paper. Draw shared edges once and cover the perimeter of partially filled rows. Do not add gutters, shrink photos, or draw thick borders. The copy picker shows capacity and supports Use maximum; fewer requested copies form a compact group with shared cut columns.

Single-JPEG mode keeps the full photo by default; the crop controls appear only after explicit cropping is selected. Initialize a longest edge up to 1200 pixels, preserve proportions, and show the actual encoded JPEG after compression. Display resulting pixel dimensions and bytes, including any automatic reduction. Keep file limits and optional minimum dimensions visible and actionable; never silently reduce below the user's minimum. Each mode retains its own framing/adjustments while photo clearing resets both. Print export always uses maximum JPEG quality and no byte limit.

UI/UX Pro Max informed the restrained Swiss-style direction, progressive disclosure, touch target sizes, and focus/scroll offsets. Its suggested marketing sections, remote fonts, and dark editor palette did not fit this local utility; the existing light workbench and system fonts are retained. The persistent preview is a task-specific design, with the skill's focus-not-obscured guidance applied to it.

Small sheet previews add screen-pixel dashed outlines on every copy, including outside and partial-row edges, because downscaling makes one-output-pixel raster lines disappear. These overlays follow the cutting-guide switch, resize with the sheet, and never enter the JPEG. Exported cut lines remain one output pixel with unchanged geometry.

Portugal offers optional 70–80% centered head/face-size references from the linked VFS Portugal UK photo guide. Keep that source distinct from the U.S. checklist that supplies the 35×45-mm dimensions; requirements depend on application location. Head references appear only in the editor, never in the JPEG.

Validation uses synthetic images. Personal exported sheets, their analysis, and screenshots containing personal photos remain outside Git.

## Document labels and source disclosure

Use short document names without embassy or application-location suffixes. Preserve useful eligibility qualifiers such as child age limits. Keep dimensions visible, and show a brief location-variation caveat for location-specific presets. Requirements & sources is collapsed initially and holds the full application scope, detailed photo guidance, linked authority, and check date. Preserve that scope when simplifying a label; it is evidence for the preset rather than part of the dropdown name. Use the same behavior in English and Chinese.

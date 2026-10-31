# ID Photo for Me interface

The app is a practical, private photo-printing workbench. Keep it calm and precise: cool neutral background, white work surfaces, navy text, restrained blue actions, and system fonts that render English and Chinese without external downloads.

Choose between Print sheet and Single JPEG using a labeled native radio group. Desktop retains three aligned regions: output settings, photo editing, and the resulting sheet/JPEG. Keep the introduction compact and the photo/output visible. Print mode has physical dimensions and copy count; single mode has pixel dimensions and file-size constraints. Hide unrelated controls in each mode. Put detailed guidance and minimum-pixel requirements in labeled disclosures.

On phones, choosing a photo moves to the editor. The preview remains visible within the editor while controls scroll. Framing and Adjustments use accessible tabs; fine position sliders are disclosed only when needed. Keep at least 44px hit areas, visible focus, safe-area padding, keyboard alternatives, and no horizontal overflow. Very short landscape viewports use ordinary scrolling to avoid a sticky preview taking over the screen.

The entire sheet is previewed using the same raster as the download. Cut guides are enabled by default and switchable: one-pixel dashed outlines on every placed photo edge (approximately 0.085 mm at fixed 300 ppi), plus small outer alignment ticks in unused paper. Draw shared edges once and cover the perimeter of partially filled rows. Do not add gutters, shrink photos, or draw thick borders. The copy picker shows capacity and supports Use maximum; fewer requested copies form a compact group with shared cut columns.

Single-JPEG mode keeps the full photo by default; the crop controls appear only after explicit cropping is selected. Initialize a longest edge up to 1200 pixels, preserve proportions, and show the actual encoded JPEG after compression. Display resulting pixel dimensions and bytes, including any automatic reduction. Keep file limits and optional minimum dimensions visible and actionable; never silently reduce below the user's minimum. Each mode retains its own framing/adjustments while photo clearing resets both. Print export always uses maximum JPEG quality and no byte limit.

UI/UX Pro Max informed the restrained Swiss-style direction, progressive disclosure, touch target sizes, and focus/scroll offsets. Its suggested marketing sections, remote fonts, and dark editor palette did not fit this local utility; the existing light workbench and system fonts are retained. The persistent preview is a task-specific design, with the skill's focus-not-obscured guidance applied to it.

Validation uses synthetic images. Personal exported sheets, their analysis, and screenshots containing personal photos remain outside Git.

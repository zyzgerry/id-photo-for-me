> Historical record: current behavior and inclusion decisions are in [Current photo requirements](current-photo-requirements.md).

# Independent review — photo requirements changes

What this change does: It replaces unclear country/document labels, removes 27 earlier choices, and adds Schengen choices beneath all 29 member countries. It keeps 97 choices across 77 countries/regions and uses the same catalog in both output modes.

Reviewed the uncommitted changes against `be2f3674fb0fb7552cf7b58be76ce2e48730405e`, including untracked catalog and research files. This review assumes a static browser app used by an individual preparing photos. No application or test source was changed.

## Must fix

1. **[P1] Netherlands still exports a sheet known to miss its print requirement.** [catalog-schengen.js:32](../src/catalog-schengen.js#L32), especially lines 35–37; connected paths: `src/app.js:332–338`, `src/geometry.js:1`, `index.html:57–61`.
   - **What this is:** The new Netherlands choice participates in the normal printable-sheet export.
   - **Problem:** I selected Netherlands, uploaded the synthetic orientation fixture, and obtained an enabled export on an 1800×1200 sheet. Its 400-dpi incompatibility note and location caveat were both invisible. The app produces fixed 300-ppi 4×6 output, while the [Dutch photo rules](https://www.netherlandsworldwide.nl/passport-id-card/photo-requirements) require at least 400 dpi. The [visa checklist](https://www.netherlandsworldwide.nl/visa-the-netherlands/checklist-schengen-visa-tourism) links Dutch photo guidance; the [linked page](https://www.netherlandsworldwide.nl/passport-id-card/getting-photo) expressly includes visa applicants.
   - **Fix:** Keep the Netherlands visa choice for framing, but visibly mark its sheet output unsupported and prevent that incompatible print export, or implement a compliant higher-resolution sheet. Add a behavioral regression covering the visible warning and actual export availability rather than merely asserting that the note contains “does not meet”.
   - **If we skip it:** A user can download a Netherlands visa sheet through the default flow without seeing that the app itself knows the output misses a stated requirement.

## Should fix

2. **[P2] Common choices hide known local exceptions instead of directing users to them.** [catalog-schengen.js:10](../src/catalog-schengen.js#L10), lines 10–20; connected visibility: `src/app.js:91–95`, `index.html:55–61`.
   - **What this is:** Most added choices have no `scope`, and all their qualification text is placed in a closed disclosure.
   - **Problem:** For Greece → “Schengen visa (common format)”, I confirmed visible 35×45 mm, with both the note and location warning hidden. A UK applicant can pick this generic choice rather than the retained UK-specific one and produce the wrong height: the [authorized UK GVCW instructions](https://uk-gr.gvcworld.eu/en/visa-info-tourism) explicitly require 35×40 mm. The newly added Bulgarian choice similarly hides its [professional-photo / no amateur-snapshot restriction](https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria/) behind the disclosure.
   - **Fix:** Give common choices a visible local-check notice and surface known exceptions beside the choice. For Greece, explicitly direct UK applicants to the UK option; for Bulgaria, show the professional-photo restriction before upload/export. The existing visible caveat mechanism can be reused; no new architecture is needed.
   - **If we skip it:** The clean-looking country/document picker can guide someone to a known incompatible local option even though a correct option exists elsewhere in the same menu. This is a confirmed UK-route conflict, not a claim that all Greek missions require 35×40.

3. **[P2] The propagated 45-mm height is not established for every receiving country by its displayed source.** [catalog-schengen.js:13](../src/catalog-schengen.js#L13), lines 13–20.
   - **What this is:** The same 35×45 geometry and a checked date are assigned to most Schengen members.
   - **Problem:** I independently opened the [linked Commission leaflet](https://home-affairs.ec.europa.eu/document/download/5bb16566-c8c2-4afb-b038-530f488cb72a_en?filename=icao_photograph_guidelines_en.pdf). It specifies width 35–40 mm and face proportions, but no photo height. The corroborating [EEAS page](https://www.eeas.europa.eu/kenya/travel-study_en) expressly addresses Kenyan applicants, provides 45×35 passport-size photos, and tells applicants to consult destination-country sites. This supports a common template, but does not independently establish each destination/mission's 45-mm height. The implementation report acknowledges this inference. The user's request to propagate coverage does not itself supply the missing authority evidence.
   - **Fix:** Keep all 29 countries represented, but attach appropriate destination or receiving-mission sources for numerical dimensions. Until corroborated, clearly distinguish the entry as an unverified framing template in the visible requirements UI, without implying that its full size was checked as a country requirement. Preserve the known Finland and local Greece exceptions.
   - **If we skip it:** The catalog cannot satisfy the earlier strict promise that every selectable country/document requirement is defensible from its evidence. This is an evidence gap, not proof that 35×45 is wrong for every propagated country.

4. **[P2] At least one removed route already has readable numerical evidence at its exact source.** [catalog-audit-2026-11-01.md:132](catalog-audit-2026-11-01.md#L132); related removal from `src/catalog-africa.js`.
   - **What this is:** The cleanup removes the Tokyo Mozambique visa choice and says its size could not be substantiated in the retrieved page.
   - **Problem:** The exact cited [Mozambique embassy page](https://embamoc.jp/visas), under “A. Required to All Applicants”, currently gives one photograph sized 3.5 cm ×4.5 cm, permits black-and-white or colour, and requests the applicant's name on the reverse. It also describes which residents can apply through Tokyo. This substantiates the earlier scoped 35×45 entry. Other deletions also merit recovery checks: [Bhutan MFA photo requirements](https://www.mfa.gov.bt/passport/photograph-requirements/) and the [Morocco official passport portal](https://www.passeport.ma/Home/PiecesAuMaroc?typePasseport=bio) have primary-domain indexed numerical specifications, though direct retrieval failed in this review. The [Paraguay PDF](https://www.mre.gov.py/san-pablo/index.php/download_file/view_inline/161) has readable “5x5” text for official/diplomatic passports; its unit and route should be checked before restoring it.
   - **Fix:** Restore the substantiated Mozambique route and record its evidence; recheck the other 26 removals with alternative official pages or complete extraction before calling the removal audit finished. Keep inaccessible entries explicitly pending, rather than treating access failure as missing authority evidence.
   - **If we skip it:** Valid, defensible choices remain absent and the report understates recoverable country coverage. I am not declaring all 27 removals wrong.

## Independent verdicts

- **Code behavior:** The registration, localization and geometry paths work in the tests I ran. However, the known Netherlands print incompatibility remains executable, so the change should not ship as-is.
- **Photo-requirement quality:** Not ready for the promised evidence-backed requirements catalog. All 29 Schengen members are represented, but coverage is not the same as independently supported numerical requirements for all receiving routes. Visible exception handling and source qualification need work.
- **The 27 removals:** Conservative temporary exclusion is reasonable when verification is blocked. It is not sufficient to conclude that all 27 lacked defensible evidence. At least Mozambique is recoverable from the exact cited live source now; further official corroboration exists for additional candidates.

## What I checked

- Read the actual tracked changes, the untracked Schengen catalog and reports, the surrounding catalog/UI/export code, and the changed tests. Compared the retained regional records semantically with HEAD: retained physical dimensions did not change; most changes were labels, removals, dates and source updates.
- Independently ran all **17 Node checks** and the build: passed.
- Independently ran all **8 catalog browser cases in Chromium and WebKit**: passed, including all 97 choices in both languages and offline export/layout checks.
- Added no tests or implementation changes. Performed separate read-only Chrome reproductions of Netherlands and generic Greece; both had hidden qualification text. Netherlands export was enabled on a 1800×1200 sheet.
- Independently checked primary sources for the shared Schengen guidance, Dutch visa/print requirements, Bulgaria, Finland's MFA-to-Police photo link, Greece's UK route, and recovery candidates. These tests validate runtime behavior and geometry, not acceptance by a government.

Verdict: fix 1–4 before publishing the catalog as evidence-backed requirements.

Not checked: a fresh primary-source audit of every retained historical note/head measurement, a second complete walk of all 73 IDPhoto4You menus, Firefox, real iPhones, physical prints, or actual consular acceptance. No performance or security regression was found in this static catalog change.


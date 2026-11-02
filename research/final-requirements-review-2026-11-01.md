# Independent final requirements review — November 1, 2026

What this change does: The final implementation narrows the catalog to 88 ordinary photo requirements across83 countries/regions, gives each of the29 Schengen members one source-backed choice, and changes printable sheets to600 PPI. Material country restrictions and a general receiving-authority caveat are now visible before opening the detailed sources.

Review scope: re-review of the four findings in [the first independent review](independent-review-2026-11-01.md), the [27-removal recheck](removal-recheck-2026-11-01.md), and the approved ordinary-tourist/visitor and passport-renewal scope. No application-location selector was added. This review made no implementation or test changes.

## Original findings

| Original finding | Final disposition |
|---|---|
| Netherlands300-PPI output did not meet its stated400-dpi requirement | **Resolved at the file-output level.** Actual download independently measured3600×2400 pixels, JFIF600ppi, correct600ppi filename. A visible native-crop resolution warning remains;600-PPI sampling is not a printer-quality or consular-acceptance certificate. |
| Known local exceptions hidden | **Resolved.** France, Bulgaria, Greece and Netherlands have visible material notices in both languages. Every country/document choice has a visible before-printing receiving-authority caveat. Greece has only the verified UK35×40mm choice; no competing generic35×45 default. |
|45-mm height propagated from a leaflet that did not specify it | **Resolved.** The generic generator is gone. Each country has its own numerical authority/operator source or a documented source chain. Finland remains36×47mm; Greece remains35×40mm for UK applications. Source accessibility limits and two cleaner citations are recorded below. |
| Valid Mozambique route removed along with other recoverable entries | **Resolved.**14 ordinary recoveries were imported from the independent recheck; Iceland is represented once in the Schengen catalog instead of duplicated. Specialty/obsolete and insufficiently established routes remain excluded rather than renamed as ordinary requirements. |

## Code verdict

No remaining confirmed blocking code defect found in the final changes reviewed.

- Sheet geometry uses600-PPI conversion and3600×2400 pixels while retaining the4×6-inch physical size. The caller explicitly passes600 to the JPEG encoder.
- Single-photo encoding still defaults to300-PPI metadata and preserves crop-native pixel detail. Increasing print density did not increase single-photo dimensions.
- Cutting-guide coordinates and line weight are scaled together; the previous physical line/dash weight is preserved.
- Source-resolution warning compares crop-native pixels with the600-PPI print target. It does not falsely claim that upsampling restores detail or block a deliberately accepted low-resolution print.
- Warning text updates on country/language changes, and hides for custom dimensions. No new dependency or network photo processing was introduced.

## Requirement evidence verdict

The previous unsubstantiated shared-height inference has been replaced by country/mission evidence. It is defensible to list each member with the documented route and the always-visible instruction to confirm the receiving authority. This is not proof that every mission worldwide accepts the same measurements.

The ordinary sources checked below support the selected numerical sizes. “Indexed” means readable primary-domain text was available despite direct retrieval failing. I did not reinterpret an unrelated national D-visa or EU-family-only photo paragraph as tourist evidence.

| Country | Selected size | Independent evidence check |
|---|---:|---|
| Austria | 35×45mm | [Selected source](https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa). MFA common supporting-document section states colour35×45mm; ordinary Schengen applications are covered. |
| Belgium | 35×45mm | [Selected source](https://rwanda.diplomatie.belgium.be/sites/default/files/2023-08/Tourisme.pdf). Kigali embassy tourist PDF explicitly35×45mm recentwhite photo with signed Schengen form. |
| Bulgaria | 35×45mm | [Selected source](https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria/). MFA ordinaryvisa documentation explicitly3.5×4.5cm and non-professional/amateur-photo restriction; warning preserved. |
| Croatia | 35×45mm | [Selected source](https://visa.vfsglobal.com/one-pager/croatia/uae/english/pdf/Tourist-Croatia-NEW-UPDATE-Sep-25.pdf). Authorized September 2025 UAE tourist checklist explicitly specifies 35×45mm with the application form. Source name and bilingual note match this route. |
| Czechia | 35×45mm | [Selected source](https://mzv.gov.cz/jnp/en/information_for_aliens/supporting_documents_overview/photo.html). Central visa photo page explicitly35×45mm and Schengen admissibility. |
| Denmark | 35×45mm | [Selected source](https://um.dk/pakistan/en/travel-and-residence/visa/document-checklists/). Pakistan short-stay checklist explicitly35mm×45mm; head30–36mm. Mission scope retained. |
| Estonia | 35×45mm | [Selected source](https://telaviv.mfa.ee/applying-visa/). TelAviv visa checklist explicitly35×45mm and printed/signedform. Mission scope retained. |
| Finland | 36×47mm | [Selected source](https://um.fi/visa-to-visit-finland). Current MFA visa instructions link Finnish Police photo rules;36×47mm physical format corroborated by Interior Ministry regulation. |
| France | 35×45mm | [Selected source](https://france-visas.gouv.fr/documents/d/france-visas/iso_iec_normes_photos_fr). Current ministryphoto sheet expressly35mm-wide45mm-high, head32–36mm, lightblue/lightgrey and whiteprohibited. |
| Germany | 35×45mm | [Selected source](https://uk.diplo.de/uk-en/02/visa/visa-faq-2442852). UK missions visa FAQ explicitly photo-quality paper35×45mm and noolderthan3months. Scope retained. |
| Greece | 35×40mm | [Selected source](https://uk-gr.gvcworld.eu/en/visa-info-tourism). Authorized UK tourist page expressly3.5×4cm; visible UK-only size notice retained. |
| Hungary | 35×45mm | [Selected source](https://tajpej.mfa.gov.hu/en/schengen-visa). Taipei Schengen checklist states45×35mm passportphoto, fullface/lightbackground/max6months. |
| Iceland | 35×45mm | [Selected source](https://island.is/en/get-a-visa/supporting-documents). Directorate of Immigration supporting-documents page indexed text expressly35×45mm; ordinarytourism listed among travelpurposes. |
| Italy | 35×45mm | [Selected source](https://conshongkong.esteri.it/wp-content/uploads/2024/11/NEO-Checklist-TOURIST-With-Chinese-Translation-112024.pdf). HongKong/Macao tourist PDF expressly35×45mm, twophotos and printed/signedSchengenform. |
| Latvia | 35×45mm | [Selected source](https://www.usa.mfa.gov.lv/en/documents-required-applying-schengen-visa-travel-latvia). USA embassy checklist expressly35mm×45mm, recentcolourphoto/lightbackground. Scope retained. |
| Liechtenstein | 35×45mm | [Selected source](https://visa.vfsglobal.com/one-pager/switzerland/kazakhstan/english/pdf/1318-VFS-03-ENG-VIsitorWITHGE.pdf). SwissEmbassy/VFS Kazakhstan visitor PDF expressly covers Switzerland or Liechtenstein and3.5×4.5cm; ordinaryvisiting route. |
| Lithuania | 35×45mm | [Selected source](https://kr.mfa.lt/en/travel-and-residence/consular-issues/visas/100). Korea embassy page updated2026-07-20: Cvisa only, onecolour35×45mm/lightbackground/max6months. |
| Luxembourg | 35×45mm | [Selected source](https://bangkok.mae.lu/fr/service_citoyens.html). Bangkok page ordinaryshortstay andvisa photo sections expressly35×45mm, head29–34mm. |
| Malta | 35×45mm | [Selected source](https://www.vfsglobal.com/one-pager/malta/turkey/turkish/index.html). Authorized MaltaTurkey Turkishphoto section explicitly35mm width45mm height, colourpaperphoto, whitebackground/max6months. |
| Netherlands | 35×45mm | [Selected source](https://www.netherlandsworldwide.nl/visa-the-netherlands/checklist-schengen-visa-tourism). Dutch ordinarytourism checklist explicitly3.5×4.5cm; linked Dutch photo requirements include400dpi.600-PPI file and visible appointment/photo notice now address earlier failure. |
| Norway | 35×45mm | [Selected source](https://www.norway.no/contentassets/0860b5d1471141b3950793e4c531789e/visa-and-residence-permits/nov2022-checklist---egy-and-libya-06-11-2022.pdf). Egypt/Libya visitorchecklist explicitly35×45mm, within6months, white, glued to visaform. Scope retained. |
| Poland | 35×45mm | [Selected source](https://www.gov.pl/web/vietnam/c-type-schengen-visa). The ordinary C-type page explicitly gives 3.5×4.5cm, colour, white background, quality paper and less than six months. |
| Portugal | 35×45mm | [Selected source](https://www.vfsglobal.com/one-pager/portugal/usa/english/pdf/portugal-short-stay-c-visa-apr-2022.pdf). VFS PortugalUSA ordinarytourist checklist expressly35mm×45mm; no borrowed UK headrange retained. |
| Romania | 35×45mm | [Selected source](https://eviza.mae.ro/SupportingDocuments). eViza shortstay/typeC section expressly35×45mm; longstay3×4cm sections were not substituted. |
| Slovakia | 35×45mm | [Selected source](https://blsslovakiavisa.com/belarus/assets/pdf/checklists/Checklist_for_Tourism_or_Treatment_Visa.pdf). Exact BLS Belarus Tourism/TreatmentPDF primary-domain indexed extraction expressly35×45mm coloured/lightbackground andface70–80%; directfetch timeout noted. |
| Slovenia | 35×45mm | [Selected source](https://visa.vfsglobal.com/one-pager/Slovenia/russia/english/index.html). AuthorizedVFS Russia shortstay documentation expressly35×45mm, colour/lightbackground/no staples. |
| Spain | 35×45mm | [Selected source](https://turkey.blsspainvisa.com/istanbul/assets/pdf/english/tourist-checklist.pdf). Istanbul BLS TypeC tourist checklist expressly two35×45mm recent photos; oneattached toform. |
| Sweden | 35×45mm | [Selected source](https://www.swedenabroad.se/en/about-sweden-non-swedish-citizens/iceland/going-to-sweden/visiting-sweden/tourist-visa/). Iceland embassy tourist page expressly two35×45mm fullfacecolourphotos/lightbackground. |
| Switzerland | 35×45mm | [Selected source](https://visa.vfsglobal.com/one-pager/switzerland/kazakhstan/english/pdf/1318-VFS-03-ENG-VIsitorWITHGE.pdf). Same SwissEmbassy/VFS visitorPDF as Liechtenstein:3.5×4.5cm whitecolourphoto/max6months. |

## Citation cleanups verified

Both corrections are now verified on disk in `src/catalog-schengen.js` and `research/current-photo-requirements.md`. Neither remains outstanding.

- **Poland:** the selected URL is the directly linked [ordinary C-Type Schengen Visa page](https://www.gov.pl/web/vietnam/c-type-schengen-visa), replacing the general page's EU-family subsection as numerical proof.
- **Croatia:** the selected URL is the [September 2025 UAE tourist checklist](https://visa.vfsglobal.com/one-pager/croatia/uae/english/pdf/Tourist-Croatia-NEW-UPDATE-Sep-25.pdf), with matching UAE source name and bilingual note. The [current UAE operator page](https://visa.vfsglobal.com/one-pager/croatia/uae/english/) supplies provider context. The inaccessible old UK print URL and mixed central C/D page are no longer the selected evidence.

## Independent runtime checks

- All **18 Node checks passed** on final source, including88-record geometry/identity/translations and29-membercoverage, ordinary-scope exclusions,600-PPI metadata and outputmath.
- Read the new `tests/browser/print-requirements.spec.js` and connected code. The main agent is running the complete Chrome/WebKit suite separately; I did not write into its test-results directory or claim that full-suite result.
- Separate independent Chrome run on the current local build downloaded an actual sheet and read its encoded dimensions and JFIF bytes: **3600×2400;600ppi;600ppi filename**.
- The same run switched to singlephoto: **1000×1000 native pixels;300ppi metadata**. This confirms that printdensity did not propagate into native singlephoto sizing.
- In both English and Chinese, NL/GR/FR/BG notices plus the global receiving-authority caveat were visible with source disclosure closed. At320px there was no horizontal overflow.
- The print caller, guide scaling, warningthreshold and default JPEGdensity callsites were traced. No application/test implementation edits were made by this review.

**Final independent verdict: approved. No remaining confirmed blocking implementation or requirement-evidence finding in the reviewed changes.** Both citation fixes are verified. The main agent's full Chrome/WebKit suite remains pending separately; this approval reflects the review and independent checks described above, not an unreported whole-suite result or a government acceptance guarantee.

Not checked: actualiPhone memory/printing/share behavior, Firefox, physicalprints, printerhardware output, or realconsular acceptance. Primarysites can restrict automatedfetches; Slovakia's exact numeric rule was checked via indexed primarytext. Croatia's old direct-fetch limitation was resolved by selecting the verified ordinary-tourist source above.


## Post-review validation — implementation agent

The main-agent checks are now complete: all 18 Node checks and build passed; all 126 Chromium/WebKit cases have passing results across the full run (123 passed) and focused reruns (12 passed, three repeats per browser of the affected guide/resize checks). The guide assertion was corrected for custom mode, and a five-second resize-test timeout was aligned with the existing 15-second export allowance after normal JPEG completion was observed roughly 40 ms past the old deadline. No application code changed after independent approval. Details are in [Current photo requirements](current-photo-requirements.md). No publication performed.

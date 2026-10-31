# Digital photo routes — checked 2026-10-31

Research targets were China, United States, United Kingdom, Canada and Schengen visa applications. Only specific routes supported by the sources below are presets. These are file preparation tools, not biometric or acceptance checks. All files remain local.

| Route | Decision | Source |
|---|---|---|
| US DS-160 / DS-1648 visa | Square JPEG, 600–1200 per side, ≤240 KB, compression ≤20:1. Default 600 square. Enforce pixel/encoded byte bounds and uncompressed 24-bit RGB size / JPEG size ≤20. No enhancement of appearance. | [State Department technical rules](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html), [visa photo guidance](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html) |
| China visa, Kuala Lumpur | JPEG, 354×472 to 420×560, 40–120 KB. Default 420×560; digital ratio 3:4 differs from the 33×48-mm print. Scope the route to the centre publishing the source. Face/eye placement remains a manual source check. | [CVASC Kuala Lumpur / MFA diagram](https://bio.visaforchina.cn/KUL3_EN/upload/20231123/4b89d0c364d44f778f85d6fd76d93475.pdf) |
| UK passport, online own-device photo | At least 600×750, 50 KB–10 MB. Preserve full head/shoulders/upper-body image; application does cropping. Disable crop and tonal edits. Default width 1200, proportional height after decoding. | [GOV.UK digital photo rules](https://www.gov.uk/photos-for-passports) |
| Canada passport online renewal | Exclude editable preset: original commercial-photographer file, unaltered; technical rules differ from print. Show this restriction and link directly to IRCC. Other routes require their own portal instructions/custom input. | [IRCC passport photos, online renewals](https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html) |
| Schengen visa | No universal digital pixel/byte preset established. France guidance describes physical-photo width and biometric composition, not shared upload bounds. Show custom-entry guidance rather than deriving digital pixels from print millimetres. | [France-Visas FAQ](https://www.france-visas.gouv.fr/en/faq), [photo guide](https://france-visas.gouv.fr/documents/d/france-visas/iso_iec_fv_visa_photograph_requirements_en) |

China centres publish conflicting bounds: [Manchester](https://www.visaforchina.cn/MAN3_EN/qianzhengyewu/jichuzhishi/changjianwenti/164185152103256105.html) says no greater than 354×472, while the Kuala Lumpur diagram gives a range. Do not generalize the scoped preset.

Minimum byte size is checked after encoding. If real image detail cannot satisfy it at the allowed dimensions/quality, block export with a meaningful error rather than add artificial bytes. Custom mode does not make a compliance claim. Existing 4096-pixel working/output bounds remain.

## General ID preparation follow-up

The ID preparation mode now reuses sourced physical photo formats as framing presets and also offers the explicit online routes above. The Schengen group reuses the Portugal U.S. 35×45-mm route and its scoped sources; it does not invent shared online pixels/bytes. Canada exposes its existing printed visa format. Online constraints are enforced in Compress output size; Preserve best quality produces a maximum-quality master copy with available crop detail, which may exceed upload limits.

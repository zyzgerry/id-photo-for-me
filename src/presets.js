import { ASIA_PRESETS } from './catalog-asia.js';
import { AMERICAS_PRESETS } from './catalog-americas.js';
import { AFRICA_PRESETS } from './catalog-africa.js';
import { EUROPE_PRESETS } from './catalog-europe.js';
import { EUROPE_EXTRA_PRESETS } from './catalog-europe-extra.js';
import { PARTNER_PRESETS } from './catalog-visa-partners.js';

export const VERIFIED = '2026-10-30';
export const PRESETS = [
  { id: 'us-passport', country: 'us', document: 'passport', widthMm: 50.8, heightMm: 50.8,
    source: 'https://travel.state.gov/en/passports/apply/help/photos.html',
    sourceName: 'U.S. Department of State', note: 'usPassportNote', head: [0.5, 0.6875], restrictEdits: true },
  { id: 'us-visa', country: 'us', document: 'visa', widthMm: 50.8, heightMm: 50.8,
    source: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html',
    sourceName: 'U.S. Department of State', note: 'usVisaNote', head: [0.5, 0.6875], restrictEdits: true },
  { id: 'pt-schengen', country: 'pt', document: 'schengen', widthMm: 35, heightMm: 45,
    scope: {en:'Schengen short-stay visa — U.S. application',zh:'申根短期签证 — 在美国申请'},
    source: 'https://www.vfsglobal.com/one-pager/portugal/usa/english/pdf/portugal-short-stay-c-visa-apr-2022.pdf',
    sourceName: 'VFS Portugal, U.S. short-stay checklist (2022)', note: 'ptNote', head: [0.7, 0.8],
    headSource: 'https://www.vfsglobal.com/one-pager/portugal/uk/english/pdf/tech-req-for-photos.pdf', restrictEdits: false },
  ...EUROPE_PRESETS, ...EUROPE_EXTRA_PRESETS, ...PARTNER_PRESETS, ...ASIA_PRESETS, ...AMERICAS_PRESETS, ...AFRICA_PRESETS,
];

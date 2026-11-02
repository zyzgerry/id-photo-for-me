import { ASIA_PRESETS } from './catalog-asia.js';
import { AMERICAS_PRESETS } from './catalog-americas.js';
import { AFRICA_PRESETS } from './catalog-africa.js';
import { EUROPE_PRESETS } from './catalog-europe.js';
import { EUROPE_EXTRA_PRESETS } from './catalog-europe-extra.js';
import { SCHENGEN_PRESETS } from './catalog-schengen.js';

export const VERIFIED = '2026-11-01';
export const PRESETS = [
  { id: 'us-passport', country: 'us', document: 'passport', widthMm: 50.8, heightMm: 50.8,
    source: 'https://travel.state.gov/en/passports/apply/help/photos.html',
    sourceName: 'U.S. Department of State', note: 'usPassportNote', head: [0.5, 0.6875], restrictEdits: true },
  { id: 'us-visa', country: 'us', document: 'visa', widthMm: 50.8, heightMm: 50.8,
    source: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html',
    sourceName: 'U.S. Department of State', note: 'usVisaNote', head: [0.5, 0.6875], restrictEdits: true },
  ...EUROPE_PRESETS, ...EUROPE_EXTRA_PRESETS, ...ASIA_PRESETS, ...AMERICAS_PRESETS, ...AFRICA_PRESETS,
  ...SCHENGEN_PRESETS,
];

// Both outputs use the same country/document requirements.
export const PREPARATION_PRESETS = PRESETS;

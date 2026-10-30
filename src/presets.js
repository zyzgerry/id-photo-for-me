export const VERIFIED = '2026-10-30';
export const PRESETS = [
  { id: 'us-passport', country: 'us', document: 'passport', widthMm: 50.8, heightMm: 50.8,
    source: 'https://travel.state.gov/en/passports/apply/help/photos.html',
    sourceName: 'U.S. Department of State', note: 'usPassportNote', head: [0.5, 0.6875], restrictEdits: true },
  { id: 'us-visa', country: 'us', document: 'visa', widthMm: 50.8, heightMm: 50.8,
    source: 'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html',
    sourceName: 'U.S. Department of State', note: 'usVisaNote', head: [0.5, 0.6875], restrictEdits: true },
  { id: 'pt-schengen', country: 'pt', document: 'schengen', widthMm: 35, heightMm: 45,
    source: 'https://www.vfsglobal.com/one-pager/portugal/usa/english/pdf/portugal-short-stay-c-visa-apr-2022.pdf',
    sourceName: 'VFS Portugal, U.S. short-stay checklist (2022)', note: 'ptNote', restrictEdits: false },
];

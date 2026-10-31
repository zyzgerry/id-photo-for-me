// Official printed-photo requirements; see research/europe-extra.md.
export const EUROPE_EXTRA_PRESETS = [
  {
    "id": "fi-passport",
    "country": "fi",
    "document": {"en":"Passport","zh":"护照"},
    "widthMm": 36,
    "heightMm": 47,
    "source": "https://poliisi.fi/documents/25235045/31329600/Passport-photograph-instructions-by-the-police-2020-EN-fixed.pdf",
    "sourceName": "Finnish Police",
    "note": {
      "en": "Paper photos are accepted when applying at a police service point; within 6 months, light uniform background (light grey recommended), no manipulation. Crown-to-chin 32–36 mm; above crown 4–6 mm, below chin 7–9 mm. Electronic server pixel dimensions are a separate rule.",
      "zh": "在警察服务点申请时可提交纸质照片；6个月内拍摄，均匀浅色背景（推荐浅灰），不得修改。头顶至下巴32–36毫米，头顶上方4–6毫米，下巴下方7–9毫米。电子照片服务器的像素尺寸另行规定。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "de-visa",
    "country": "de",
    "document": "schengenNational", scope: {"en":"Visa (German missions in the UK)","zh":"签证（德国驻英国使领馆）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://uk.diplo.de/uk-en/02/visa/visa-faq-2442852",
    "sourceName": "German Federal Foreign Office — UK missions",
    "note": {
      "en": "Visa photos must be printed on photo-quality paper, within 3 months; white or off-white background, neutral expression and eyes open. Do not submit copies/scans from identity documents. This is the UK visa route, not domestic German passport capture.",
      "zh": "签证照片须用优质相纸打印，3个月内拍摄；白色或近白背景，自然表情，睁眼。不得提交从身份证件复制或扫描的照片。适用于英国签证办理点，不适用于德国境内护照现场拍照。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "hu-visa",
    "country": "hu",
    "document": "schengen", scope: {"en":"Schengen visa (Taipei)","zh":"申根签证（台北）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://tajpej.mfa.gov.hu/en/schengen-visa",
    "sourceName": "Hungarian Trade Office in Taipei",
    "note": {
      "en": "One colour full-face passport photo, maximum 6 months old, against a light background. Taipei checklist; biometric fingerprint collection is a separate application requirement.",
      "zh": "一张6个月内的彩色正面证件照，浅色背景。适用台北清单；指纹采集是独立申请要求。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "sk-visa",
    "country": "sk",
    "document": "nationalVisa",
    "widthMm": 30,
    "heightMm": 35,
    "source": "https://www.mzv.sk/en/services/information-for-foreigners/national-visa",
    "sourceName": "Slovak Ministry of Foreign and European Affairs",
    "note": {
      "en": "Full-face colour photograph showing current appearance, conforming to ICAO standards; this national-visa checklist explicitly specifies 3 × 3.5 cm. Submit with the application at the diplomatic mission or applicable visa centre; fingerprints also required.",
      "zh": "正面彩色近期容貌照片，符合ICAO标准；本国家签证清单明确指定3×3.5厘米。在使领馆或适用签证中心随申请递交；另需采集指纹。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "lt-visa",
    "country": "lt",
    "document": "schengen", scope: {"en":"Schengen visa (Sovetsk)","zh":"申根签证（苏维埃茨克）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://consulate-sovetsk.mfa.lt/ru/glavnaya-konsulskaya-informatsiya/vizy/dokumenty-neobkhodimye-dlya-polucheniya-vizy/97",
    "sourceName": "Lithuanian Consulate in Sovetsk",
    "note": {
      "en": "One colour matte white-background photograph glued to the printed and signed application form. This consular checklist was updated in August 2025; eligibility restrictions still apply.",
      "zh": "一张彩色哑光白底照片，粘贴在打印并签名的申请表上。本领事清单于2025年8月更新；申请资格限制仍适用。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "lu-visa",
    "country": "lu",
    "document": "schengenNational", scope: {"en":"Visa (Bangkok)","zh":"签证（曼谷）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://bangkok.mae.lu/fr/service_citoyens.html",
    "sourceName": "Luxembourg Embassy in Bangkok",
    "note": {
      "en": "One colour photo within 6 months; plain cream, light blue or light grey background; do not glue or staple. Face centred, include upper shoulders; chin-to-crown 29–34 mm. Bangkok requirements.",
      "zh": "一张6个月内彩色照片；纯奶油色、浅蓝或浅灰背景；不要粘贴或订钉。面部居中，包含肩部上方；下巴至头顶29–34毫米。适用曼谷要求。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true,
    "head": [
      0.6444444444444445,
      0.7555555555555555
    ]
  },
  {
    "id": "ba-visa",
    "country": "ba",
    "document": {"en":"Tourist visa","zh":"旅游签证"}, scope: {"en":"Tourist visa (Copenhagen)","zh":"旅游签证（哥本哈根）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.embassybh.dk/konzularne-usluge/visa/",
    "sourceName": "Bosnia and Herzegovina Embassy in Copenhagen",
    "note": {
      "en": "Two biometric photos with the signed tourist-visa application; submit in person by appointment. The checklist specifies size but not background colour or recency; confirm these with this embassy.",
      "zh": "两张生物识别照片，随签名旅游签证表预约亲自提交。清单指定尺寸，但未注明背景颜色或拍摄时限；须向该使馆确认。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "rs-visa",
    "country": "rs",
    "document": {"en":"Visa","zh":"签证"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.mfa.rs/sites/default/files/inline-files/visaform_lat3.pdf",
    "sourceName": "Serbian Ministry of Foreign Affairs",
    "note": {
      "en": "Official paper visa form specifies a 3.5 × 4.5 cm photo. For the paper consular application; the ministry also offers electronic visas. Confirm background and recency with the receiving consulate.",
      "zh": "官方纸质签证表指定3.5×4.5厘米照片。适用于纸质领事申请；外交部也提供电子签证。背景和拍摄时限须向受理领馆确认。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "md-visa",
    "country": "md",
    "document": {"en":"Visa","zh":"签证"}, scope: {"en":"Visa (Embassy in India)","zh":"签证（驻印度使馆）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.india.mfa.gov.md/ro/content/tipurile-de-vizecerin%C8%9Be",
    "sourceName": "Moldovan Embassy in India",
    "note": {
      "en": "The embassy checklist asks for two colour 35 × 45 mm photos for visitor visas. This is the consular application; electronic-visa uploads have separate instructions. Confirm background and recency with the embassy.",
      "zh": "使馆访问签证清单要求两张35×45毫米彩色照片。适用于领事申请；电子签证上传有单独要求。背景和拍摄时限须向使馆确认。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "az-visa",
    "country": "az",
    "document": {"en":"Visa","zh":"签证"}, scope: {"en":"Visa (Embassy in Tokyo)","zh":"签证（驻东京使馆）"},
    "widthMm": 30,
    "heightMm": 40,
    "source": "https://tokyo.mfa.gov.az/az/content/36/visa-issues",
    "sourceName": "Azerbaijani Embassy in Tokyo",
    "note": {
      "en": "The ordinary embassy visa checklist requires a white-background 3 × 4 cm photo glued to the printed application. This printed consular route is separate from ASAN eVisa; nationality-based visa exemptions may apply.",
      "zh": "普通使馆签证清单要求一张白底3×4厘米照片，粘贴在打印的申请表上。该纸质领事流程不同于ASAN电子签证；部分国籍可免签。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "si-visa",
    "country": "si",
    "document": "nationalVisa", scope: {"en":"National visa (Zagreb)","zh":"国家签证（萨格勒布）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.gov.si/en/representations/embassy-zagreb/visa-information-of-the-embassy-zagreb/",
    "sourceName": "Slovenian Embassy in Zagreb",
    "note": {
      "en": "Type D visa application is submitted in person with an ICAO photo; embassy lists the portrait dimensions as 45 × 35 mm. This is the national-visa checklist; confirm any local paper/background instructions.",
      "zh": "D类签证需亲自递交并附ICAO照片；使馆将纵向照片尺寸列为45×35毫米。适用于国家签证清单；请核对当地相纸和背景要求。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "am-visa",
    "country": "am",
    "document": {"en":"Visa extension","zh":"签证延期"}, scope: {"en":"Visa extension (Yerevan)","zh":"签证延期（埃里温）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://migration.mia.gov.am/en/applying-for-the-extension-of-ra-entry-visa",
    "sourceName": "Armenian Migration and Citizenship Service",
    "note": {
      "en": "One colour 35 × 45 mm photo for an entry-visa extension, submitted in person or by an authorized representative at the Migration and Citizenship Service. This is not the initial eVisa upload standard.",
      "zh": "入境签证延期需一张35×45毫米彩色照片，在移民与公民服务机构亲自或由授权代表递交。本规格不适用于首次电子签证上传。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  }
,
  {
    "id": "mx-visa",
    "country": "mx",
    "document": {"en":"Visa","zh":"签证"}, scope: {"en":"Visa (Embassy in Baku)","zh":"签证（驻巴库使馆）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://embamex.sre.gob.mx/azerbaiyan/index.php/foreign-nationals",
    "sourceName": "Mexican Embassy in Azerbaijan",
    "note": {
      "en": "One white-background 35 × 45 mm photograph affixed to the printed, signed application form. This prepares the required paper photo; facial/iris/fingerprint capture at the consular appointment remains mandatory under Mexican visa rules.",
      "zh": "一张35×45毫米白底照片，贴在打印并签名的申请表上。本工具准备所需纸质照片；根据墨西哥签证规定，领事预约仍需现场采集面部、虹膜及指纹。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "be-visa",
    "country": "be",
    "document": {"en":"National Visa (D, study)","zh":"国家签证（D类，留学）"}, scope: {"en":"Student visa (Helsinki)","zh":"学生签证（赫尔辛基）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://finland.diplomatie.belgium.be/sites/default/files/2024-07/Student%20Visa_0.pdf",
    "sourceName": "Belgian Embassy in Helsinki",
    "note": {
      "en": "Two recent colour prints, light uniform background; write your name on the back. For D student visas at Belgian public higher-education institutions in the Helsinki checklist. Paper photos supplement any required biometric appointment and live-photo capture.",
      "zh": "两张近期彩色纸质照片，均匀浅色背景；背面注明姓名。适用于赫尔辛基清单中比利时公立高等教育机构的D类学生签证。纸质照片不能免除所需生物识别预约和现场拍照。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  },
  {
    "id": "is-visa",
    "country": "is",
    "document": "schengen", scope: {"en":"Visa (Embassy in London)","zh":"签证（驻伦敦使馆）"},
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.mfa.is/library/01-Ministries/Ministry-for-Foreign-Affairs/Consular-services/Tourism%20Business%20VFF%20-%20Checklist%20-%20LON%20-%2014.22.pdf",
    "sourceName": "Icelandic Embassy in London",
    "note": {
      "en": "One passport photograph, white background, maximum 6 months old, submitted with the printed and signed visa application. London tourism/business/family checklist. Paper photographs supplement any required appointment biometrics or live-photo capture.",
      "zh": "一张6个月内白底证件照，随打印并签名的签证申请提交。适用于伦敦旅游、商务或探亲访友清单。纸质照片不能免除预约时所需的生物识别采集或现场拍照。"
    },
    "checked": "2026-10-31",
    "restrictEdits": true
  }

];


// Membership: European Commission, FAQs linked from "Applying for a Schengen visa".
export const SCHENGEN_COUNTRIES = [
  'at','be','bg','hr','cz','dk','ee','fi','fr','de','gr','hu','is','it','lv',
  'li','lt','lu','mt','nl','no','pl','pt','ro','sk','si','es','se','ch',
];

// Each country uses its own numerical authority or authorized-operator source.
export const SCHENGEN_PRESETS = [
  {
    "id": "at-visa",
    "country": "at",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa",
    "sourceName": "Austria Federal Ministry for European and International Affairs",
    "note": {
      "en": "Colour ICAO-format photo, 35×45 mm, for a consular visa application. Follow the receiving consulate’s detailed photo and document checklist.",
      "zh": "领事签证申请须使用35×45毫米彩色ICAO规格照片。请遵循受理领馆的详细照片和材料清单。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "be-schengen-common",
    "country": "be",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://rwanda.diplomatie.belgium.be/sites/default/files/2023-08/Tourisme.pdf",
    "sourceName": "Belgian Embassy — tourist visa checklist",
    "note": {
      "en": "35×45 mm recent photo with a white background, submitted with the signed tourist-visa form. Source: Belgian Embassy in Kigali; confirm your receiving mission’s checklist.",
      "zh": "35×45毫米近期白底照片，随已签署的旅游签证表递交。依据比利时驻基加利使馆清单；请核对受理使领馆要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "bg-schengen-common",
    "country": "bg",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.mfa.bg/en/services-travel/consular-services/travel-bulgaria/visa-bulgaria/",
    "sourceName": "Bulgaria Ministry of Foreign Affairs — visa photo rules",
    "note": {
      "en": "35×45 mm framing. Bulgaria’s MFA requires professional-quality photographs and prohibits non-professional photos or crops from amateur snapshots. This tool cannot certify how a photo was taken. Follow your consulate’s photo and submission checklist.",
      "zh": "35×45毫米构图。保加利亚外交部要求专业照片，禁止非专业照片及从业余生活照中裁剪。工具无法认证拍摄方式。请遵循领馆照片及递交清单。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true,
    "warning": {
      "en": "Bulgaria requires professional photos; crops from amateur snapshots are not accepted.",
      "zh": "保加利亚要求专业照片，不接受从业余生活照中裁剪。"
    }
  },
  {
    "id": "hr-schengen-common",
    "country": "hr",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://visa.vfsglobal.com/one-pager/croatia/uae/english/pdf/Tourist-Croatia-NEW-UPDATE-Sep-25.pdf",
    "sourceName": "VFS Croatia — tourist visa checklist (2025)",
    "note": {
      "en": "One recent 35×45 mm biometric photo, bright background, glued to the form; a live photo is also captured at VFS. Source: Croatia tourist-visa checklist in the UAE (2025); confirm your receiving mission’s checklist.",
      "zh": "一张近期35×45毫米浅底生物识别照片，粘贴于表格；VFS另在现场拍照。依据克罗地亚驻阿联酋旅游签证清单（2025）；请核对受理使领馆要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "cz-visa",
    "country": "cz",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://mzv.gov.cz/jnp/en/information_for_aliens/supporting_documents_overview/photo.html",
    "sourceName": "Czech Ministry of Foreign Affairs",
    "note": {
      "en": "Visa photo: 35×45 mm, current likeness, full-face view and civil attire. Eye-to-chin distance must be at least 13 mm. No sunglasses or head covering except the stated medical/religious exceptions.",
      "zh": "签证照片：35×45毫米，反映当前外貌，正面照，穿日常服装。眼睛至下巴距离至少13毫米。除规定的医疗／宗教例外，不戴墨镜或头饰。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "dk-visa-pakistan",
    "country": "dk",
    "document": "schengen",
    "scope": {
      "en": "Short-stay visa — Pakistan application",
      "zh": "短期签证 — 在巴基斯坦申请"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://um.dk/pakistan/en/travel-and-residence/visa/document-checklists/",
    "sourceName": "Denmark Ministry of Foreign Affairs — Pakistan",
    "note": {
      "en": "One 35×45 mm passport photo for the Pakistan short-stay application checklist; head height from chin to top of head is 30–36 mm. Follow the receiving application centre’s current requirements.",
      "zh": "巴基斯坦短期签证申请清单要求一张35×45毫米证件照，下巴至头顶高度30–36毫米。请遵循受理申请中心的最新要求。"
    },
    "head": [
      0.6666666666666666,
      0.8
    ],
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "ee-visa-israel",
    "country": "ee",
    "document": "schengen",
    "scope": {
      "en": "Visa — Tel Aviv application",
      "zh": "签证 — 特拉维夫申请"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://telaviv.mfa.ee/applying-visa/",
    "sourceName": "Embassy of Estonia in Tel Aviv",
    "note": {
      "en": "One colour 35×45 mm photo taken within six months, submitted with the printed visa form through the Tel Aviv application centre. Other missions may accept different formats.",
      "zh": "一张六个月内拍摄的35×45毫米彩照，随纸质签证表格通过特拉维夫申请中心提交。其他使领馆可接受的规格可能不同。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "fi-schengen-common",
    "country": "fi",
    "document": "schengen",
    "widthMm": 36,
    "heightMm": 47,
    "source": "https://um.fi/visa-to-visit-finland",
    "sourceName": "Finland Ministry for Foreign Affairs — visa photo guidance",
    "note": {
      "en": "Finland’s visa guidance directs applicants to the Finnish Police photo instructions: 36×47 mm, recent colour photo on a plain light background. Follow the receiving mission’s checklist. This is Finland’s format, rather than the common 35×45 mm template.",
      "zh": "芬兰签证指南要求遵循芬兰警方照片说明：36×47毫米、近期彩照、纯浅色背景。请遵循受理使领馆清单。采用芬兰规格，而非通用35×45毫米模板。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "fr-visa-libreville",
    "country": "fr",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://france-visas.gouv.fr/documents/d/france-visas/iso_iec_normes_photos_fr",
    "sourceName": "France-Visas / French Ministries of Interior and Foreign Affairs",
    "note": {
      "en": "35×45 mm colour photo. Chin to crown, excluding hair: 32–36 mm. Plain light blue or light grey background; white is prohibited. Follow your application checklist for the number of prints and biometric appointment.",
      "zh": "35×45毫米彩照。下巴至头顶（不含头发）32–36毫米。纯浅蓝或浅灰背景，禁止白底。照片张数及生物信息采集请遵循申请清单。"
    },
    "head": [
      0.7111111111111111,
      0.8
    ],
    "checked": "2026-11-01",
    "restrictEdits": true,
    "warning": {
      "en": "France: use a light blue or light grey background. White is not accepted.",
      "zh": "法国：请用浅蓝或浅灰背景，不接受白底。"
    }
  },
  {
    "id": "de-visa",
    "country": "de",
    "document": "schengen",
    "scope": {
      "en": "Visa (German missions in the UK)",
      "zh": "签证（德国驻英国使领馆）"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://uk.diplo.de/uk-en/02/visa/visa-faq-2442852",
    "sourceName": "German Federal Foreign Office — UK missions",
    "note": {
      "en": "Visa photos must be printed on photo-quality paper, within 3 months; white or off-white background, neutral expression and eyes open. Do not submit copies/scans from identity documents. This is the UK visa route, not domestic German passport capture.",
      "zh": "签证照片须用优质相纸打印，3个月内拍摄；白色或近白背景，自然表情，睁眼。不得提交从身份证件复制或扫描的照片。适用于英国签证办理点，不适用于德国境内护照现场拍照。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "gr-visa-uk",
    "country": "gr",
    "document": {
      "en": "Schengen visa (UK applications)",
      "zh": "申根签证（英国申请）"
    },
    "scope": {
      "en": "Tourist visa — GVCW United Kingdom",
      "zh": "旅游签证 — 英国GVCW中心"
    },
    "widthMm": 35,
    "heightMm": 40,
    "source": "https://uk-gr.gvcworld.eu/en/visa-info-tourism",
    "sourceName": "Global Visa Center World — authorized Greece visa centres in the UK",
    "note": {
      "en": "For Greece tourist-visa applications at UK GVCW centres: two colour prints within 6 months, white/off-white background, facing forward, forehead and ears visible, no smile. Normal photo paper, preferably not glossy. This operator specifies 35 × 40 mm. Prints are required in addition to appointment biometrics and do not replace live capture.",
      "zh": "适用于英国GVCW中心受理的希腊旅游签证：两张6个月内彩色纸质照片，白／近白底、正面、露额头和耳朵、不笑。使用普通相纸，最好非光面。该运营方规定35×40毫米。纸质照片是预约生物信息采集以外的材料，不能替代现场拍摄。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true,
    "warning": {
      "en": "35×40 mm is the verified UK application format. Confirm dimensions if applying elsewhere.",
      "zh": "已核实的英国申请规格为35×40毫米；在其他地点申请请核对尺寸。"
    }
  },
  {
    "id": "hu-visa",
    "country": "hu",
    "document": "schengen",
    "scope": {
      "en": "Schengen visa (Taipei)",
      "zh": "申根签证（台北）"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://tajpej.mfa.gov.hu/en/schengen-visa",
    "sourceName": "Hungarian Trade Office in Taipei",
    "note": {
      "en": "One colour full-face passport photo, maximum 6 months old, against a light background. Taipei checklist; biometric fingerprint collection is a separate application requirement.",
      "zh": "一张6个月内的彩色正面证件照，浅色背景。适用台北清单；指纹采集是独立申请要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "is-schengen-common",
    "country": "is",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://island.is/en/get-a-visa/supporting-documents",
    "sourceName": "Iceland Directorate of Immigration — Schengen visa documents",
    "note": {
      "en": "35×45 mm passport photo, submitted with the Schengen visa application documents. Follow the receiving embassy or application centre’s current checklist.",
      "zh": "申根签证材料需35×45毫米证件照。请遵循受理使馆或申请中心的当前清单。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "it-visa-hong-kong",
    "country": "it",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://conshongkong.esteri.it/wp-content/uploads/2024/11/NEO-Checklist-TOURIST-With-Chinese-Translation-112024.pdf",
    "sourceName": {
      "en": "Italian Consulate-General in Hong Kong",
      "zh": "意大利驻香港总领事馆"
    },
    "note": {
      "en": "Tourist visa checklist for Hong Kong / Macao: two recent 35×45 mm photographs, not older than six months, submitted with the printed and signed application.",
      "zh": "香港／澳门旅游签证清单：两张六个月内拍摄的 35×45 毫米照片，随打印并签名的申请表提交。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "lv-visa-us",
    "country": "lv",
    "document": "schengen",
    "scope": {
      "en": "Schengen visa — U.S. application",
      "zh": "申根签证 — 在美国申请"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.usa.mfa.gov.lv/en/documents-required-applying-schengen-visa-travel-latvia",
    "sourceName": "Embassy of Latvia to the United States",
    "note": {
      "en": "One colour 35×45 mm photo, not older than six months, light background and entire face visible. This is the U.S. embassy’s printed Schengen application checklist; confirm local requirements.",
      "zh": "一张六个月内拍摄的35×45毫米彩照，浅色背景，完整露出面部。本预设对应驻美国使馆的纸质申根申请清单，请核对当地要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "li-schengen-common",
    "country": "li",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://visa.vfsglobal.com/one-pager/switzerland/kazakhstan/english/pdf/1318-VFS-03-ENG-VIsitorWITHGE.pdf",
    "sourceName": "Swiss Embassy / VFS — Switzerland or Liechtenstein visitor visa",
    "note": {
      "en": "35×45 mm colour photo, white background, within six months. The Swiss Embassy’s Kazakhstan visitor checklist explicitly covers Switzerland and Liechtenstein. Confirm local print counts and appointment requirements.",
      "zh": "35×45毫米、六个月内白底彩照。瑞士驻哈萨克斯坦使馆访问签证清单明确适用于瑞士及列支敦士登；请核对当地照片张数及预约要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "lt-schengen-common",
    "country": "lt",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://kr.mfa.lt/en/travel-and-residence/consular-issues/visas/100",
    "sourceName": "Lithuanian Embassy in Korea — Schengen visa guidance",
    "note": {
      "en": "35×45 mm colour photo, light background, within six months. Source: Lithuanian Embassy in Korea’s Schengen checklist; confirm your receiving mission’s instructions.",
      "zh": "35×45毫米六个月内彩照、浅色背景。依据立陶宛驻韩国使馆申根清单；请核对受理使领馆要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "lu-visa",
    "country": "lu",
    "document": "schengen",
    "scope": {
      "en": "Visa (Bangkok)",
      "zh": "签证（曼谷）"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://bangkok.mae.lu/fr/service_citoyens.html",
    "sourceName": "Luxembourg Embassy in Bangkok",
    "note": {
      "en": "One colour photo within 6 months; plain cream, light blue or light grey background; do not glue or staple. Face centred, include upper shoulders; chin-to-crown 29–34 mm. Bangkok requirements.",
      "zh": "一张6个月内彩色照片；纯奶油色、浅蓝或浅灰背景；不要粘贴或订钉。面部居中，包含肩部上方；下巴至头顶29–34毫米。适用曼谷要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true,
    "head": [
      0.6444444444444445,
      0.7555555555555555
    ]
  },
  {
    "id": "mt-schengen-common",
    "country": "mt",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.vfsglobal.com/one-pager/malta/turkey/turkish/index.html",
    "sourceName": "VFS Malta — tourist visa photo specifications",
    "note": {
      "en": "35 mm wide ×45 mm high colour print, white background, taken within six months. Source: Malta tourist-visa application centres in Turkey; confirm local instructions.",
      "zh": "宽35毫米、高45毫米的六个月内白底彩色纸质照片。依据马耳他驻土耳其旅游签证申请中心说明；请核对当地要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "nl-schengen-common",
    "country": "nl",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.netherlandsworldwide.nl/visa-the-netherlands/checklist-schengen-visa-tourism",
    "sourceName": "NetherlandsWorldwide — Schengen visa checklist",
    "note": {
      "en": "35×45 mm. Dutch photo rules require at least 400 dpi for prints and have their own face measurements. A 600-PPI file provides image sampling density, not a guarantee of printer quality or acceptance. Application centres may take a digital photo at the appointment; follow your current checklist.",
      "zh": "35×45毫米。荷兰照片规范要求纸质照片至少400 dpi，并有独立的面部尺寸要求。600 PPI文件提供图像像素密度，不保证打印质量或获接纳。申请中心可能在预约时拍摄数字照片；请遵循当前清单。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true,
    "warning": {
      "en": "Your application centre may take the photo at the appointment. Check whether a printed photo is needed.",
      "zh": "申请中心可能在预约时拍照。请先核对是否需要纸质照片。"
    }
  },
  {
    "id": "no-visa-egypt-libya",
    "country": "no",
    "document": "schengen",
    "scope": {
      "en": "Visitor visa — Egypt / Libya checklist",
      "zh": "访问签证 — 埃及／利比亚清单"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.norway.no/contentassets/0860b5d1471141b3950793e4c531789e/visa-and-residence-permits/nov2022-checklist---egy-and-libya-06-11-2022.pdf",
    "sourceName": "Royal Norwegian Embassy — Egypt and Libya checklist",
    "note": {
      "en": "One white-background 35×45 mm photo, not older than six months, glued to the visa form. This is the published Egypt/Libya visitor-visa checklist; confirm the receiving centre’s latest process.",
      "zh": "一张六个月内拍摄的35×45毫米白底照片，粘贴在签证表格上。本预设依据公布的埃及／利比亚访问签证清单，请核对受理中心的最新流程。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "pl-schengen-common",
    "country": "pl",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.gov.pl/web/vietnam/c-type-schengen-visa",
    "sourceName": "Polish Ministry of Foreign Affairs — visa application guidance",
    "note": {
      "en": "35×45 mm colour photo, white background, quality paper, taken within six months. Source: Polish Embassy in Vietnam’s ordinary C-visa checklist; confirm your receiving mission’s instructions.",
      "zh": "35×45毫米六个月内白底彩照，使用优质相纸。依据波兰驻越南使馆普通C类签证清单；请核对受理使领馆说明。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "pt-schengen",
    "country": "pt",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "scope": {
      "en": "Schengen short-stay visa — U.S. application",
      "zh": "申根短期签证 — 在美国申请"
    },
    "source": "https://www.vfsglobal.com/one-pager/portugal/usa/english/pdf/portugal-short-stay-c-visa-apr-2022.pdf",
    "sourceName": "VFS Portugal, U.S. short-stay checklist (2022)",
    "note": "ptNote",
    "restrictEdits": false,
    "checked": "2026-11-01"
  },
  {
    "id": "ro-schengen",
    "country": "ro",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://eviza.mae.ro/SupportingDocuments",
    "sourceName": "Romania Ministry of Foreign Affairs — eViza",
    "note": {
      "en": "Uniform type C visa: a 35×45 mm photo not older than six months, with head occupying 70–80%. The face may also be captured digitally at interview; confirm whether a printed photo is required at your appointment.",
      "zh": "统一C类签证：35×45毫米照片，六个月内拍摄，头部占70–80%。面谈时也可能现场采集数字照片，请确认预约地点是否需要纸质照片。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "sk-schengen-common",
    "country": "sk",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://blsslovakiavisa.com/belarus/assets/pdf/checklists/Checklist_for_Tourism_or_Treatment_Visa.pdf",
    "sourceName": "BLS Slovakia — tourist visa checklist",
    "note": {
      "en": "35×45 mm colour photo, light background, within six months; face occupies 70–80%. Source: Slovakia tourist-visa checklist in Belarus; confirm your receiving mission’s instructions.",
      "zh": "35×45毫米六个月内浅底彩照，面部占70–80%。依据斯洛伐克驻白俄罗斯旅游签证清单；请核对受理使领馆说明。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "si-schengen-common",
    "country": "si",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://visa.vfsglobal.com/one-pager/Slovenia/russia/english/index.html",
    "sourceName": "VFS Slovenia — short-stay visa photo specifications",
    "note": {
      "en": "35×45 mm recent colour photograph on a light background, neutral expression and no staples. Source: Slovenia visa application centres in Russia; confirm the receiving mission’s checklist.",
      "zh": "35×45毫米近期浅底彩照、自然表情，不订钉。依据斯洛文尼亚驻俄罗斯签证申请中心说明；请核对受理使领馆清单。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "es-schengen-common",
    "country": "es",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://turkey.blsspainvisa.com/istanbul/assets/pdf/english/tourist-checklist.pdf",
    "sourceName": "BLS Spain — tourist visa checklist",
    "note": {
      "en": "35×45 mm recent photo, without glasses or accessories. Source: Spain tourist-visa checklist for Istanbul; confirm your receiving consulate’s current photo requirements.",
      "zh": "35×45毫米近期照片，不戴眼镜或饰品。依据西班牙驻伊斯坦布尔旅游签证清单；请核对受理领馆当前照片要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "se-visa-iceland",
    "country": "se",
    "document": "schengen",
    "scope": {
      "en": "Tourist visa — Iceland application",
      "zh": "旅游签证 — 在冰岛申请"
    },
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://www.swedenabroad.se/en/about-sweden-non-swedish-citizens/iceland/going-to-sweden/visiting-sweden/tourist-visa/",
    "sourceName": "Sweden Abroad — Embassy in Iceland",
    "note": {
      "en": "Two recent colour 35×45 mm photos showing the full face against an evenly lit light background. This is the embassy’s tourist-visa checklist in Iceland, not Swedish passport photo capture.",
      "zh": "两张近期35×45毫米彩照，完整露出面部，浅色背景且光线均匀。本预设对应驻冰岛使馆的旅游签证清单，不用于瑞典护照现场拍照。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  },
  {
    "id": "ch-schengen-common",
    "country": "ch",
    "document": "schengen",
    "widthMm": 35,
    "heightMm": 45,
    "source": "https://visa.vfsglobal.com/one-pager/switzerland/kazakhstan/english/pdf/1318-VFS-03-ENG-VIsitorWITHGE.pdf",
    "sourceName": "Swiss Embassy / VFS — Switzerland or Liechtenstein visitor visa",
    "note": {
      "en": "35×45 mm colour photo, white background, within six months. The Swiss Embassy’s Kazakhstan visitor checklist explicitly covers Switzerland and Liechtenstein. Confirm local print counts and appointment requirements.",
      "zh": "35×45毫米、六个月内白底彩照。瑞士驻哈萨克斯坦使馆访问签证清单明确适用于瑞士及列支敦士登；请核对当地照片张数及预约要求。"
    },
    "checked": "2026-11-01",
    "restrictEdits": true
  }
];

export const EUROPE_PRESETS = [
  {
    id:'gb-passport-paper',country:'gb',document: {"en":"Passport","zh":"护照"},widthMm:35,heightMm:45,
    source:'https://www.gov.uk/photos-for-passports/photo-requirements',sourceName:'HM Passport Office',
    note:{en:'Two identical photos taken within one month. Plain cream or light-grey background, professional-quality photo paper. Crown to chin 29–34 mm. Paper applications only; online applications need a digital photo.',zh:'两张一个月内拍摄的相同照片，纯奶油色或浅灰色背景，专业质量相纸。头顶至下巴29–34毫米。仅适用于纸质申请，在线申请须用数字照片。'},
    head:[29/45,34/45],checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'ie-visa',country:'ie',document:'visa',widthMm:35,heightMm:45,
    source:'https://www.irishimmigration.ie/photograph-rules-for-visa-applications/',sourceName:'Ireland Immigration Service Delivery',
    note:{en:'Two identical colour photos under six months old, white or light-grey background, photographic paper with white unglazed reverse. This 35×45 mm size is within the permitted 35–38 mm width and 45–50 mm height range. Write name and visa reference on the back.',zh:'两张相同的六个月内彩照，白色或浅灰色背景，背面白色无光的相纸。35×45毫米在允许的宽35–38毫米、高45–50毫米范围内。背面填写姓名和签证申请编号。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'at-visa',country:'at',document:"schengenNational",widthMm:35,heightMm:45,
    source:'https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa',sourceName:'Austria Federal Ministry for European and International Affairs',
    note:{en:'Colour ICAO-format photo, 35×45 mm, for a consular visa application. Follow the receiving consulate’s detailed photo and document checklist.',zh:'领事签证申请须使用35×45毫米彩色ICAO规格照片。请遵循受理领馆的详细照片和材料清单。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'it-visa-hong-kong',country:'it',document: "schengen", scope: {"en":"Tourist visa — Hong Kong / Macao","zh":"旅游签证 — 香港／澳门申请"},widthMm:35,heightMm:45,
    source:'https://conshongkong.esteri.it/wp-content/uploads/2024/11/NEO-Checklist-TOURIST-With-Chinese-Translation-112024.pdf',sourceName:'Italian Consulate-General in Hong Kong',
    note:{en:'Tourist-visa checklist for Hong Kong/Macao: two recent 35×45 mm photographs, not older than six months, submitted with the printed and signed application. Confirm the consulate’s current photo-quality and background instructions.',zh:'香港／澳门旅游签证清单：两张六个月内拍摄的35×45毫米照片，随已打印并签名的申请表提交。请核对领馆最新的照片质量和背景要求。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'cz-visa',country:'cz',document:"schengenNational",widthMm:35,heightMm:45,
    source:'https://mzv.gov.cz/jnp/en/information_for_aliens/supporting_documents_overview/photo.html',sourceName:'Czech Ministry of Foreign Affairs',
    note:{en:'Visa photo: 35×45 mm, current likeness, full-face view and civil attire. Eye-to-chin distance must be at least 13 mm. No sunglasses or head covering except the stated medical/religious exceptions.',zh:'签证照片：35×45毫米，反映当前外貌，正面照，穿日常服装。眼睛至下巴距离至少13毫米。除规定的医疗／宗教例外，不戴墨镜或头饰。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'pl-passport-paper',country:'pl',document: {"en":"Passport","zh":"护照"},widthMm:35,heightMm:45,
    source:'https://www.gov.pl/web/gov/zdjecie-do-dowodu-lub-paszportu',sourceName:'Government of Poland',
    note:{en:'Colour 35×45 mm photo on paper for an office application, taken within six months. Show the whole head and upper shoulders, with a natural expression and closed mouth; face occupies 70–80% of the photograph. Digital applications have separate pixel rules.',zh:'现场申请用35×45毫米纸质彩照，六个月内拍摄。完整显示头部及肩部上方，表情自然、闭嘴，面部占照片70–80%。数字申请另有像素要求。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'dk-visa-pakistan',country:'dk',document: "schengen", scope: {"en":"Short-stay visa — Pakistan application","zh":"短期签证 — 在巴基斯坦申请"},widthMm:35,heightMm:45,
    source:'https://um.dk/pakistan/en/travel-and-residence/visa/document-checklists/',sourceName:'Denmark Ministry of Foreign Affairs — Pakistan',
    note:{en:'One 35×45 mm passport photo for the Pakistan short-stay application checklist; head height from chin to top of head is 30–36 mm. Follow the receiving application centre’s current requirements.',zh:'巴基斯坦短期签证申请清单要求一张35×45毫米证件照，下巴至头顶高度30–36毫米。请遵循受理申请中心的最新要求。'},
    head:[30/45,36/45],checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'lv-visa-us',country:'lv',document: "schengen", scope: {"en":"Schengen visa — U.S. application","zh":"申根签证 — 在美国申请"},widthMm:35,heightMm:45,
    source:'https://www.usa.mfa.gov.lv/en/documents-required-applying-schengen-visa-travel-latvia',sourceName:'Embassy of Latvia to the United States',
    note:{en:'One colour 35×45 mm photo, not older than six months, light background and entire face visible. This is the U.S. embassy’s printed Schengen application checklist; confirm local requirements.',zh:'一张六个月内拍摄的35×45毫米彩照，浅色背景，完整露出面部。本预设对应驻美国使馆的纸质申根申请清单，请核对当地要求。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'hr-visa-d',country:'hr',document: "nationalVisa",widthMm:35,heightMm:45,
    source:'https://mvep.gov.hr/services-consular-portal/consular-information-22802/visas-22807/issuance-procedure/applying-for-long-stay-visa-d-and-supporting-documents/259933',sourceName:'Croatia Ministry of Foreign and European Affairs',
    note:{en:'The long-stay visa D document list calls for one colour 35×45 mm photograph meeting ICAO standards. This preset covers that visa route, not Croatian passport capture.',zh:'长期D类签证材料清单要求一张符合ICAO标准的35×45毫米彩照。本预设用于该签证流程，不用于克罗地亚护照现场采集。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'ee-visa-israel',country:'ee',document: "schengenNational", scope: {"en":"Visa — Tel Aviv application","zh":"签证 — 特拉维夫申请"},widthMm:35,heightMm:45,
    source:'https://telaviv.mfa.ee/applying-visa/',sourceName:'Embassy of Estonia in Tel Aviv',
    note:{en:'One colour 35×45 mm photo taken within six months, submitted with the printed visa form through the Tel Aviv application centre. Other missions may accept different formats.',zh:'一张六个月内拍摄的35×45毫米彩照，随纸质签证表格通过特拉维夫申请中心提交。其他使领馆可接受的规格可能不同。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'no-visa-egypt-libya',country:'no',document: "schengen", scope: {"en":"Visitor visa — Egypt / Libya checklist","zh":"访问签证 — 埃及／利比亚清单"},widthMm:35,heightMm:45,
    source:'https://www.norway.no/contentassets/0860b5d1471141b3950793e4c531789e/visa-and-residence-permits/nov2022-checklist---egy-and-libya-06-11-2022.pdf',sourceName:'Royal Norwegian Embassy — Egypt and Libya checklist',
    note:{en:'One white-background 35×45 mm photo, not older than six months, glued to the visa form. This is the published Egypt/Libya visitor-visa checklist; confirm the receiving centre’s latest process.',zh:'一张六个月内拍摄的35×45毫米白底照片，粘贴在签证表格上。本预设依据公布的埃及／利比亚访问签证清单，请核对受理中心的最新流程。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'se-visa-iceland',country:'se',document: "schengen", scope: {"en":"Tourist visa — Iceland application","zh":"旅游签证 — 在冰岛申请"},widthMm:35,heightMm:45,
    source:'https://www.swedenabroad.se/en/about-sweden-non-swedish-citizens/iceland/going-to-sweden/visiting-sweden/tourist-visa/',sourceName:'Sweden Abroad — Embassy in Iceland',
    note:{en:'Two recent colour 35×45 mm photos showing the full face against an evenly lit light background. This is the embassy’s tourist-visa checklist in Iceland, not Swedish passport photo capture.',zh:'两张近期35×45毫米彩照，完整露出面部，浅色背景且光线均匀。本预设对应驻冰岛使馆的旅游签证清单，不用于瑞典护照现场拍照。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'ch-visa-marriage-madagascar',country:'ch',document: {"en":"National Visa (D, marriage)","zh":"国家签证（D类，结婚）"}, scope: {"en":"Marriage visa D — Madagascar application","zh":"结婚D类签证 — 在马达加斯加申请"},widthMm:35,heightMm:45,
    source:'https://www.schweiz-madagaskar.eda.admin.ch/dam/de/eda-cms/GuVOqux9O6nr/Memento-prep-mar-en-Suisse-visa-mars-2025-DE.pdf',sourceName:'Swiss Embassy in Antananarivo — March 2025 checklist',
    note:{en:'Two recent 35×45 mm passport photos for the embassy’s long-stay marriage visa application; face occupies 70–80% of the image. Confirm current instructions with the Swiss representation handling your application.',zh:'该使馆的长期结婚签证申请要求两张近期35×45毫米证件照，面部占画面70–80%。请向受理申请的瑞士使领馆核对最新要求。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'ro-schengen',country:'ro',document:'schengen',widthMm:35,heightMm:45,
    source:'https://eviza.mae.ro/SupportingDocuments',sourceName:'Romania Ministry of Foreign Affairs — eViza',
    note:{en:'Uniform type C visa: a 35×45 mm photo not older than six months, with head occupying 70–80%. The face may also be captured digitally at interview; confirm whether a printed photo is required at your appointment.',zh:'统一C类签证：35×45毫米照片，六个月内拍摄，头部占70–80%。面谈时也可能现场采集数字照片，请确认预约地点是否需要纸质照片。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'ua-visa',country:'ua',document:'visa',widthMm:35,heightMm:45,
    source:'https://mfa.gov.ua/en/consular-affairs/entry-and-stay-foreigners-ukraine/visa-information',sourceName:'Ukraine Ministry of Foreign Affairs',
    note:{en:'Consular visa application: one 35×45 mm applicant photo with the printed and signed application form. This is not an e-Visa upload preset. Follow the mission’s current photo and application instructions.',zh:'领事签证申请：一张35×45毫米申请人照片，随已打印并签名的申请表提交。本预设不是电子签证上传规格，请遵循使领馆最新照片和申请要求。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'ru-visa-ireland',country:'ru',document: {"en":"Visa","zh":"签证"}, scope: {"en":"Visa — Ireland consular application","zh":"签证 — 在爱尔兰领事申请"},widthMm:35,heightMm:45,
    source:'https://dublin.kdmid.ru/en/consular-functions/visas/applying-for-a-visa/',sourceName:'Russian Embassy Consular Section in Ireland',
    note:{en:'One 3.5×4.5 cm passport-size photograph glued to the printed application form. This covers the embassy’s paper visa route; digital e-Visa photo rules are separate.',zh:'一张3.5×4.5厘米证件照，粘贴在纸质申请表上。本预设对应使馆纸质签证流程，电子签证另有数字照片要求。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'by-visa-private-uae',country:'by',document: {"en":"Private visa","zh":"私人访问签证"}, scope: {"en":"Private visa — UAE application centre","zh":"私人访问签证 — 阿联酋申请中心"},widthMm:35,heightMm:45,
    source:'https://www.vfsglobal.com/Belarus/UAE/pdf/Private-Visa-checklist-Ver-1-1.pdf',sourceName:'Belarus Visa Application Centre — UAE private-visa checklist',
    note:{en:'One colour 35×45 mm photo, light background, high resolution, no folds or ink, within six months; face takes 70–80%. Applies to the published UAE private-visa application checklist.',zh:'一张六个月内拍摄的35×45毫米彩照，浅色背景、高清，无折痕或墨迹，面部占70–80%。适用于公布的阿联酋私人访问签证申请清单。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'me-visa',country:'me',document:'visa',widthMm:35,heightMm:45,
    source:'https://www.gov.me/en/article/visas',sourceName:'Government of Montenegro',
    note:{en:'Short-stay and long-stay visa document lists require one colour photo sized 35×45 mm. Follow the diplomatic mission’s detailed checklist for your visa category.',zh:'短期及长期签证材料清单要求一张35×45毫米彩照。请遵循受理使领馆针对具体签证类别的详细清单。'},
    checked:'2026-10-31',restrictEdits:true
  },
  {
    id:'cy-visa-st-petersburg',country:'cy',document: {"en":"Visa","zh":"签证"}, scope: {"en":"Visa — St Petersburg consulate","zh":"签证 — 圣彼得堡领馆"},widthMm:35,heightMm:45,
    source:'https://www.mfa.gov.cy/mfa/consulate/consulate_spb.nsf/all/29BD74FDF0E110ED4325895700263A8B/%24file/VISA%20PHOTO%20REQUIREMENTS.pdf?openelement=',sourceName:'Cyprus Consulate in St Petersburg — visa photo requirements',
    note:{en:'Two identical colour 35×45 mm photos, within six months; light-grey background suggested, neutral expression, closed mouth. The published diagram gives face height 32–36 mm. Requirements are consulate-specific.',zh:'两张相同的六个月内35×45毫米彩照，建议浅灰背景，表情自然、闭嘴。公布的图示要求面部高度32–36毫米。请按具体领馆要求申请。'},
    head:[32/45,36/45],checked:'2026-10-31',restrictEdits:true
  }
];

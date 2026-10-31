export const DIGITAL_PRESETS = [
  {id:'us-visa-digital',country:'us',document:{en:'Visa (DS-160 / DS-1648)',zh:'签证（DS-160／DS-1648）'},
    width:600,height:600,minWidth:600,minHeight:600,maxWidth:1200,maxHeight:1200,maxKB:240,minKB:0,maxCompression:20,fit:'crop',restrictEdits:true,
    source:'https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos/digital-image-requirements.html',sourceName:'U.S. Department of State',checked:'2026-10-31',
    note:{en:'Square JPEG, 600–1200 pixels per side, up to 240 KB; compression no greater than 20:1. Use a recent, unaltered color photo with a white background. Check head placement and the application instructions.',zh:'正方形 JPEG，单边 600–1200 像素，最多 240 KB，压缩比不超过 20:1。使用近期、未修饰外貌的彩色白底照片，并核对头部位置和申请说明。'}},
  {id:'cn-visa-kul-digital',country:'cn',document:{en:'Visa (Kuala Lumpur online application)',zh:'签证（吉隆坡在线申请）'},
    width:420,height:560,minWidth:354,minHeight:472,maxWidth:420,maxHeight:560,maxKB:120,minKB:40,fit:'crop',restrictEdits:true,
    scope:{en:'China visa — Kuala Lumpur application centre. Other centres may publish different upload limits.',zh:'中国签证 — 吉隆坡签证申请中心。其他申请点的上传限制可能不同。'},
    source:'https://bio.visaforchina.cn/KUL3_EN/upload/20231123/4b89d0c364d44f778f85d6fd76d93475.pdf',sourceName:'Chinese Visa Application Service Centre, Kuala Lumpur',checked:'2026-10-31',
    note:{en:'Digital JPEG: 354×472 to 420×560 pixels, 40–120 KB. Use a recent white-background photo; check the source diagrams for face and eye placement. Digital proportions differ from the 33×48-mm print.',zh:'电子 JPEG：354×472 至 420×560 像素，40–120 KB。使用近期白底照片；脸部与眼睛位置请核对来源示意图。电子照片比例与 33×48 毫米纸质照片不同。'}},
  {id:'gb-passport-digital',country:'gb',document:{en:'Passport (online, own-device photo)',zh:'护照（在线申请，自行拍摄）'},
    width:1200,height:1500,minWidth:600,minHeight:750,maxWidth:4096,maxHeight:4096,maxKB:10000,minKB:50,fit:'original',restrictEdits:true,noCrop:true,
    source:'https://www.gov.uk/photos-for-passports',sourceName:'GOV.UK',checked:'2026-10-31',
    note:{en:'At least 600×750 pixels and 50 KB–10 MB. Keep the full photo, including head, shoulders and upper body; GOV.UK crops it during the application. Do not alter the image. Use a photo taken in the last month.',zh:'至少 600×750 像素，50 KB–10 MB。保留包含头部、肩膀与上半身的完整照片，由申请网站裁剪。请勿修饰照片；照片须在最近一个月内拍摄。'}},
];

export const DIGITAL_UNAVAILABLE = {
  ca:{source:'https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html',sourceName:'IRCC',checked:'2026-10-31',note:{en:'No editable digital preset is offered. Online passport renewal requires an unaltered original from a commercial photographer. Use that file directly. For other routes, enter the requirements from your application portal.',zh:'此处不提供可编辑的电子预设。在线护照续签要求商业摄影师提供未经修改的原始文件，请直接使用该文件。其他申请请按实际网站要求自定义。'}},
  schengen:{source:'https://www.france-visas.gouv.fr/en/faq',sourceName:'France-Visas',checked:'2026-10-31',note:{en:'No shared Schengen digital-upload standard was verified. Printed-photo dimensions do not establish upload pixels or file limits. Use custom requirements from your specific country, application centre and portal.',zh:'尚未核实统一的申根电子上传标准。纸质尺寸不能确定上传像素或文件限制。请按具体国家、申请中心和网站要求自定义。'}},
};

export function checkDigitalOutput(preset, {width,height,blob}) {
  if(!preset) return;
  const minimum=Math.max(preset.minKB*1000,preset.maxCompression?width*height*3/preset.maxCompression:0);
  if(width<preset.minWidth||height<preset.minHeight||width>preset.maxWidth||height>preset.maxHeight||blob.size<minimum||blob.size>preset.maxKB*1000) throw new Error('digitalConstraintsError');
}

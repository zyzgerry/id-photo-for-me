> Historical record: current behavior and inclusion decisions are in [Current photo requirements](current-photo-requirements.md).

# Country/document catalog audit
Reviewed November 1, 2026. Local implementation; not published.

## Decision
72 selectable requirements across 70 countries/regions, down from 99 across 95. Removed the additional preparation-only Schengen country alias. Both outputs now use the same catalog. Custom dimensions remain available.

Every retained size has an authority or authorized operator source. This is a physical-photo requirements catalog, not upload compliance or an acceptance certificate. Notes describe paper, appearance and submission constraints; measurements do not certify studio provenance or biometric acceptance. Review date means source research, not a promise of freshness. A blocked URL is not evidence that a requirement is wrong.

## Naming changes
- France: replace “Schengen Visa (scientific)” and the Libreville-specific note with “Visa” and the ministry-wide photo sheet. The ministry sheet supports the photo standard, but does not establish a universal print count.
- Show application scope in the document choice itself: e.g. “Tourist visa — Hong Kong / Macao”. Users no longer have to open the sources disclosure to discover the location restriction.
- Paper-only passport routes say “Passport (paper application)”.
- Remove the duplicate “Schengen” pseudo-country, which merely copied Portugal's U.S. route.
- Remove Portugal's head range borrowed from a different application location; retain the directly supported 35×45 mm size.
- Update Peru to the working government service URL; scope Slovakia to the corroborating Cairo embassy source.
- Preserve age and specialist categories where the authority actually distinguishes them. Removing a qualifier without broader evidence would make the label less defensible.

## Verdicts against IDPhoto4You
[Comparison site](https://www.idphoto4you.com/), all 73 country/group menus inspected without uploading an image. Full observed menu is in [the snapshot](idphoto4you-menu-2026-11-01.json). Country counts include two non-country groups; there are 71 named countries/regions. The table below compares offerings, not just matching dimensions.

| Issue | IDPhoto4You | Verdict and evidence |
|---|---|---|
| China visa | 2×2 inches | Our 33×48 mm is supported for Sydney; their square choice conflicts with [the authorized centre's numerical instructions](https://bio.visaforchina.cn/SYD4_EN/qianzhengyewu/jichuzhishi/changjianwenti/552371235904950309.html). Their China passport size is a different document and is not disputed here. |
| Estonia visa | 36×47 mm | Our Tel Aviv route explicitly requires 35×45 mm. Their generic visa label is wrong for this route: [embassy](https://telaviv.mfa.ee/applying-visa/). Do not infer passport requirements from this. |
| Greece visa | combined Passport/Visa 40×60 mm | Wrong for the UK tourist route: authorized [GVCW](https://uk-gr.gvcworld.eu/en/visa-info-tourism) explicitly requires 35×40 mm. Passport and visa cannot share this blanket label. |
| Japan visa | 45×45 mm | Location-dependent. Serbia's [2025 diagram](https://www.yu.emb-japan.go.jp/visa/Documents_List_2025/Standards_Application_Form_Photos_2025.pdf) requires 35×45 mm; [Mumbai](https://www.mumbai.in.emb-japan.go.jp/en/visa/photo.html) specifies 45×45 mm. Both can be right for different missions; their unqualified choice is misleading. |
| Canada PR card | 35×45 mm | IDPhoto4You is wrong against [IRCC's current 50×70 mm specification](https://www.canada.ca/en/immigration-refugees-citizenship/services/permanent-residents/card/photos.html). We do not offer this route. Our temporary resident visa 35×45 mm is separately supported by [IRCC visa requirements](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/temporary-resident-visa-application-photograph-specifications.html). |
| Zimbabwe passport | 2×2 inches | Our Ottawa route has explicit 35×45 mm support: [embassy](https://www.zimembassyottawa.com/passport-services). Their square option is wrong for that route; no verdict on every Zimbabwe application. |
| Australia | Passport 35×45 mm | Both sizes are defensible: [Passport Office](https://www.passports.gov.au/PhotoGuidelines) allows width 35–40 and height 45–50 mm. 35×45 is one accepted choice, not the only permitted size. |
| France background | Homepage suggests white “if possible” | Unsafe as a general default: [France-Visas photo sheet](https://france-visas.gouv.fr/documents/d/france-visas/iso_iec_normes_photos_fr) prohibits white, specifies light blue/light grey and 35×45 mm. Our retained France note is right on this point. |
| Other passport-versus-visa differences | Often passport only | Neither wins by size alone. A passport template is not evidence for a visa template, even when dimensions match. See complete coverage comparison below. |

No blanket endorsement of either catalog. Confirmed contradictions above are distinguished from missing coverage and unverified entries. Removed entries below are not declared factually false merely because research access failed.

## Every original entry: disposition and linked source
Retained entries use their source's numerical size or a value within its permitted range. The existing regional research remains historical background; this table supersedes its inclusion decisions. For retained paper sizes, the check is numerical geometry and route scope; detailed acceptance depends on the receiving authority's full checklist.

| Country | Original ID | Final document / decision | mm (W×H) | Evidence / rationale |
|---|---|---|---:|---|
| United States | us-passport | Passport | 50.8×50.8 | [Authority/authorized source](https://travel.state.gov/en/passports/apply/help/photos.html). Retained: numerical size and document/application scope supported. |
| United States | us-visa | Visa (printed photo) | 50.8×50.8 | [Authority/authorized source](https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html). Retained: numerical size and document/application scope supported. |
| Portugal | pt-schengen | Schengen visa — apply in the U.S. | 35×45 | [Authority/authorized source](https://www.vfsglobal.com/one-pager/portugal/usa/english/pdf/portugal-short-stay-c-visa-apr-2022.pdf). Retained: numerical size and document/application scope supported. |
| United Kingdom | gb-passport-paper | Passport (paper application) | 35×45 | [Authority/authorized source](https://www.gov.uk/photos-for-passports/photo-requirements). Retained: numerical size and document/application scope supported. |
| Ireland | ie-visa | Visa (printed photo) | 35×45 | [Authority/authorized source](https://www.irishimmigration.ie/photograph-rules-for-visa-applications/). Retained: numerical size and document/application scope supported. |
| Austria | at-visa | Schengen / National Visa | 35×45 | [Authority/authorized source](https://www.bmeia.gv.at/en/travel-stay/entrance-and-residence-in-austria/visa). Retained: numerical size and document/application scope supported. |
| Italy | it-visa-hong-kong | Tourist visa — Hong Kong / Macao | 35×45 | [Authority/authorized source](https://conshongkong.esteri.it/wp-content/uploads/2024/11/NEO-Checklist-TOURIST-With-Chinese-Translation-112024.pdf). Retained: numerical size and document/application scope supported. |
| Czechia | cz-visa | Schengen / National Visa | 35×45 | [Authority/authorized source](https://mzv.gov.cz/jnp/en/information_for_aliens/supporting_documents_overview/photo.html). Retained: numerical size and document/application scope supported. |
| Poland | pl-passport-paper | Passport (paper application) | 35×45 | [Authority/authorized source](https://www.gov.pl/web/gov/zdjecie-do-dowodu-lub-paszportu). Retained: numerical size and document/application scope supported. |
| Denmark | dk-visa-pakistan | Short-stay visa — Pakistan application | 35×45 | [Authority/authorized source](https://um.dk/pakistan/en/travel-and-residence/visa/document-checklists/). Retained: numerical size and document/application scope supported. |
| Latvia | lv-visa-us | Schengen visa — U.S. application | 35×45 | [Authority/authorized source](https://www.usa.mfa.gov.lv/en/documents-required-applying-schengen-visa-travel-latvia). Retained: numerical size and document/application scope supported. |
| Croatia | hr-visa-d | National Visa (D) | 35×45 | [Authority/authorized source](https://mvep.gov.hr/services-consular-portal/consular-information-22802/visas-22807/issuance-procedure/applying-for-long-stay-visa-d-and-supporting-documents/259933). Retained: numerical size and document/application scope supported. |
| Estonia | ee-visa-israel | Visa — Tel Aviv application | 35×45 | [Authority/authorized source](https://telaviv.mfa.ee/applying-visa/). Retained: numerical size and document/application scope supported. |
| Norway | no-visa-egypt-libya | Visitor visa — Egypt / Libya checklist | 35×45 | [Authority/authorized source](https://www.norway.no/contentassets/0860b5d1471141b3950793e4c531789e/visa-and-residence-permits/nov2022-checklist---egy-and-libya-06-11-2022.pdf). Retained: numerical size and document/application scope supported. |
| Sweden | se-visa-iceland | Tourist visa — Iceland application | 35×45 | [Authority/authorized source](https://www.swedenabroad.se/en/about-sweden-non-swedish-citizens/iceland/going-to-sweden/visiting-sweden/tourist-visa/). Retained: numerical size and document/application scope supported. |
| Switzerland | ch-visa-marriage-madagascar | Marriage visa D — Madagascar application | 35×45 | [Authority/authorized source](https://www.schweiz-madagaskar.eda.admin.ch/dam/de/eda-cms/GuVOqux9O6nr/Memento-prep-mar-en-Suisse-visa-mars-2025-DE.pdf). Retained: numerical size and document/application scope supported. |
| Romania | ro-schengen | Schengen Visa | 35×45 | [Authority/authorized source](https://eviza.mae.ro/SupportingDocuments). Retained: numerical size and document/application scope supported. |
| Ukraine | ua-visa | Removed from selection | 35×45 | [Authority/authorized source](https://mfa.gov.ua/en/consular-affairs/entry-and-stay-foreigners-ukraine/visa-information). Removed pending corroboration: ministry returned HTTP 403. |
| Russia | ru-visa-ireland | Visa — Ireland consular application | 35×45 | [Authority/authorized source](https://dublin.kdmid.ru/en/consular-functions/visas/applying-for-a-visa/). Retained: numerical size and document/application scope supported. |
| Belarus | by-visa-private-uae | Private visa — UAE application centre | 35×45 | [Authority/authorized source](https://www.vfsglobal.com/Belarus/UAE/pdf/Private-Visa-checklist-Ver-1-1.pdf). Retained: numerical size and document/application scope supported. |
| Montenegro | me-visa | Visa (printed photo) | 35×45 | [Authority/authorized source](https://www.gov.me/en/article/visas). Retained: numerical size and document/application scope supported. |
| Cyprus | cy-visa-st-petersburg | Removed from selection | 35×45 | [Authority/authorized source](https://www.mfa.gov.cy/mfa/consulate/consulate_spb.nsf/all/29BD74FDF0E110ED4325895700263A8B/%24file/VISA%20PHOTO%20REQUIREMENTS.pdf?openelement=). Removed pending corroboration: consular PDF returned HTTP 500. |
| Finland | fi-passport | Passport (paper application) | 36×47 | [Authority/authorized source](https://poliisi.fi/documents/25235045/31329600/Passport-photograph-instructions-by-the-police-2020-EN-fixed.pdf). Retained: numerical size and document/application scope supported. |
| Germany | de-visa | Visa (German missions in the UK) | 35×45 | [Authority/authorized source](https://uk.diplo.de/uk-en/02/visa/visa-faq-2442852). Retained: numerical size and document/application scope supported. |
| Hungary | hu-visa | Schengen visa (Taipei) | 35×45 | [Authority/authorized source](https://tajpej.mfa.gov.hu/en/schengen-visa). Retained: numerical size and document/application scope supported. |
| Slovakia | sk-visa | National visa (D) — Cairo | 30×35 | [Authority/authorized source](https://www.mzv.sk/en/web/kahira-en/visa-and-services/national-visa). Retained: numerical size and document/application scope supported. |
| Lithuania | lt-visa | Removed from selection | 35×45 | [Authority/authorized source](https://consulate-sovetsk.mfa.lt/ru/glavnaya-konsulskaya-informatsiya/vizy/dokumenty-neobkhodimye-dlya-polucheniya-vizy/97). Historical Sovetsk consulate page supplies dimensions, but current operation/application availability was not established. Do not offer a historical mission route. |
| Luxembourg | lu-visa | Visa (Bangkok) | 35×45 | [Authority/authorized source](https://bangkok.mae.lu/fr/service_citoyens.html). Retained: numerical size and document/application scope supported. |
| Bosnia & Herzegovina | ba-visa | Tourist visa (Copenhagen) | 35×45 | [Authority/authorized source](https://www.embassybh.dk/konzularne-usluge/visa/). Retained: numerical size and document/application scope supported. |
| Serbia | rs-visa | Visa | 35×45 | [Authority/authorized source](https://www.mfa.rs/sites/default/files/inline-files/visaform_lat3.pdf). Retained: numerical size and document/application scope supported. |
| Moldova | md-visa | Removed from selection | 35×45 | [Authority/authorized source](https://www.india.mfa.gov.md/ro/content/tipurile-de-vizecerin%C8%9Be). Removed pending corroboration: ministry page timed out. |
| Azerbaijan | az-visa | Removed from selection | 30×40 | [Authority/authorized source](https://tokyo.mfa.gov.az/az/content/36/visa-issues). Removed pending corroboration: embassy returned HTTP 502. |
| Slovenia | si-visa | National visa (Zagreb) | 35×45 | [Authority/authorized source](https://www.gov.si/en/representations/embassy-zagreb/visa-information-of-the-embassy-zagreb/). Retained: numerical size and document/application scope supported. |
| Armenia | am-visa | Visa extension (Yerevan) | 35×45 | [Authority/authorized source](https://migration.mia.gov.am/en/applying-for-the-extension-of-ra-entry-visa). Retained: numerical size and document/application scope supported. |
| Mexico | mx-visa | Removed from selection | 35×45 | [Authority/authorized source](https://embamex.sre.gob.mx/azerbaiyan/index.php/foreign-nationals). Removed pending corroboration: embassy redirected to a bot-validation page. |
| Belgium | be-visa | Student visa (Helsinki) | 35×45 | [Authority/authorized source](https://finland.diplomatie.belgium.be/sites/default/files/2024-07/Student%20Visa_0.pdf). Retained: numerical size and document/application scope supported. |
| Iceland | is-visa | Removed from selection | 35×45 | [Authority/authorized source](https://www.mfa.is/library/01-Ministries/Ministry-for-Foreign-Affairs/Consular-services/Tourism%20Business%20VFF%20-%20Checklist%20-%20LON%20-%2014.22.pdf). Removed pending corroboration: PDF had only three extracted lines, without numerical photo dimensions. |
| France | fr-visa-libreville | Visa | 35×45 | [Authority/authorized source](https://france-visas.gouv.fr/documents/d/france-visas/iso_iec_normes_photos_fr). Retained: numerical size and document/application scope supported. |
| Greece | gr-visa-uk | Tourist visa — GVCW United Kingdom | 35×40 | [Authority/authorized source](https://uk-gr.gvcworld.eu/en/visa-info-tourism). Retained: numerical size and document/application scope supported. |
| China | cn-visa | Visa — Sydney application centre | 33×48 | [Authority/authorized source](https://bio.visaforchina.cn/SYD4_EN/qianzhengyewu/jichuzhishi/changjianwenti/552371235904950309.html). Retained: numerical size and document/application scope supported. |
| Japan | jp-visa-serbia | Visa — Embassy in Serbia | 35×45 | [Authority/authorized source](https://www.yu.emb-japan.go.jp/visa/Documents_List_2025/Standards_Application_Form_Photos_2025.pdf). Official-domain indexed diagram explicitly identifies 35 mm width × 45 mm height; retained for Serbia only. |
| Japan | jp-passport-nz | Removed from selection | 35×45 | [Authority/authorized source](https://www.nz.emb-japan.go.jp/itpr_ja/ryoji-passport-new.html). Page opens, but numerical dimensions were in an image/link not substantiated in this review. |
| South Korea | kr-passport | Passport | 35×45 | [Authority/authorized source](https://www.nyj.go.kr/eng/contents.do?key=3440). Retained: numerical size and document/application scope supported. |
| South Korea | kr-visa-hk | Removed from selection | 35×45 | [Authority/authorized source](https://www.mofa.go.kr/upload/cntnts/hk-en/Visa_Application_Form.pdf). Removed pending corroboration: form retrieval entered a redirect loop. |
| India | in-visa-auckland | Regular visa — Auckland checklist | 51×51 | [Authority/authorized source](https://www.cgiauckland.gov.in/content/1673397067Visa-Checklist-2023.pdf). Retained: numerical size and document/application scope supported. |
| Bangladesh | bd-visa | Removed from selection | 35×45 | [Authority/authorized source](https://visa.gov.bd/Img/MRV_FORM.pdf). Form text did not substantiate the numerical photo size. |
| Sri Lanka | lk-residence-visa | Removed from selection | 35×45 | [Authority/authorized source](https://www.immigration.gov.lk/content/files/visa/residence_visa.pdf). Scanned form supplied no readable numerical requirement in this review. |
| Nepal | np-visa-beijing | Tourist visa — Embassy in Beijing | 35×45 | [Authority/authorized source](https://cn.nepalembassy.gov.np/pages/visa/). Retained: numerical size and document/application scope supported. |
| Nepal | np-passport-under5 | Passport (under 5) | 35×45 | [Authority/authorized source](https://nepalpassport.gov.np/en/process/what-kind-of-photo-is-required-for-the-passport). Retained: numerical size and document/application scope supported. |
| Bhutan | bt-passport-paper | Removed from selection | 35×45 | [Authority/authorized source](https://www.mfa.gov.bt/passport-application/). Removed pending corroboration: ministry page timed out. |
| Indonesia | id-official-visa-mexico | Official/diplomatic visa — Mexico City | 40×60 | [Authority/authorized source](https://kemlu.go.id/files-service/storage/submenu/additional_file/1729875925671bcfd597a5b_2024__VISA__Informasi_Visa_Official___Diplomatik.pdf). Retained: numerical size and document/application scope supported. |
| Cambodia | kh-k-visa-dc | Removed from selection | 50.8×50.8 | [Authority/authorized source](https://www.embassyofcambodiadc.org/uploads/9/8/1/8/98182996/recdc_khmer_visa_application_form_nov2024.pdf). Linked application form returned 404. |
| Philippines | ph-visa-seoul | 9(a) visitor visa — Seoul | 50.8×50.8 | [Authority/authorized source](https://www.philembassy-seoul.com/visa). Retained: numerical size and document/application scope supported. |
| Taiwan | tw-visa-mongolia | Removed from selection | 35×45 | [Authority/authorized source](https://www.taiwanembassy.org/uploads/sites/137/2023/06/20250206%E7%B0%BD%E8%AD%89%E8%A6%8F%E5%AE%9A%E4%B8%AD%E8%92%99%E8%8B%B1.pdf). Removed pending corroboration: mission PDF returned HTTP 403. |
| Hong Kong SAR China | hk-passport | Passport | 40×50 | [Authority/authorized source](https://www.immd.gov.hk/eng/residents/immigration/traveldoc/photorequirements.html). Retained: numerical size and document/application scope supported. |
| Australia | au-passport | Passport | 35×45 | [Authority/authorized source](https://www.passports.gov.au/PhotoGuidelines). Retained: numerical size and document/application scope supported. |
| New Zealand | nz-passport-paper | Passport (paper application) | 35×45 | [Authority/authorized source](https://www.passports.govt.nz/__data/assets/pdf_file/0024/54753/PAS300-Application-for-a-NZ-passport-Adult-renewal.pdf). Retained: numerical size and document/application scope supported. |
| Papua New Guinea | pg-passport-adult | Passport (first application, 19+) | 35×45 | [Authority/authorized source](https://ica.gov.pg/uploads/media/post_file_6070572-6.-checklist---ordinary-png-passport-first-time-19-years-older-1-.pdf). Retained: numerical size and document/application scope supported. |
| Kazakhstan | kz-visa-ekaterinburg | Visa — Consulate in Yekaterinburg | 35×45 | [Authority/authorized source](https://www.gov.kz/memleket/entities/mfa-ekaterinburg/press/article/details/166318?lang=ru). Retained: numerical size and document/application scope supported. |
| Uzbekistan | uz-consular-visa | Visa | 35×45 | [Authority/authorized source](https://gov.uz/en/mfa/activity_page/o-zbekiston-respublikasi-vizasi). Retained: numerical size and document/application scope supported. |
| Myanmar (Burma) | mm-tourist-visa-kunming | Tourist visa — Consulate in Kunming | 35×45 | [Authority/authorized source](https://mcgkunming.org/tourist-visa/). Retained: numerical size and document/application scope supported. |
| Singapore | sg-passport-paper | Passport (paper application) | 35×45 | [Authority/authorized source](https://www.ica.gov.sg/docs/default-source/ica/forms/imm_%28e%29_11.pdf). Retained using official-domain indexed application form: explicit 35 mm wide × 45 mm high, despite direct URL returning 404. |
| Turkmenistan | tm-visa-dc | Visa — Embassy in Washington DC | 38.1×50.8 | [Authority/authorized source](https://usa.tmembassy.gov.tm/en/attachments/11038/download). Retained: numerical size and document/application scope supported. |
| Canada | ca-visa | Temporary resident visa | 35×45 | [Authority/authorized source](https://www.canada.ca/en/immigration-refugees-citizenship/services/application/application-forms-guides/temporary-resident-visa-application-photograph-specifications.html). Retained: numerical size and document/application scope supported. |
| Brazil | br-visa | Removed from selection | 30×40 | [Authority/authorized source](https://www.gov.br/mre/pt-br/embaixada-abu-dhabi/abu-dhabi-arquivos/english/consular-services/visa/types-of-visa/visitor-visa-vivis). Direct response did not provide a readable checklist/size; prior research alone was not used to reapprove. |
| Argentina | ar-visa | Visa (Cádiz, working holiday) | 40×40 | [Authority/authorized source](https://ccadi.cancilleria.gob.ar/es/visas-14). Retained: numerical size and document/application scope supported. |
| Peru | pe-visa | Tourist visa (Guayaquil) | 50×50 | [Authority/authorized source](https://www.gob.pe/36240-solicitar-visa-de-turista-para-ingresar-al-peru?child=113826). Retained: numerical size and document/application scope supported. |
| Bolivia | bo-visa | Removed from selection | 30×30 | [Authority/authorized source](https://www.embajadadebolivia.uy/wp-content/uploads/2023/04/VISA.pdf). Removed pending corroboration: URL returned a challenge page rather than the application PDF. |
| Paraguay | py-visa | Removed from selection | 50×50 | [Authority/authorized source](https://www.mre.gov.py/san-pablo/index.php/download_file/view_inline/161). PDF numerical specification was not readable in this review. |
| Costa Rica | cr-visa | Removed from selection | 50×50 | [Authority/authorized source](https://www.embajadadecostarica.org/wp-content/uploads/2026/02/Requisitos-visa-de-turismo-pagina-web-V01II-VI.pdf). Removed pending corroboration: mission PDF returned HTTP 502. |
| Dominican Republic | do-visa | Tourist visa | 40×50 | [Authority/authorized source](https://www.gob.do/servicios/visa-de-turismo-simple-ts-o-turismo-multiple-tm). Retained: numerical size and document/application scope supported. |
| Haiti | ht-passport | Passport | 35×45 | [Authority/authorized source](https://immigration.mict.gouv.ht/informations-utiles/demande-de-passeport/). Retained: numerical size and document/application scope supported. |
| Antigua & Barbuda | ag-passport | Passport | 35×45 | [Authority/authorized source](https://cip.gov.ag/wp-content/uploads/Passport-Form-L-Instructions-2017.pdf). Retained: numerical size and document/application scope supported. |
| St. Kitts & Nevis | kn-passport | Passport | 35×45 | [Authority/authorized source](https://www.mofa.gov.kn/wp-content/uploads/2024/11/St-Kitts-and-Nevis-Passport-form-and-instructions_v1_Aug-2-2024-merge.pdf). Retained: numerical size and document/application scope supported. |
| Dominica | dm-passport | Passport | 35×45 | [Authority/authorized source](https://dominica.gov.dm/images/docs/services/dominica_epp_and_sid_application_instructions_v1_30Mar2021.pdf). Retained: numerical size and document/application scope supported. |
| Grenada | gd-passport | Passport renewal | 38.1×50.8 | [Authority/authorized source](https://gndembassyprc.mofa.gov.gd/wp-content/uploads/2023/09/Schedule-I-Passport-Renewal-Application-Aug-2018.pdf.pdf). Retained: numerical size and document/application scope supported. |
| Bahamas | bs-passport | Passport | 50.8×50.8 | [Authority/authorized source](https://www.immigration.gov.bs/wp-content/uploads/2016/02/PassportRules_1.pdf). Retained: numerical size and document/application scope supported. |
| Anguilla | ai-passport | Removed from selection | 35×45 | [Authority/authorized source](https://gov.ai/document/forms/passport/Passport%20Photograph%20Notes.pdf). PDF numerical specification was not readable in this review. |
| British Virgin Islands | vg-passport | Removed from selection | 35×45 | [Authority/authorized source](https://bvi.gov.vg/sites/default/files/forms/guide_-_applying_for_a_british_overseas_territory_passport_-_revised_24_april_2018.pdf). Removed pending corroboration: redirected PDF could not be retrieved. |
| Morocco | ma-passport | Removed from selection | 35×45 | [Authority/authorized source](https://www.passeport.ma/Home/PiecesAuMaroc). Removed pending corroboration: passport authority returned HTTP 502. |
| Algeria | dz-passport | Passport | 35×45 | [Authority/authorized source](https://consulat-metz-algerie.fr/wp-content/uploads/2016/02/Les-normes-des-photographies-fournies-dans-le-dossier.pdf). Retained: numerical size and document/application scope supported. |
| Tunisia | tn-passport-us | Passport (Washington embassy) | 50.8×50.8 | [Authority/authorized source](https://www.tunisianembassy.org/passport-services). Retained: numerical size and document/application scope supported. |
| Egypt | eg-visa-doha | Removed from selection | 40×60 | [Authority/authorized source](https://cs.mfa.gov.eg/en/QAT/faq). FAQ has 4×6 passport examples; the selected visa route and numerical requirement were not substantiated. |
| Nigeria | ng-visa-moscow | Visa (Moscow embassy) | 35×45 | [Authority/authorized source](https://nigerianembassy.ru/consular-and-immigration/visa-application-3/). Retained: numerical size and document/application scope supported. |
| Ghana | gh-visa-arkansas | Visa (Arkansas honorary consulate) | 50.8×50.8 | [Authority/authorized source](https://www.ghanaconsulatear.org/media/d30bgflc/ghana-visa-application-05202025.pdf). Retained: numerical size and document/application scope supported. |
| South Africa | za-passport-toronto | Maxi passport (Toronto consulate) | 35×45 | [Authority/authorized source](https://dirco.gov.za/toronto/maxi-passports/). Retained: numerical size and document/application scope supported. |
| Zambia | zm-passport-child | Removed from selection | 38×51 | [Authority/authorized source](https://www.mohais.gov.zm/?page_id=1610). Removed pending corroboration: ministry page timed out. |
| Zimbabwe | zw-passport-ottawa | Passport (Ottawa embassy) | 35×45 | [Authority/authorized source](https://www.zimembassyottawa.com/passport-services). Retained: numerical size and document/application scope supported. |
| Namibia | na-visa-berlin | Tourism visa (Berlin embassy) | 50.8×50.8 | [Authority/authorized source](https://www.namibia-botschaft.de/application-for-visa/). Retained: numerical size and document/application scope supported. |
| Mauritius | mu-passport-renewal | Passport renewal | 35×45 | [Authority/authorized source](https://passport.govmu.org/passport/?mdocs-file=704). Retained: numerical size and document/application scope supported. |
| Mozambique | mz-visa-tokyo | Removed from selection | 35×45 | [Authority/authorized source](https://embamoc.jp/visas). Page opens but the numerical photo size was not substantiated in the retrieved content. |
| Angola | ao-visa-brasilia | Removed from selection | 30×40 | [Authority/authorized source](https://embaixadadeangola.com.br/2022/wp-content/uploads/2022/08/FORMUARIO-PARA-VISTOS-TIPO-3.pdf). Removed pending corroboration: mission PDF timed out. |
| Israel | il-visa-berlin | Removed from selection | 50×50 | [Authority/authorized source](https://embassies.gov.il/berlin/en/services/foreign-citizens/entry-visa-visiting-or-touring-israel). Current visitor-visa page did not substantiate the claimed 50×50 mm requirement. |
| Türkiye | tr-visa | Sticker visa | 50×60 | [Authority/authorized source](https://losangeles-cg.mfa.gov.tr/Mission/ShowInfoNote/411309). Retained: numerical size and document/application scope supported. |
| Jordan | jo-visa-washington | Visa (Washington paper form) | 50.8×50.8 | [Authority/authorized source](https://mfa.gov.jo/documents/180222Jordan%20Pass.pdf). Retained: numerical size and document/application scope supported. |
| Lebanon | lb-visa-india | Tourist visa (Embassy to India checklist) | 35×45 | [Authority/authorized source](https://www.vfsglobal.com/lebanon/srilanka/pdf/CHECKLIST-FOR-TOURIST-VISA.pdf). Retained: numerical size and document/application scope supported. |
| Bahrain | bh-passport | Removed from selection | 40×60 | [Authority/authorized source](https://www.npra.gov.bh/AImg/temp/Dir81/en_cond.pdf). Removed pending corroboration: NPRA PDF timed out. |
| Oman | om-visa-temporary-work | Temporary work visa | 40×60 | [Authority/authorized source](https://www.rop.gov.om/english/Visas.aspx?VisaName=TemporaryWorkVisa). Retained: numerical size and document/application scope supported. |
| Syria | sy-passport-mission | Passport renewal | 40×40 | [Authority/authorized source](https://mofaex.gov.sy/en/services/%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF-%D8%AC%D9%88%D8%A7%D8%B2-%D8%A7%D9%84%D8%B3%D9%81%D8%B1-%D8%A8%D8%AF%D9%84-%D8%B9%D9%86-%D9%85%D9%86%D8%AA%D9%87%D9%8A). Retained: numerical size and document/application scope supported. |

## Complete benchmark coverage comparison
All dimensions are mm unless inches stated. “Different document/scope” is a coverage difference, not proof either size is wrong. Entries with the same document and dimensions still need the linked route conditions above.

| Country | IDPhoto4You observed choices | Our retained choices | Assessment |
|---|---|---|---|
| Albania | Passport 40×50 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Argentina | Passport 1.5×1.5 inches | Visa (Cádiz, working holiday) 40×40 | Compare document and location; see verdicts and authority links above. |
| Australia | Passport 35×45 | Passport 35×45 | Compare document and location; see verdicts and authority links above. |
| Austria | Passport 35×45 | Schengen / National Visa 35×45 | Compare document and location; see verdicts and authority links above. |
| Bahamas | Passport 2×2 inches | Passport 50.8×50.8 | Compare document and location; see verdicts and authority links above. |
| Bangladesh | Passport 40×50 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Belarus | Passport 40×50 | Private visa — UAE application centre 35×45 | Compare document and location; see verdicts and authority links above. |
| Belgium | Passport 35×45 | Student visa (Helsinki) 35×45 | Compare document and location; see verdicts and authority links above. |
| Belize | Passport 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Bolivia | Passport 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Brazil | Passport 50×70; Visa 2×2 inches; ID 30×40 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Bulgaria | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Canada | Passport 50×70; Visa 35×45; Citizenship 35×45; PR card 35×45 | Temporary resident visa 35×45 | Compare document and location; see verdicts and authority links above. |
| China | Passport 33×48; Visa 2×2 inches | Visa — Sydney application centre 33×48 | Compare document and location; see verdicts and authority links above. |
| Colombia | Passport 1.5×2 inches; Visa 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Costa Rica | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Croatia | Passport 35×45; Driver licence 30×35 | National Visa (D) 35×45 | Compare document and location; see verdicts and authority links above. |
| Cyprus | Passport 40×50 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Czechia | Passport 35×45 | Schengen / National Visa 35×45 | Compare document and location; see verdicts and authority links above. |
| Denmark | Passport 35×45 | Short-stay visa — Pakistan application 35×45 | Compare document and location; see verdicts and authority links above. |
| Estonia | Passport 40×50 (including under 11); Visa 36×47 | Visa — Tel Aviv application 35×45 | Compare document and location; see verdicts and authority links above. |
| Finland | Passport/Visa 36×47 (including under 11) | Passport (paper application) 36×47 | Compare document and location; see verdicts and authority links above. |
| France | Passport 35×45 | Visa 35×45 | Compare document and location; see verdicts and authority links above. |
| Germany | Passport 35×45 (including under 10) | Visa (German missions in the UK) 35×45 | Compare document and location; see verdicts and authority links above. |
| Greece | Passport/Visa 40×60 | Tourist visa — GVCW United Kingdom 35×40 | Compare document and location; see verdicts and authority links above. |
| Hong Kong SAR China | Passport/Visa 40×50 | Passport 40×50 | Compare document and location; see verdicts and authority links above. |
| Hungary | Passport 35×45 | Schengen visa (Taipei) 35×45 | Compare document and location; see verdicts and authority links above. |
| India | Passport 35×35, 2×2 inches, 35×45; Visa 2×2 inches; OCI 35×35; PAN 25×35 | Regular visa — Auckland checklist 51×51 | Compare document and location; see verdicts and authority links above. |
| Indonesia | Passport 2×2 inches | Official/diplomatic visa — Mexico City 40×60 | Compare document and location; see verdicts and authority links above. |
| Iran | Passport 30×40 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Ireland | Passport 35×45 | Visa (printed photo) 35×45 | Compare document and location; see verdicts and authority links above. |
| Israel | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Italy | Passport 35×45 | Tourist visa — Hong Kong / Macao 35×45 | Compare document and location; see verdicts and authority links above. |
| Jamaica | Passport 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Japan | Passport 35×45; Visa 45×45 | Visa — Embassy in Serbia 35×45 | Compare document and location; see verdicts and authority links above. |
| Kenya | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| South Korea | Passport 35×45 | Passport 35×45 | Compare document and location; see verdicts and authority links above. |
| Lebanon | Passport 2×2 inches | Tourist visa (Embassy to India checklist) 35×45 | Compare document and location; see verdicts and authority links above. |
| Malaysia | Passport 35×50 or 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Mexico | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Morocco | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Netherlands | Passport 35×45 (including under 11) | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| New Zealand | Passport 35×45 | Passport (paper application) 35×45 | Compare document and location; see verdicts and authority links above. |
| Nigeria | Passport 35×45 | Visa (Moscow embassy) 35×45 | Compare document and location; see verdicts and authority links above. |
| Norway | Passport 35×45 | Visitor visa — Egypt / Libya checklist 35×45 | Compare document and location; see verdicts and authority links above. |
| Pakistan | Passport 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Panama | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Peru | Passport 2×2 inches | Tourist visa (Guayaquil) 50×50 | Compare document and location; see verdicts and authority links above. |
| Philippines | Passport 35×45 | 9(a) visitor visa — Seoul 50.8×50.8 | Compare document and location; see verdicts and authority links above. |
| Poland | Passport 35×45 | Passport (paper application) 35×45 | Compare document and location; see verdicts and authority links above. |
| Portugal | Passport 35×45; Citizenship 1.5×1.5 inches | Schengen visa — apply in the U.S. 35×45 | Compare document and location; see verdicts and authority links above. |
| Romania | Passport 35×45 | Schengen Visa 35×45 | Compare document and location; see verdicts and authority links above. |
| Russia | Passport 35×45 | Visa — Ireland consular application 35×45 | Compare document and location; see verdicts and authority links above. |
| Singapore | Passport 35×45 | Passport (paper application) 35×45 | Compare document and location; see verdicts and authority links above. |
| South Africa | Passport 35×45 or 2×2 inches | Maxi passport (Toronto consulate) 35×45 | Compare document and location; see verdicts and authority links above. |
| Spain | Passport 30×40 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Sweden | Passport 35×45 | Tourist visa — Iceland application 35×45 | Compare document and location; see verdicts and authority links above. |
| Switzerland | Passport 35×45 (including under 11) | Marriage visa D — Madagascar application 35×45 | Compare document and location; see verdicts and authority links above. |
| Syria | Passport 40×40 | Passport renewal 40×40 | Compare document and location; see verdicts and authority links above. |
| Taiwan | Passport 2×2 inches or 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Tanzania | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Thailand | Passport 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Trinidad & Tobago | Passport 43×53; Machine-readable passport 31×41 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Türkiye | Passport 50×60 | Sticker visa 50×60 | Compare document and location; see verdicts and authority links above. |
| Ukraine | Passport 35×45 | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| United Kingdom | Passport 35×45 | Passport (paper application) 35×45 | Compare document and location; see verdicts and authority links above. |
| United States | Passport & Visa 2×2 inches | Passport 50.8×50.8; Visa (printed photo) 50.8×50.8 | Compare document and location; see verdicts and authority links above. |
| Uzbekistan | Passport 35×45 | Visa 35×45 | Compare document and location; see verdicts and authority links above. |
| Venezuela | Passport 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Vietnam | Passport 2×2 inches | None | Coverage gap; no supported route retained. Not a verdict on their requirement. |
| Zimbabwe | Passport 2×2 inches | Passport (Ottawa embassy) 35×45 | Compare document and location; see verdicts and authority links above. |

Additional countries/regions in our retained list: Latvia, Montenegro, Slovakia, Luxembourg, Bosnia & Herzegovina, Serbia, Slovenia, Armenia, Nepal, Papua New Guinea, Kazakhstan, Myanmar (Burma), Turkmenistan, Dominican Republic, Haiti, Antigua & Barbuda, St. Kitts & Nevis, Dominica, Grenada, Algeria, Tunisia, Ghana, Namibia, Mauritius, Jordan, Oman.

## Validation
All 16 Node checks passed. All 34 focused Chromium/WebKit cases passed across the initial run and the corrected two-case rerun. Coverage includes every retained choice in both languages, sources, phone layout, physical output geometry, preparation ratios, compression and requirements-tab transitions. Build and whitespace checks passed. No live deployment or real authority acceptance test. Firefox and real-device/physical-print acceptance were not rechecked.

/**
 * Bilingual lookups for the raw Arabic labels stored in the customs database.
 *
 * The declarations table only carries Arabic names, so every dimension shown in
 * the UI is resolved through one of these maps. Anything missing falls back to
 * the raw Arabic string, which keeps the dashboard correct if the ingest picks
 * up a value we have not catalogued yet.
 */

export type Bilingual = { en: string; ar: string };

export type CountryInfo = Bilingual & {
  /** ISO 3166-1 alpha-2 where one exists; used for URL slugs and flag emoji. */
  code: string;
  /** False for aggregates such as "European Union" that have no real flag. */
  hasFlag: boolean;
};

/** Sea / land / air, derived from the port name. Enables the modal split view. */
export type PortMode = "sea" | "land" | "air";

export type PortInfo = Bilingual & { mode: PortMode };

/* -------------------------------------------------------------------------- */
/* Countries                                                                    */
/* -------------------------------------------------------------------------- */

const COUNTRY_ENTRIES: Array<[ar: string, en: string, code: string]> = [
  ["أذربيجان", "Azerbaijan", "AZ"],
  ["أرمينيا", "Armenia", "AM"],
  ["أستراليا", "Australia", "AU"],
  ["أفغانستان", "Afghanistan", "AF"],
  ["ألبانيا", "Albania", "AL"],
  ["ألمانيا", "Germany", "DE"],
  ["أنتاركتيكا", "Antarctica", "AQ"],
  ["أنتيقوا وباربودا", "Antigua and Barbuda", "AG"],
  ["أنجولا", "Angola", "AO"],
  ["أندورا", "Andorra", "AD"],
  ["أوروبا", "Europe (unspecified)", "EUROPE"],
  ["أوروجواي", "Uruguay", "UY"],
  ["أوزباكستان", "Uzbekistan", "UZ"],
  ["أوغندا", "Uganda", "UG"],
  ["أوكرانيا", "Ukraine", "UA"],
  ["أيسل أوف مان", "Isle of Man", "IM"],
  ["أيسلندا", "Iceland", "IS"],
  ["إثيوبيا", "Ethiopia", "ET"],
  ["إريتريا", "Eritrea", "ER"],
  ["إسبانيا", "Spain", "ES"],
  ["إستونيا", "Estonia", "EE"],
  ["إندونيسيا", "Indonesia", "ID"],
  ["إيرلندا", "Ireland", "IE"],
  ["إيطاليا", "Italy", "IT"],
  ["الأرجنتين", "Argentina", "AR"],
  ["الأردن", "Jordan", "JO"],
  ["الإكوادور", "Ecuador", "EC"],
  ["الإمارات", "United Arab Emirates", "AE"],
  ["الاتحاد الأوروبي", "European Union", "EU"],
  ["البحرين", "Bahrain", "BH"],
  ["البرازيل", "Brazil", "BR"],
  ["البرتغال", "Portugal", "PT"],
  ["البوسنة والهرسك", "Bosnia and Herzegovina", "BA"],
  ["الجابون", "Gabon", "GA"],
  ["الجبل الأسود", "Montenegro", "ME"],
  ["الجزائر", "Algeria", "DZ"],
  ["الدنمارك", "Denmark", "DK"],
  ["السعودية", "Saudi Arabia", "SA"],
  ["السنيغال", "Senegal", "SN"],
  ["السودان", "Sudan", "SD"],
  ["السويد", "Sweden", "SE"],
  ["الصومال", "Somalia", "SO"],
  ["الصين", "China", "CN"],
  ["العراق", "Iraq", "IQ"],
  ["الفلبين", "Philippines", "PH"],
  ["الكاميرون", "Cameroon", "CM"],
  ["الكونغو", "DR Congo", "CD"],
  ["الكويت", "Kuwait", "KW"],
  ["المالديف", "Maldives", "MV"],
  ["المغرب", "Morocco", "MA"],
  ["المملكة المتحدة", "United Kingdom", "GB"],
  ["النرويج", "Norway", "NO"],
  ["النمسا", "Austria", "AT"],
  ["النيجر", "Niger", "NE"],
  ["الهند", "India", "IN"],
  ["الولايات المتحدة", "United States", "US"],
  ["اليابان", "Japan", "JP"],
  ["اليمن", "Yemen", "YE"],
  ["اليونان", "Greece", "GR"],
  ["بابوا(غينيا الجديدة)", "Papua New Guinea", "PG"],
  ["باكستان", "Pakistan", "PK"],
  ["براجواي", "Paraguay", "PY"],
  ["بربدوس", "Barbados", "BB"],
  ["برمودا", "Bermuda", "BM"],
  ["بروناي دار السلام", "Brunei Darussalam", "BN"],
  ["بريتش إنديان أوشن", "British Indian Ocean Territory", "IO"],
  ["بلجيكا", "Belgium", "BE"],
  ["بلغاريا", "Bulgaria", "BG"],
  ["بنجلادش", "Bangladesh", "BD"],
  ["بنما", "Panama", "PA"],
  ["بنين", "Benin", "BJ"],
  ["بهاما", "Bahamas", "BS"],
  ["بهوتان", "Bhutan", "BT"],
  ["بوتسوانا", "Botswana", "BW"],
  ["بورتوريكو", "Puerto Rico", "PR"],
  ["بوركينا فاسو", "Burkina Faso", "BF"],
  ["بوروندي", "Burundi", "BI"],
  ["بولندا", "Poland", "PL"],
  ["بوليفيا", "Bolivia", "BO"],
  ["بولينسيا الفرنسية", "French Polynesia", "PF"],
  ["بيتكايرن", "Pitcairn Islands", "PN"],
  ["بيرو", "Peru", "PE"],
  ["بيلاروس", "Belarus", "BY"],
  ["بيليز", "Belize", "BZ"],
  ["تايلاند", "Thailand", "TH"],
  ["تايوان", "Taiwan", "TW"],
  ["تركمانستان", "Turkmenistan", "TM"],
  ["تركيا", "Türkiye", "TR"],
  ["ترينيداد و توباكو", "Trinidad and Tobago", "TT"],
  ["تشاد", "Chad", "TD"],
  ["تشيلي", "Chile", "CL"],
  ["تنزانيا", "Tanzania", "TZ"],
  ["توجو", "Togo", "TG"],
  ["توكيلاو", "Tokelau", "TK"],
  ["تونس", "Tunisia", "TN"],
  ["تيمور ليستي", "Timor-Leste", "TL"],
  ["ج إفريقيا الوسطى", "Central African Republic", "CF"],
  ["جامايكا", "Jamaica", "JM"],
  ["جامبيا", "Gambia", "GM"],
  ["جبل طارق", "Gibraltar", "GI"],
  ["جرينلاند", "Greenland", "GL"],
  ["جزر أمريكا الثانوية", "US Minor Outlying Islands", "UM"],
  ["جزر القمر", "Comoros", "KM"],
  ["جزر توركس & كايكوس", "Turks and Caicos Islands", "TC"],
  ["جزر جورجيا & ساندويش", "South Georgia & South Sandwich Islands", "GS"],
  ["جزر فولكلاند", "Falkland Islands", "FK"],
  ["جزر كوك", "Cook Islands", "CK"],
  ["جزر كيب فردي", "Cabo Verde", "CV"],
  ["جزر مارشال", "Marshall Islands", "MH"],
  ["جزرفيرجين البريطانية", "British Virgin Islands", "VG"],
  ["جزيرة كريسماس", "Christmas Island", "CX"],
  ["جزيرة نورفولك", "Norfolk Island", "NF"],
  ["جمهورية التشيك", "Czechia", "CZ"],
  ["جمهورية الدومينيكان", "Dominican Republic", "DO"],
  ["جمهورية كوسوفو", "Kosovo", "XK"],
  ["جنوب إفريقيا", "South Africa", "ZA"],
  ["جنوب السودان", "South Sudan", "SS"],
  ["جواتيمالا", "Guatemala", "GT"],
  ["جواديلوبي", "Guadeloupe", "GP"],
  ["جورجيا", "Georgia", "GE"],
  ["جيبوتي", "Djibouti", "DJ"],
  ["جيرسي", "Jersey", "JE"],
  ["دومينكا", "Dominica", "DM"],
  ["رواندا", "Rwanda", "RW"],
  ["روسيا", "Russia", "RU"],
  ["رومانيا", "Romania", "RO"],
  ["ريونيون", "Réunion", "RE"],
  ["زامبيا", "Zambia", "ZM"],
  ["زيمبابوي", "Zimbabwe", "ZW"],
  ["ساحل العاج", "Côte d'Ivoire", "CI"],
  ["ساموا", "Samoa", "WS"],
  ["ساموا الأمريكية", "American Samoa", "AS"],
  ["سان مارينو", "San Marino", "SM"],
  ["سانت كيتس & نيفيس", "Saint Kitts and Nevis", "KN"],
  ["سانت لوسيا", "Saint Lucia", "LC"],
  ["سانت مارتن", "Saint Martin", "MF"],
  ["سانت هيلينا", "Saint Helena", "SH"],
  ["ساو تومي & برينسيبي", "São Tomé and Príncipe", "ST"],
  ["سريلانكا", "Sri Lanka", "LK"],
  ["سلفادور", "El Salvador", "SV"],
  ["سلوفاكيا", "Slovakia", "SK"],
  ["سلوفانيا", "Slovenia", "SI"],
  ["سنغافورة", "Singapore", "SG"],
  ["سوازي لاند", "Eswatini", "SZ"],
  ["سوريا", "Syria", "SY"],
  ["سويسرا", "Switzerland", "CH"],
  ["سيراليون", "Sierra Leone", "SL"],
  ["سيرنام", "Suriname", "SR"],
  ["سيشلس", "Seychelles", "SC"],
  ["صربيا", "Serbia", "RS"],
  ["طاجكستان", "Tajikistan", "TJ"],
  ["عمان", "Oman", "OM"],
  ["غانا", "Ghana", "GH"],
  ["غوانا", "Guyana", "GY"],
  ["غينيا", "Guinea", "GN"],
  ["غينيا الاستوائية", "Equatorial Guinea", "GQ"],
  ["غينيا الفرنسية", "French Guiana", "GF"],
  ["غينيا بيساو", "Guinea-Bissau", "GW"],
  ["فرنسا", "France", "FR"],
  ["فلسطين", "Palestine", "PS"],
  ["فنزويلا", "Venezuela", "VE"],
  ["فنلندا", "Finland", "FI"],
  ["فنواتو", "Vanuatu", "VU"],
  ["فيتنام", "Vietnam", "VN"],
  ["فيجي", "Fiji", "FJ"],
  ["قبرص", "Cyprus", "CY"],
  ["قطر", "Qatar", "QA"],
  ["قيرقيزيستان", "Kyrgyzstan", "KG"],
  ["كازاخستان", "Kazakhstan", "KZ"],
  ["كاليدونيا الجديدة", "New Caledonia", "NC"],
  ["كرواتيا", "Croatia", "HR"],
  ["كمبوديا", "Cambodia", "KH"],
  ["كندا", "Canada", "CA"],
  ["كوبا", "Cuba", "CU"],
  ["كوراكاو", "Curaçao", "CW"],
  ["كوريا الجنوبية", "South Korea", "KR"],
  ["كوريا الشمالية", "North Korea", "KP"],
  ["كوستاريكا", "Costa Rica", "CR"],
  ["كولومبيا", "Colombia", "CO"],
  ["كونجو", "Republic of the Congo", "CG"],
  ["كينيا", "Kenya", "KE"],
  ["لاتفيا", "Latvia", "LV"],
  ["لاو", "Laos", "LA"],
  ["لبنان", "Lebanon", "LB"],
  ["لتوانيا", "Lithuania", "LT"],
  ["لوكسمبورج", "Luxembourg", "LU"],
  ["ليبريا", "Liberia", "LR"],
  ["ليبيا", "Libya", "LY"],
  ["ليختنشتاين", "Liechtenstein", "LI"],
  ["ليسوتو", "Lesotho", "LS"],
  ["ماكاو", "Macao", "MO"],
  ["مالطة", "Malta", "MT"],
  ["مالي", "Mali", "ML"],
  ["ماليزيا", "Malaysia", "MY"],
  ["مدغشقر", "Madagascar", "MG"],
  ["مصر", "Egypt", "EG"],
  ["مقدونيا", "North Macedonia", "MK"],
  ["مكسيك", "Mexico", "MX"],
  ["ملاوي", "Malawi", "MW"],
  ["مناطق فرنسا الشمالية", "French Southern Territories", "TF"],
  ["منغوليا", "Mongolia", "MN"],
  ["موريتانيا", "Mauritania", "MR"],
  ["موريشيوس", "Mauritius", "MU"],
  ["موزمبيق", "Mozambique", "MZ"],
  ["مولدافيا", "Moldova", "MD"],
  ["موناكو", "Monaco", "MC"],
  ["مونتسيرات", "Montserrat", "MS"],
  ["ميانمار", "Myanmar", "MM"],
  ["ميكرونيسيا", "Micronesia", "FM"],
  ["ناميبيا", "Namibia", "NA"],
  ["ناورو", "Nauru", "NR"],
  ["نايوي", "Niue", "NU"],
  ["نيبال", "Nepal", "NP"],
  ["نيثرلاندز انتيليز", "Netherlands Antilles", "ANT"],
  ["نيجيريا", "Nigeria", "NG"],
  ["نيكاراجوا", "Nicaragua", "NI"],
  ["نيوزيلاندا", "New Zealand", "NZ"],
  ["هاييتي", "Haiti", "HT"],
  ["هنجاريا", "Hungary", "HU"],
  ["هولندا", "Netherlands", "NL"],
  ["هولي سي", "Holy See", "VA"],
  ["هونج كونج", "Hong Kong", "HK"],
  ["هوندوراس", "Honduras", "HN"],
];

/** Codes that are not real ISO alpha-2 country codes, so no flag is rendered. */
const NON_FLAG_CODES = new Set(["EUROPE", "ANT", "XK"]);

export const COUNTRY_BY_AR: Record<string, CountryInfo> = Object.fromEntries(
  COUNTRY_ENTRIES.map(([ar, en, code]) => [
    ar,
    { ar, en, code, hasFlag: !NON_FLAG_CODES.has(code) },
  ])
);

const COUNTRY_BY_CODE: Record<string, CountryInfo> = Object.fromEntries(
  Object.values(COUNTRY_BY_AR).map((c) => [c.code, c])
);

/** Derives a country entry for an Arabic name we have no mapping for. */
function fallbackCountry(ar: string): CountryInfo {
  return { ar, en: ar, code: encodeURIComponent(ar), hasFlag: false };
}

export function countryInfo(ar: string): CountryInfo {
  return COUNTRY_BY_AR[ar] ?? fallbackCountry(ar);
}

/** Resolves a URL slug back to the Arabic name used inside the database. */
export function countryArFromCode(code: string): string | null {
  const match = COUNTRY_BY_CODE[code.toUpperCase()];
  if (match) return match.ar;

  // Fallback slugs are percent-encoded Arabic.
  try {
    const decoded = decodeURIComponent(code);
    return COUNTRY_BY_AR[decoded] ? decoded : decoded || null;
  } catch {
    return null;
  }
}

/** Regional-indicator flag emoji, or an empty string when there is no flag. */
export function flagEmoji(info: CountryInfo): string {
  if (!info.hasFlag || !/^[A-Z]{2}$/.test(info.code)) return "";
  return String.fromCodePoint(
    ...[...info.code].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)
  );
}

/* -------------------------------------------------------------------------- */
/* HS chapters                                                                  */
/* -------------------------------------------------------------------------- */

export const HS_CHAPTER: Record<string, Bilingual> = {
  "01": { en: "Live animals", ar: "حيوانات حية" },
  "02": { en: "Meat", ar: "لحوم" },
  "03": { en: "Fish & seafood", ar: "أسماك وقشريات" },
  "04": { en: "Dairy, eggs & honey", ar: "ألبان وبيض وعسل" },
  "05": { en: "Other animal products", ar: "منتجات حيوانية أخرى" },
  "06": { en: "Live plants & flowers", ar: "نباتات حية وأزهار" },
  "07": { en: "Vegetables", ar: "خضروات" },
  "08": { en: "Fruit & nuts", ar: "فواكه ومكسرات" },
  "09": { en: "Coffee, tea & spices", ar: "بن وشاي وتوابل" },
  "10": { en: "Cereals", ar: "حبوب" },
  "11": { en: "Milling products", ar: "منتجات المطاحن" },
  "12": { en: "Oil seeds & grains", ar: "بذور زيتية وحبوب" },
  "13": { en: "Gums & resins", ar: "صموغ وراتنجات" },
  "14": { en: "Vegetable plaiting materials", ar: "مواد نباتية للضفر" },
  "15": { en: "Fats & oils", ar: "دهون وزيوت" },
  "16": { en: "Meat & fish preparations", ar: "محضرات لحوم وأسماك" },
  "17": { en: "Sugars & confectionery", ar: "سكريات وحلويات" },
  "18": { en: "Cocoa & chocolate", ar: "كاكاو وشوكولاتة" },
  "19": { en: "Cereal preparations", ar: "محضرات حبوب" },
  "20": { en: "Vegetable & fruit preparations", ar: "محضرات خضروات وفواكه" },
  "21": { en: "Misc. edible preparations", ar: "محضرات غذائية متنوعة" },
  "22": { en: "Beverages", ar: "مشروبات" },
  "23": { en: "Animal feed & food residues", ar: "أعلاف ومخلفات صناعات غذائية" },
  "24": { en: "Tobacco", ar: "تبغ" },
  "25": { en: "Salt, stone & cement", ar: "ملح وحجر وأسمنت" },
  "26": { en: "Ores, slag & ash", ar: "خامات معدنية وخبث ورماد" },
  "27": { en: "Mineral fuels", ar: "وقود معدني" },
  "28": { en: "Inorganic chemicals", ar: "كيماويات غير عضوية" },
  "29": { en: "Organic chemicals", ar: "كيماويات عضوية" },
  "30": { en: "Pharmaceuticals", ar: "أدوية" },
  "31": { en: "Fertilisers", ar: "أسمدة" },
  "32": { en: "Tanning, dyes & paints", ar: "دباغة وأصباغ ودهانات" },
  "33": { en: "Essential oils & cosmetics", ar: "زيوت عطرية ومستحضرات تجميل" },
  "34": { en: "Soap & detergents", ar: "صابون ومنظفات" },
  "35": { en: "Albuminoids, glues & enzymes", ar: "مواد ألبومينية وغراء وإنزيمات" },
  "36": { en: "Explosives & pyrotechnics", ar: "متفجرات وألعاب نارية" },
  "37": { en: "Photographic goods", ar: "منتجات تصوير" },
  "38": { en: "Misc. chemical products", ar: "منتجات كيميائية متنوعة" },
  "39": { en: "Plastics", ar: "لدائن" },
  "40": { en: "Rubber", ar: "مطاط" },
  "41": { en: "Raw hides & leather", ar: "جلود خام" },
  "42": { en: "Leather articles", ar: "مصنوعات جلدية" },
  "43": { en: "Furskins", ar: "فراء" },
  "44": { en: "Wood", ar: "خشب" },
  "45": { en: "Cork", ar: "فلين" },
  "46": { en: "Straw & basketware", ar: "قش ومصنوعات ضفر" },
  "47": { en: "Pulp of wood", ar: "عجينة خشب" },
  "48": { en: "Paper & paperboard", ar: "ورق وورق مقوى" },
  "49": { en: "Printed books & media", ar: "مطبوعات وكتب" },
  "50": { en: "Silk", ar: "حرير" },
  "51": { en: "Wool", ar: "صوف" },
  "52": { en: "Cotton", ar: "قطن" },
  "53": { en: "Other vegetable textile fibres", ar: "ألياف نسجية نباتية أخرى" },
  "54": { en: "Man-made filaments", ar: "شعيرات تركيبية" },
  "55": { en: "Man-made staple fibres", ar: "ألياف تركيبية غير مستمرة" },
  "56": { en: "Wadding, felt & nonwovens", ar: "حشوات ولباد وغير منسوجات" },
  "57": { en: "Carpets", ar: "سجاد" },
  "58": { en: "Special woven fabrics", ar: "أقمشة منسوجة خاصة" },
  "59": { en: "Coated textile fabrics", ar: "أقمشة مطلية" },
  "60": { en: "Knitted fabrics", ar: "أقمشة محبوكة" },
  "61": { en: "Apparel, knitted", ar: "ملابس محبوكة" },
  "62": { en: "Apparel, woven", ar: "ملابس منسوجة" },
  "63": { en: "Other made-up textiles", ar: "منسوجات جاهزة أخرى" },
  "64": { en: "Footwear", ar: "أحذية" },
  "65": { en: "Headgear", ar: "أغطية رأس" },
  "66": { en: "Umbrellas & walking sticks", ar: "مظلات وعصي" },
  "67": { en: "Feathers & artificial flowers", ar: "ريش وأزهار اصطناعية" },
  "68": { en: "Stone, plaster & cement articles", ar: "مصنوعات حجر وجص وأسمنت" },
  "69": { en: "Ceramics", ar: "منتجات خزفية" },
  "70": { en: "Glass & glassware", ar: "زجاج ومصنوعاته" },
  "71": { en: "Precious stones & metals", ar: "أحجار ومعادن ثمينة" },
  "72": { en: "Iron & steel", ar: "حديد وصلب" },
  "73": { en: "Articles of iron or steel", ar: "مصنوعات حديد أو صلب" },
  "74": { en: "Copper", ar: "نحاس" },
  "75": { en: "Nickel", ar: "نيكل" },
  "76": { en: "Aluminium", ar: "ألمنيوم" },
  "78": { en: "Lead", ar: "رصاص" },
  "79": { en: "Zinc", ar: "زنك" },
  "80": { en: "Tin", ar: "قصدير" },
  "81": { en: "Other base metals", ar: "معادن أساسية أخرى" },
  "82": { en: "Tools & cutlery", ar: "عدد وأدوات قطع" },
  "83": { en: "Misc. base metal articles", ar: "مصنوعات معادن أساسية متنوعة" },
  "84": { en: "Machinery & mechanical appliances", ar: "آلات وأجهزة ميكانيكية" },
  "85": { en: "Electrical machinery", ar: "آلات وأجهزة كهربائية" },
  "86": { en: "Railway equipment", ar: "معدات سكك حديدية" },
  "87": { en: "Vehicles", ar: "مركبات" },
  "88": { en: "Aircraft & spacecraft", ar: "طائرات ومركبات فضائية" },
  "89": { en: "Ships & boats", ar: "سفن وقوارب" },
  "90": { en: "Optical & measuring instruments", ar: "أجهزة بصرية وقياس" },
  "91": { en: "Clocks & watches", ar: "ساعات" },
  "92": { en: "Musical instruments", ar: "آلات موسيقية" },
  "93": { en: "Arms & ammunition", ar: "أسلحة وذخائر" },
  "94": { en: "Furniture & lighting", ar: "أثاث وإنارة" },
  "95": { en: "Toys, games & sports", ar: "ألعاب ومعدات رياضية" },
  "96": { en: "Misc. manufactured articles", ar: "مصنوعات متنوعة" },
  "97": { en: "Works of art & antiques", ar: "تحف فنية وقطع أثرية" },
  "98": { en: "Special classification provisions", ar: "أحكام تصنيف خاصة" },
};

export function chapterName(chapter: string): Bilingual {
  return (
    HS_CHAPTER[chapter] ?? {
      en: `Chapter ${chapter}`,
      ar: `الفصل ${chapter}`,
    }
  );
}

/* -------------------------------------------------------------------------- */
/* MODON industrial cities                                                      */
/* -------------------------------------------------------------------------- */

export const CITY_EN: Record<string, string> = {
  "جدة الأولى": "Jeddah 1st",
  "جدة الثانية": "Jeddah 2nd",
  "جدة الثالثة": "Jeddah 3rd",
  "الدمام الأولى": "Dammam 1st",
  "الدمام الثانية": "Dammam 2nd",
  "الدمام الثالثة": "Dammam 3rd",
  "الرياض الأولى": "Riyadh 1st",
  "الرياض الثانية": "Riyadh 2nd",
  "الرياض الثالثة": "Riyadh 3rd",
  "القصيم الأولى": "Qassim 1st",
  "القصيم الثانية": "Qassim 2nd",
  "مكة المكرمة الأولى": "Makkah 1st",
  "مكة المكرمة الثانية": "Makkah 2nd",
  "الأحساء الأولى": "Al-Ahsa 1st",
  "المدن الصناعية الخاصة": "Private industrial cities",
  "المدينة المنورة": "Madinah",
  "المدينة الصناعية بعسير": "Asir Industrial City",
  "واحة مدن بعسير": "MODON Oasis — Asir",
  "واحة مدن بينبع": "MODON Oasis — Yanbu",
  "واحه مدن بجدة": "MODON Oasis — Jeddah",
  "واحة مدن بالقصيم": "MODON Oasis — Qassim",
  "واحة مدن بالأحساء": "MODON Oasis — Al-Ahsa",
  "واحة الجوف": "Al-Jouf Oasis",
  "وعد الشمال": "Waad Al-Shamal",
  "مجمع الصناعات العسكرية بالخرج": "Al-Kharj Military Industries Complex",
  "المنطقة التقنية بحي الجنادرية": "Janadriyah Technology Zone",
  "تبوك": "Tabuk",
  "سدير": "Sudair",
  "الخرج": "Al-Kharj",
  "حفر الباطن": "Hafar Al-Batin",
  "الباحة": "Al-Baha",
  "عرعر": "Arar",
  "شقراء": "Shaqra",
  "حائل": "Hail",
  "جازان": "Jazan",
  "رابغ": "Rabigh",
  "الزلفي": "Al-Zulfi",
  "الطائف": "Taif",
  "نجران": "Najran",
  "ضرما": "Dhurma",
};

export function cityName(ar: string): Bilingual {
  return { ar, en: CITY_EN[ar] ?? ar };
}

/* -------------------------------------------------------------------------- */
/* Ports of entry                                                               */
/* -------------------------------------------------------------------------- */

const PORT_ENTRIES: Array<[ar: string, en: string, mode: PortMode]> = [
  ["ميناء الملك عبدالعزيز", "King Abdulaziz Port, Dammam", "sea"],
  ["ميناء جده الاسلامي", "Jeddah Islamic Port", "sea"],
  ["رأس الخير", "Ras Al-Khair Port", "sea"],
  ["ميناء الجبيل الصناعي", "Jubail Industrial Port", "sea"],
  ["ميناء ينبع التجاري", "Yanbu Commercial Port", "sea"],
  ["ميناء الملك عبد الله", "King Abdullah Port", "sea"],
  ["ميناء جيزان", "Jazan Port", "sea"],
  ["ميناء نيوم", "NEOM Port", "sea"],
  ["ميناء رأس تنوره", "Ras Tanura Port", "sea"],
  ["محافظة الجبيل", "Jubail", "sea"],
  ["ميناء الملك فهد الصناعي بينبع", "King Fahd Industrial Port, Yanbu", "sea"],
  [
    "ميناء جازان للصناعات الأساسية والتحويلية",
    "Jazan Primary & Downstream Industries Port",
    "sea",
  ],
  ["ميناء الخفجي", "Khafji Port", "sea"],
  ["البطحاء", "Al-Batha crossing", "land"],
  ["الحديثة", "Al-Haditha crossing", "land"],
  ["جسر الملك فهد", "King Fahd Causeway", "land"],
  ["الوديعة", "Al-Wadiah crossing", "land"],
  ["الخفجي", "Khafji crossing", "land"],
  ["الرياض - الميناء الجاف", "Riyadh Dry Port", "land"],
  ["حالة عمار", "Halat Ammar crossing", "land"],
  ["جديدة عرعر", "Jadidat Arar crossing", "land"],
  ["الرقعي", "Al-Raqi crossing", "land"],
  ["الربع الخالي", "Empty Quarter crossing", "land"],
  ["سلوى", "Salwa crossing", "land"],
  ["الدره", "Al-Durra crossing", "land"],
  ["مطار الملك خالد الدولي", "King Khalid Intl Airport", "air"],
  ["مطار الملك فهد الدولي", "King Fahd Intl Airport", "air"],
  ["مطارالملك عبدالعزيزالدولي", "King Abdulaziz Intl Airport", "air"],
  ["مطار الأمير محمد بن عبد العزيز", "Prince Mohammed bin Abdulaziz Airport", "air"],
  ["مطار الامير نايف بن عبدالعزيز", "Prince Naif bin Abdulaziz Airport", "air"],
  ["مطار أبها", "Abha Airport", "air"],
  ["مطارالأميرسلطان بن عبدالعزيز", "Prince Sultan bin Abdulaziz Airport", "air"],
  ["مطارالملك فهد(البريد المركزي)", "King Fahd Airport (central post)", "air"],
];

export const PORT_BY_AR: Record<string, PortInfo> = Object.fromEntries(
  PORT_ENTRIES.map(([ar, en, mode]) => [ar, { ar, en, mode }])
);

/** Falls back to name heuristics so new ports still get a sensible mode. */
export function portInfo(ar: string): PortInfo {
  const known = PORT_BY_AR[ar];
  if (known) return known;
  const mode: PortMode = ar.includes("مطار")
    ? "air"
    : ar.includes("ميناء")
      ? "sea"
      : "land";
  return { ar, en: ar, mode };
}

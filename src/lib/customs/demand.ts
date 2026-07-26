import { openCustomsDb } from "./db";

export type TradeTotals = {
  declarations: number;
  netWeightKg: number;
  importDeclarations: number;
  importWeightKg: number;
  exportDeclarations: number;
  exportWeightKg: number;
};

export type DemandTotals = TradeTotals & {
  cities: number;
  originCountries: number;
  commercialRegisters: number;
};

export type MonthPoint = TradeTotals & {
  key: string;
  year: number;
  monthNum: number;
  monthAr: string;
};

export type NamedTradeRow = TradeTotals & {
  nameAr: string;
};

export type HsChapterRow = TradeTotals & {
  chapter: string;
  name: { en: string; ar: string };
};

export type CustomsDemandData = {
  recordCount: number;
  years: number[];
  totals: DemandTotals;
  byYear: Record<string, TradeTotals>;
  byMonth: MonthPoint[];
  byCity: NamedTradeRow[];
  byOrigin: NamedTradeRow[];
  byHsChapter: HsChapterRow[];
  byPort: NamedTradeRow[];
};

const HS_CHAPTER: Record<string, { en: string; ar: string }> = {
  "01": { en: "Live animals", ar: "حيوانات حية" },
  "02": { en: "Meat", ar: "لحوم" },
  "03": { en: "Fish", ar: "أسماك" },
  "04": { en: "Dairy", ar: "ألبان" },
  "07": { en: "Vegetables", ar: "خضروات" },
  "08": { en: "Fruit & nuts", ar: "فواكه ومكسرات" },
  "09": { en: "Coffee, tea, spices", ar: "بن وشاي وتوابل" },
  "10": { en: "Cereals", ar: "حبوب" },
  "11": { en: "Milling products", ar: "منتجات طحن" },
  "15": { en: "Fats & oils", ar: "دهون وزيوت" },
  "17": { en: "Sugars", ar: "سكريات" },
  "18": { en: "Cocoa", ar: "كاكاو" },
  "19": { en: "Cereal preparations", ar: "مستحضرات حبوب" },
  "20": { en: "Vegetable preparations", ar: "مستحضرات نباتية" },
  "21": { en: "Misc. edible preparations", ar: "مستحضرات غذائية متنوعة" },
  "22": { en: "Beverages", ar: "مشروبات" },
  "25": { en: "Salt, stone, cement", ar: "ملح وحجر وأسمنت" },
  "27": { en: "Mineral fuels", ar: "وقود معدني" },
  "28": { en: "Inorganic chemicals", ar: "كيماويات غير عضوية" },
  "29": { en: "Organic chemicals", ar: "كيماويات عضوية" },
  "30": { en: "Pharmaceuticals", ar: "أدوية" },
  "32": { en: "Tanning / dyes / paints", ar: "أصباغ ودهانات" },
  "33": { en: "Essential oils / cosmetics", ar: "زيوت عطرية ومستحضرات تجميل" },
  "34": { en: "Soap / detergents", ar: "صابون ومنظفات" },
  "35": { en: "Albuminoidal substances", ar: "مواد ألبومينية" },
  "38": { en: "Misc. chemical products", ar: "منتجات كيميائية متنوعة" },
  "39": { en: "Plastics", ar: "لدائن" },
  "40": { en: "Rubber", ar: "مطاط" },
  "44": { en: "Wood", ar: "خشب" },
  "47": { en: "Pulp", ar: "لبّ" },
  "48": { en: "Paper", ar: "ورق" },
  "54": { en: "Man-made filaments", ar: "خيوط اصطناعية" },
  "55": { en: "Man-made staple fibres", ar: "ألياف اصطناعية" },
  "61": { en: "Apparel, knitted", ar: "ملابس محبوكة" },
  "62": { en: "Apparel, woven", ar: "ملابس منسوجة" },
  "68": { en: "Stone / plaster / cement articles", ar: "مصنوعات حجر وأسمنت" },
  "69": { en: "Ceramic products", ar: "منتجات خزفية" },
  "70": { en: "Glass", ar: "زجاج" },
  "72": { en: "Iron & steel", ar: "حديد وصلب" },
  "73": { en: "Articles of iron or steel", ar: "مصنوعات حديد أو صلب" },
  "74": { en: "Copper", ar: "نحاس" },
  "76": { en: "Aluminium", ar: "ألمنيوم" },
  "83": { en: "Misc. base metal articles", ar: "مصنوعات معادن أساسية" },
  "84": { en: "Machinery", ar: "آلات" },
  "85": { en: "Electrical machinery", ar: "آلات كهربائية" },
  "87": { en: "Vehicles", ar: "مركبات" },
  "90": { en: "Optical / measuring instruments", ar: "أجهزة بصرية وقياس" },
  "94": { en: "Furniture", ar: "أثاث" },
};

const TRADE_SELECT = `
  COUNT(*) AS declarations,
  COALESCE(SUM(net_weight_kg), 0) AS netWeightKg,
  COALESCE(SUM(CASE WHEN is_import = 1 THEN 1 ELSE 0 END), 0) AS importDeclarations,
  COALESCE(SUM(CASE WHEN is_import = 1 THEN net_weight_kg ELSE 0 END), 0) AS importWeightKg,
  COALESCE(SUM(CASE WHEN is_import = 0 THEN 1 ELSE 0 END), 0) AS exportDeclarations,
  COALESCE(SUM(CASE WHEN is_import = 0 THEN net_weight_kg ELSE 0 END), 0) AS exportWeightKg
`;

function asTrade(row: Record<string, unknown>): TradeTotals {
  return {
    declarations: Number(row.declarations) || 0,
    netWeightKg: Number(row.netWeightKg) || 0,
    importDeclarations: Number(row.importDeclarations) || 0,
    importWeightKg: Number(row.importWeightKg) || 0,
    exportDeclarations: Number(row.exportDeclarations) || 0,
    exportWeightKg: Number(row.exportWeightKg) || 0,
  };
}

function chapterName(chapter: string) {
  return (
    HS_CHAPTER[chapter] ?? {
      en: `Chapter ${chapter}`,
      ar: `الفصل ${chapter}`,
    }
  );
}

/** Load demand metrics by querying the full customs declarations database. */
export function loadCustomsDemand(): CustomsDemandData {
  const db = openCustomsDb();

  const totalsRow = db
    .prepare(
      `SELECT
        ${TRADE_SELECT},
        COUNT(DISTINCT industrial_city) AS cities,
        COUNT(DISTINCT origin_country) AS originCountries,
        COUNT(DISTINCT commercial_register) AS commercialRegisters
      FROM declarations`
    )
    .get() as Record<string, unknown>;

  const totals: DemandTotals = {
    ...asTrade(totalsRow),
    cities: Number(totalsRow.cities) || 0,
    originCountries: Number(totalsRow.originCountries) || 0,
    commercialRegisters: Number(totalsRow.commercialRegisters) || 0,
  };

  const yearRows = db
    .prepare(
      `SELECT year, ${TRADE_SELECT}
       FROM declarations
       WHERE year IS NOT NULL
       GROUP BY year
       ORDER BY year`
    )
    .all() as Array<Record<string, unknown>>;

  const years = yearRows.map((r) => Number(r.year));
  const byYear: Record<string, TradeTotals> = {};
  for (const row of yearRows) {
    byYear[String(row.year)] = asTrade(row);
  }

  const monthRows = db
    .prepare(
      `SELECT
         year,
         month_num AS monthNum,
         month AS monthAr,
         ${TRADE_SELECT}
       FROM declarations
       WHERE year IS NOT NULL AND month_num IS NOT NULL
       GROUP BY year, month_num, month
       ORDER BY year, month_num`
    )
    .all() as Array<Record<string, unknown>>;

  const byMonth: MonthPoint[] = monthRows.map((row) => {
    const year = Number(row.year);
    const monthNum = Number(row.monthNum);
    return {
      key: `${year}-${String(monthNum).padStart(2, "0")}`,
      year,
      monthNum,
      monthAr: String(row.monthAr ?? ""),
      ...asTrade(row),
    };
  });

  const namedGroup = (column: string, limit: number, importsOnly = false) => {
    const where = importsOnly
      ? `WHERE ${column} IS NOT NULL AND ${column} != '' AND is_import = 1`
      : `WHERE ${column} IS NOT NULL AND ${column} != ''`;
    return db
      .prepare(
        `SELECT ${column} AS nameAr, ${TRADE_SELECT}
         FROM declarations
         ${where}
         GROUP BY ${column}
         ORDER BY importWeightKg DESC, declarations DESC
         LIMIT ?`
      )
      .all(limit) as Array<Record<string, unknown>>;
  };

  const byCity = namedGroup("industrial_city", 40).map((row) => ({
    nameAr: String(row.nameAr),
    ...asTrade(row),
  }));

  const byOrigin = namedGroup("origin_country", 15, true).map((row) => ({
    nameAr: String(row.nameAr),
    ...asTrade(row),
  }));

  const byPort = namedGroup("port", 10).map((row) => ({
    nameAr: String(row.nameAr),
    ...asTrade(row),
  }));

  const chapterRows = db
    .prepare(
      `SELECT hs_chapter AS chapter, ${TRADE_SELECT}
       FROM declarations
       WHERE hs_chapter IS NOT NULL AND hs_chapter != ''
       GROUP BY hs_chapter
       ORDER BY importWeightKg DESC, declarations DESC
       LIMIT 15`
    )
    .all() as Array<Record<string, unknown>>;

  const byHsChapter: HsChapterRow[] = chapterRows.map((row) => {
    const chapter = String(row.chapter);
    return {
      chapter,
      name: chapterName(chapter),
      ...asTrade(row),
    };
  });

  return {
    recordCount: totals.declarations,
    years,
    totals,
    byYear,
    byMonth,
    byCity,
    byOrigin,
    byHsChapter,
    byPort,
  };
}

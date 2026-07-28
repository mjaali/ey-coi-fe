import type { Bilingual } from "@/lib/customs/dictionaries";
import {
  getDemandFilterOptions,
  parseFilters,
  type CountryOption,
  type DemandFilters,
  type Flow,
  type PeriodOption,
} from "@/lib/customs/demand";
import { industrialCities } from "@/data/industrial-cities";
import { industrySummary } from "@/data/industry-summary";

export type LocalizationPotential = "all" | "high" | "medium" | "low";
export type GapStatus =
  | "exportedManufactured"
  | "manufacturedNotExported"
  | "importedNotManufactured"
  | "emerging";
export type Severity = "critical" | "high" | "moderate";

/** Shared demand filters plus map-driven geography selection. */
export type CommandCenterFilters = DemandFilters & {
  region: string;
  industrialCity: string;
};

export type RawCommandCenterFilters = {
  period?: string;
  country?: string;
  flow?: string;
  region?: string;
  industrialCity?: string;
};

export type CommandCenterKpi = {
  label: string;
  value: number | null;
  previousValue: number | null;
  format: "currency" | "integer" | "score";
};

export type Highlight = {
  id: string;
  title: Bilingual;
  description: Bilingual;
  tone: "positive" | "warning" | "neutral";
};

export type RegionReadiness = {
  id: string;
  name: Bilingual;
  score: number;
  outputValue: number;
  opportunityValue: number;
  severityScore: number;
  cityCount: number;
};

export type ManufacturingGap = {
  id: string;
  industry: Bilingual;
  sector: Bilingual;
  importGapValue: number;
  localCoverage: number;
  insight: Bilingual;
  severity: Severity;
};

export type LocalizationOpportunity = {
  id: string;
  industry: Bilingual;
  sector: Bilingual;
  opportunityValue: number;
  recommendedIndustrialCity: Bilingual;
  opportunityScore: number;
  recommendedAction: Bilingual;
  localizationPotential: Exclude<LocalizationPotential, "all">;
  reason: Bilingual;
};

export type GapMatrixItem = {
  id: string;
  productCategory: Bilingual;
  sector: Bilingual;
  exported: boolean;
  manufacturedLocally: boolean;
  imported: boolean;
  gapStatus: GapStatus;
};

export type OpportunityEngineItem = {
  id: string;
  industry: Bilingual;
  opportunityScore: number;
  reason: Bilingual;
};

export type MapPoint = {
  id: string;
  cityId: string;
  regionId: string;
  city: Bilingual;
  region: Bilingual;
  coordinates: [number, number];
  outputValue: number;
  opportunityValue: number;
  severityScore: number;
  readinessScore: number;
};

export type GeographySelection = {
  id: string;
  kind: "region" | "city";
  name: Bilingual;
  severityScore: number;
  outputValue: number;
  opportunityValue: number;
};

export type CommandCenterData = {
  filters: CommandCenterFilters;
  periods: PeriodOption[];
  countries: CountryOption[];
  kpis: CommandCenterKpi[];
  pulse: {
    selfSufficiency: number | null;
    localizationPotentialValue: number | null;
    localizationSectorCount: number;
    exportOpportunityValue: number | null;
    exportOpportunitySectorCount: number;
    exportOpportunityYoY: number | null;
  };
  highlights: Highlight[];
  regionReadiness: RegionReadiness[];
  criticalGaps: ManufacturingGap[];
  manufacturingGaps: ManufacturingGap[];
  localizationOpportunities: LocalizationOpportunity[];
  gapMatrix: GapMatrixItem[];
  opportunities: OpportunityEngineItem[];
  mapPoints: MapPoint[];
  mapSelection: GeographySelection | null;
  sourceNote: Bilingual;
  usesMockAdapter: boolean;
};

type RegionPreset = {
  id: string;
  name: Bilingual;
  readinessBase: number;
};

type CityRegionMap = {
  cityId: string;
  regionId: string;
};

type ProductPreset = {
  id: string;
  sectorId: string;
  sector: Bilingual;
  productCategory: Bilingual;
  importValue: number;
  exportValue: number;
  manufacturingValue: number;
  domesticDemand: number;
  localizationPotential: Exclude<LocalizationPotential, "all">;
  recommendedCityId: string;
  recommendedAction: Bilingual;
  reason: Bilingual;
};

const YEARS = ["2024", "2025", "2026"] as const;

const YEAR_FACTORS: Record<string, number> = {
  "2024": 0.92,
  "2025": 1,
  "2026": 1.08,
};

const REGIONS: RegionPreset[] = [
  { id: "riyadh", name: { en: "Riyadh", ar: "الرياض" }, readinessBase: 86 },
  { id: "makkah", name: { en: "Makkah", ar: "مكة المكرمة" }, readinessBase: 78 },
  { id: "eastern", name: { en: "Eastern Province", ar: "المنطقة الشرقية" }, readinessBase: 84 },
  { id: "madinah", name: { en: "Madinah", ar: "المدينة المنورة" }, readinessBase: 70 },
  { id: "qassim", name: { en: "Qassim", ar: "القصيم" }, readinessBase: 71 },
  { id: "hail", name: { en: "Hail", ar: "حائل" }, readinessBase: 63 },
  { id: "jazan", name: { en: "Jazan", ar: "جازان" }, readinessBase: 67 },
  { id: "tabuk", name: { en: "Tabuk", ar: "تبوك" }, readinessBase: 66 },
];

const CITY_REGIONS: CityRegionMap[] = [
  { cityId: "riyadh-2", regionId: "riyadh" },
  { cityId: "kharj", regionId: "riyadh" },
  { cityId: "jeddah-2", regionId: "makkah" },
  { cityId: "medina", regionId: "madinah" },
  { cityId: "dammam-2", regionId: "eastern" },
  { cityId: "jubail", regionId: "eastern" },
  { cityId: "ras-al-khair", regionId: "eastern" },
  { cityId: "qassim", regionId: "qassim" },
  { cityId: "hail", regionId: "hail" },
  { cityId: "jazan", regionId: "jazan" },
  { cityId: "tabuk", regionId: "tabuk" },
  { cityId: "yanbu", regionId: "madinah" },
];

const PRODUCT_PRESETS: ProductPreset[] = [
  {
    id: "packaged-food",
    sectorId: "food",
    sector: { en: "Food Products", ar: "المنتجات الغذائية" },
    productCategory: { en: "Packaged Foods", ar: "الأغذية المعبأة" },
    importValue: 6.2e9,
    exportValue: 2.9e9,
    manufacturingValue: 8.4e9,
    domesticDemand: 13.2e9,
    localizationPotential: "medium",
    recommendedCityId: "kharj",
    recommendedAction: { en: "Expand local capacity", ar: "توسيع الطاقة المحلية" },
    reason: {
      en: "Large domestic demand with proven manufacturing footprint.",
      ar: "طلب محلي كبير مع قاعدة تصنيع قائمة ومثبتة.",
    },
  },
  {
    id: "industrial-machinery",
    sectorId: "fabricated-metals",
    sector: { en: "Fabricated Metal Products", ar: "المنتجات المعدنية المصنّعة" },
    productCategory: { en: "Industrial Machinery", ar: "الآلات الصناعية" },
    importValue: 8.6e9,
    exportValue: 1.2e9,
    manufacturingValue: 2.4e9,
    domesticDemand: 10.8e9,
    localizationPotential: "high",
    recommendedCityId: "riyadh-2",
    recommendedAction: { en: "Attract manufacturers", ar: "استقطاب المصنعين" },
    reason: {
      en: "High import dependency and low domestic supply coverage.",
      ar: "اعتماد مرتفع على الواردات مع تغطية محلية محدودة.",
    },
  },
  {
    id: "medical-devices",
    sectorId: "electrical-equipment",
    sector: { en: "Electrical Equipment", ar: "المعدات الكهربائية" },
    productCategory: { en: "Medical Devices", ar: "الأجهزة الطبية" },
    importValue: 5.7e9,
    exportValue: 0.8e9,
    manufacturingValue: 1.4e9,
    domesticDemand: 6.5e9,
    localizationPotential: "high",
    recommendedCityId: "riyadh-2",
    recommendedAction: { en: "Target foreign investment", ar: "استهداف الاستثمار الأجنبي" },
    reason: {
      en: "Strong market demand and high-value import substitution potential.",
      ar: "طلب سوقي قوي وفرصة مرتفعة لإحلال الواردات.",
    },
  },
  {
    id: "specialty-chemicals",
    sectorId: "chemicals",
    sector: { en: "Chemicals & Chemical Products", ar: "المواد الكيميائية" },
    productCategory: { en: "Specialty Chemicals", ar: "الكيماويات المتخصصة" },
    importValue: 7.1e9,
    exportValue: 3.5e9,
    manufacturingValue: 5.3e9,
    domesticDemand: 9.1e9,
    localizationPotential: "high",
    recommendedCityId: "jubail",
    recommendedAction: { en: "Develop supplier ecosystem", ar: "تطوير منظومة الموردين" },
    reason: {
      en: "Existing industrial capability can support higher-value downstream production.",
      ar: "القدرات الصناعية القائمة قادرة على دعم إنتاج نهائي أعلى قيمة.",
    },
  },
  {
    id: "construction-minerals",
    sectorId: "non-metallic",
    sector: { en: "Non-metallic Mineral Products", ar: "منتجات المعادن اللافلزية" },
    productCategory: { en: "Construction Minerals", ar: "مواد البناء المعدنية" },
    importValue: 2.1e9,
    exportValue: 1.6e9,
    manufacturingValue: 4.4e9,
    domesticDemand: 5.4e9,
    localizationPotential: "low",
    recommendedCityId: "qassim",
    recommendedAction: { en: "Support export expansion", ar: "دعم التوسع التصديري" },
    reason: {
      en: "Strong domestic coverage with incremental export upside.",
      ar: "تغطية محلية قوية مع فرصة إضافية للنمو التصديري.",
    },
  },
  {
    id: "packaging-polymers",
    sectorId: "plastics",
    sector: { en: "Rubber & Plastic Products", ar: "المنتجات المطاطية والبلاستيكية" },
    productCategory: { en: "Packaging Polymers", ar: "البوليمرات التغليفية" },
    importValue: 3.3e9,
    exportValue: 2.2e9,
    manufacturingValue: 5.1e9,
    domesticDemand: 6.7e9,
    localizationPotential: "medium",
    recommendedCityId: "dammam-2",
    recommendedAction: { en: "Expand local capacity", ar: "توسيع الطاقة المحلية" },
    reason: {
      en: "Scale exists locally, but demand is still outpacing conversion capacity.",
      ar: "توجد قاعدة محلية جيدة لكن الطلب ما زال يتجاوز القدرة التحويلية.",
    },
  },
  {
    id: "wire-cable",
    sectorId: "electrical-equipment",
    sector: { en: "Electrical Equipment", ar: "المعدات الكهربائية" },
    productCategory: { en: "Wire & Cable Systems", ar: "أنظمة الأسلاك والكابلات" },
    importValue: 2.7e9,
    exportValue: 1.4e9,
    manufacturingValue: 3.7e9,
    domesticDemand: 5.1e9,
    localizationPotential: "medium",
    recommendedCityId: "jeddah-2",
    recommendedAction: { en: "Develop supplier ecosystem", ar: "تطوير منظومة الموردين" },
    reason: {
      en: "Good domestic base with room to deepen component localization.",
      ar: "قاعدة محلية جيدة مع مجال لتعميق توطين المكونات.",
    },
  },
  {
    id: "automotive-components",
    sectorId: "motor-vehicles",
    sector: { en: "Motor Vehicles & Trailers", ar: "المركبات والمقطورات" },
    productCategory: { en: "Automotive Components", ar: "مكونات المركبات" },
    importValue: 4.8e9,
    exportValue: 0.6e9,
    manufacturingValue: 1.1e9,
    domesticDemand: 5.2e9,
    localizationPotential: "high",
    recommendedCityId: "jeddah-2",
    recommendedAction: { en: "Attract manufacturers", ar: "استقطاب المصنعين" },
    reason: {
      en: "Large gap with strong investor-attraction potential.",
      ar: "فجوة كبيرة مع قابلية قوية لاستقطاب المستثمرين.",
    },
  },
  {
    id: "beverages",
    sectorId: "beverages",
    sector: { en: "Beverages", ar: "المشروبات" },
    productCategory: { en: "Beverages", ar: "المشروبات" },
    importValue: 1.8e9,
    exportValue: 1.1e9,
    manufacturingValue: 2.8e9,
    domesticDemand: 3.6e9,
    localizationPotential: "low",
    recommendedCityId: "medina",
    recommendedAction: { en: "Support export expansion", ar: "دعم التوسع التصديري" },
    reason: {
      en: "Domestic production is established and can scale regionally.",
      ar: "الإنتاج المحلي قائم ويمكن توسيعه إقليميًا.",
    },
  },
  {
    id: "paper-packaging",
    sectorId: "paper",
    sector: { en: "Paper & Paper Products", ar: "المنتجات الورقية" },
    productCategory: { en: "Paper Packaging", ar: "التغليف الورقي" },
    importValue: 2.4e9,
    exportValue: 0.9e9,
    manufacturingValue: 2.6e9,
    domesticDemand: 4.1e9,
    localizationPotential: "medium",
    recommendedCityId: "jazan",
    recommendedAction: { en: "Expand local capacity", ar: "توسيع الطاقة المحلية" },
    reason: {
      en: "Local manufacturing exists, but import substitution remains meaningful.",
      ar: "التصنيع المحلي موجود لكن إحلال الواردات ما زال مجديًا.",
    },
  },
  {
    id: "marine-equipment",
    sectorId: "transport-equipment",
    sector: { en: "Other Transport Equipment", ar: "معدات النقل الأخرى" },
    productCategory: { en: "Marine Equipment", ar: "المعدات البحرية" },
    importValue: 3.9e9,
    exportValue: 0.5e9,
    manufacturingValue: 0.7e9,
    domesticDemand: 4.0e9,
    localizationPotential: "high",
    recommendedCityId: "ras-al-khair",
    recommendedAction: { en: "Target foreign investment", ar: "استهداف الاستثمار الأجنبي" },
    reason: {
      en: "Heavy equipment demand aligns with coastal industrial capability.",
      ar: "طلب المعدات الثقيلة يتوافق مع القدرات الصناعية الساحلية.",
    },
  },
  {
    id: "steel-components",
    sectorId: "basic-metals",
    sector: { en: "Basic Metals", ar: "الصناعات المعدنية الأساسية" },
    productCategory: { en: "Steel Components", ar: "المكونات الفولاذية" },
    importValue: 3.4e9,
    exportValue: 1.9e9,
    manufacturingValue: 4.8e9,
    domesticDemand: 6.0e9,
    localizationPotential: "medium",
    recommendedCityId: "yanbu",
    recommendedAction: { en: "Develop supplier ecosystem", ar: "تطوير منظومة الموردين" },
    reason: {
      en: "Established base can capture more value-added conversion demand.",
      ar: "القاعدة القائمة قادرة على التقاط طلب إضافي ذي قيمة مضافة.",
    },
  },
];

function cityRegionId(cityId: string) {
  return CITY_REGIONS.find((item) => item.cityId === cityId)?.regionId ?? "riyadh";
}

function cityById(cityId: string) {
  return industrialCities.find((city) => city.id === cityId) ?? industrialCities[0];
}

function regionById(regionId: string) {
  return REGIONS.find((region) => region.id === regionId) ?? REGIONS[0];
}

const totalFactories = industrialCities.reduce((sum, city) => sum + city.factories, 0);

function cityShare(cityId: string) {
  const city = cityById(cityId);
  return city.factories / totalFactories;
}

function regionShare(regionId: string) {
  return industrialCities
    .filter((city) => cityRegionId(city.id) === regionId)
    .reduce((sum, city) => sum + city.factories, 0) / totalFactories;
}

function yearFactor(year: string) {
  return YEAR_FACTORS[year] ?? YEAR_FACTORS["2025"];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function severityFromCoverage(coverage: number): Severity {
  if (coverage < 0.3) return "critical";
  if (coverage < 0.55) return "high";
  return "moderate";
}

function gapStatusFor(product: ProductPreset): GapStatus {
  const localCoverage = product.manufacturingValue / product.domesticDemand;
  if (localCoverage >= 0.5 && product.exportValue >= product.importValue * 0.35) {
    return "exportedManufactured";
  }
  if (localCoverage >= 0.5) {
    return "manufacturedNotExported";
  }
  if (localCoverage < 0.25 && product.importValue > product.manufacturingValue) {
    return "importedNotManufactured";
  }
  return "emerging";
}

function opportunityScore(product: ProductPreset, regionBoost = 0) {
  const importDependency = product.importValue / Math.max(product.domesticDemand, 1);
  const localGap = 1 - product.manufacturingValue / Math.max(product.domesticDemand, 1);
  const exportPotential = product.exportValue / Math.max(product.domesticDemand, 1);
  const marketScale = product.domesticDemand / 13.2e9;
  const raw =
    importDependency * 34 +
    localGap * 32 +
    marketScale * 20 +
    exportPotential * 8 +
    regionBoost * 6;
  return clamp(Math.round(raw * 100), 24, 98);
}

export function parseCommandCenterFilters(
  raw: RawCommandCenterFilters
): CommandCenterFilters {
  const demand = parseFilters({
    period: raw.period,
    country: raw.country,
    flow: raw.flow,
  });

  const region = REGIONS.some((item) => item.id === raw.region) ? raw.region! : "all";
  const cityOptions = industrialCities
    .filter((city) => region === "all" || cityRegionId(city.id) === region)
    .map((city) => city.id);
  const industrialCity = cityOptions.includes(raw.industrialCity ?? "")
    ? raw.industrialCity!
    : "all";

  return {
    ...demand,
    region,
    industrialCity,
  };
}

function geographyFactor(filters: CommandCenterFilters) {
  if (filters.industrialCity !== "all") return cityShare(filters.industrialCity);
  if (filters.region !== "all") return regionShare(filters.region);
  return 1;
}

function yearFromPeriod(period: PeriodOption): string {
  if (period.kind === "year" && period.year) return String(period.year);
  return "2025";
}

function previousYear(year: string) {
  const index = YEARS.indexOf(year as (typeof YEARS)[number]);
  return index > 0 ? YEARS[index - 1] : null;
}

function flowFactor(flow: Flow) {
  return flow === "export" ? 0.92 : 1;
}

function countryFactor(country: string | null) {
  return country ? 0.78 : 1;
}

function formatSourceNote(): Bilingual {
  return {
    en: "Executive indicators are generated from the current static industrial snapshot and a temporary gap-analysis adapter isolated in the data layer.",
    ar: "المؤشرات التنفيذية مولدة من اللقطة الصناعية الحالية ومن موائم مؤقت لتحليل الفجوات معزول داخل طبقة البيانات.",
  };
}

export function loadCommandCenter(
  raw: RawCommandCenterFilters
): CommandCenterData {
  const filters = parseCommandCenterFilters(raw);
  const { periods, countries } = getDemandFilterOptions();
  const period = periods.find((item) => item.id === filters.period) ?? periods[0];
  const products = PRODUCT_PRESETS;
  const geoFactor =
    geographyFactor(filters) * flowFactor(filters.flow) * countryFactor(filters.country);
  const year = yearFromPeriod(period);
  const yearScale = yearFactor(year);
  const prevYear = previousYear(year);
  const prevScale = prevYear ? yearFactor(prevYear) : null;

  const totalExport = products.reduce((sum, product) => sum + product.exportValue, 0) * yearScale * geoFactor;
  const totalManufacturing =
    products.reduce((sum, product) => sum + product.manufacturingValue, 0) * yearScale * geoFactor;
  const totalImport = products.reduce((sum, product) => sum + product.importValue, 0) * yearScale * geoFactor;
  const totalDemand = products.reduce((sum, product) => sum + product.domesticDemand, 0) * yearScale * geoFactor;
  const totalOpportunity =
    products.reduce(
      (sum, product) => sum + Math.max(product.importValue - product.manufacturingValue, 0),
      0
    ) *
    yearScale *
    geoFactor;

  const prevExport =
    prevScale === null
      ? null
      : products.reduce((sum, product) => sum + product.exportValue, 0) * prevScale * geoFactor;
  const prevManufacturing =
    prevScale === null
      ? null
      : products.reduce((sum, product) => sum + product.manufacturingValue, 0) * prevScale * geoFactor;
  const prevImport =
    prevScale === null
      ? null
      : products.reduce((sum, product) => sum + product.importValue, 0) * prevScale * geoFactor;
  const prevOpportunity =
    prevScale === null
      ? null
      : products.reduce(
          (sum, product) => sum + Math.max(product.importValue - product.manufacturingValue, 0),
          0
        ) *
        prevScale *
        geoFactor;

  const manufacturingGaps: ManufacturingGap[] = products
    .map((product) => {
      const coverage = product.manufacturingValue / Math.max(product.domesticDemand, 1);
      const gapValue = Math.max(product.importValue - product.manufacturingValue, 0) * yearScale * geoFactor;
      return {
        id: product.id,
        industry: product.productCategory,
        sector: product.sector,
        importGapValue: gapValue,
        localCoverage: coverage,
        insight: product.reason,
        severity: severityFromCoverage(coverage),
      };
    })
    .sort((a, b) => b.importGapValue - a.importGapValue);

  const localizationOpportunities: LocalizationOpportunity[] = products
    .map((product) => {
      const recommendedCity = cityById(product.recommendedCityId);
      const region = regionById(cityRegionId(product.recommendedCityId));
      const regionBoost = region.readinessBase / 100;
      return {
        id: product.id,
        industry: product.productCategory,
        sector: product.sector,
        opportunityValue:
          Math.max(product.importValue - product.manufacturingValue, 0) *
          yearScale *
          (filters.region !== "all" && cityRegionId(product.recommendedCityId) !== filters.region
            ? 0.72
            : geoFactor),
        recommendedIndustrialCity: recommendedCity.name,
        opportunityScore: opportunityScore(product, regionBoost),
        recommendedAction: product.recommendedAction,
        localizationPotential: product.localizationPotential,
        reason: product.reason,
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore);

  const gapMatrix: GapMatrixItem[] = products.map((product) => ({
    id: product.id,
    productCategory: product.productCategory,
    sector: product.sector,
    exported: product.exportValue > 1e9,
    manufacturedLocally:
      product.manufacturingValue / Math.max(product.domesticDemand, 1) >= 0.35,
    imported: product.importValue > 0,
    gapStatus: gapStatusFor(product),
  }));

  const regionReadiness: RegionReadiness[] = REGIONS.map((region) => {
    const share = regionShare(region.id);
    const relatedCities = industrialCities.filter((city) => cityRegionId(city.id) === region.id);
    const avgPotentialScore =
      localizationOpportunities.length > 0
        ? localizationOpportunities
            .filter((item) => cityRegionId(PRODUCT_PRESETS.find((p) => p.id === item.id)?.recommendedCityId ?? "riyadh-2") === region.id)
            .reduce((sum, item) => sum + item.opportunityScore, 0) /
          Math.max(
            localizationOpportunities.filter(
              (item) =>
                cityRegionId(
                  PRODUCT_PRESETS.find((p) => p.id === item.id)?.recommendedCityId ?? "riyadh-2"
                ) === region.id
            ).length,
            1
          )
        : region.readinessBase;

    const score = clamp(Math.round(region.readinessBase * 0.65 + share * 100 * 0.35), 52, 94);
    return {
      id: region.id,
      name: region.name,
      score,
      outputValue: totalManufacturing * share,
      opportunityValue: totalOpportunity * Math.max(share, 0.08),
      severityScore: clamp(Math.round(100 - avgPotentialScore * 0.45), 38, 88),
      cityCount: relatedCities.length,
    };
  }).sort((a, b) => b.score - a.score);

  const mapPoints: MapPoint[] = industrialCities
    .filter((city) => filters.region === "all" || cityRegionId(city.id) === filters.region)
    .map((city) => {
      const region = regionById(cityRegionId(city.id));
      const share = cityShare(city.id);
      const cityOpportunity = localizationOpportunities
        .filter(
          (item) =>
            PRODUCT_PRESETS.find((product) => product.id === item.id)?.recommendedCityId === city.id
        )
        .reduce((sum, item) => sum + item.opportunityValue, 0);
      const readinessScore = clamp(
        Math.round(region.readinessBase * 0.72 + (city.factories / totalFactories) * 160),
        46,
        95
      );
      const severityScore = clamp(
        Math.round(100 - readinessScore * 0.45 + cityOpportunity / 1e9),
        35,
        92
      );
      return {
        id: city.id,
        cityId: city.id,
        regionId: region.id,
        city: city.name,
        region: region.name,
        coordinates: city.coordinates,
        outputValue: totalManufacturing * share * 2.4,
        opportunityValue: cityOpportunity || totalOpportunity * share * 1.1,
        severityScore,
        readinessScore,
      };
    });

  const mapSelection =
    filters.industrialCity !== "all"
      ? (() => {
          const point = mapPoints.find((item) => item.cityId === filters.industrialCity);
          return point
            ? {
                id: point.cityId,
                kind: "city" as const,
                name: point.city,
                severityScore: point.severityScore,
                outputValue: point.outputValue,
                opportunityValue: point.opportunityValue,
              }
            : null;
        })()
      : filters.region !== "all"
        ? (() => {
            const selected = regionReadiness.find((item) => item.id === filters.region);
            return selected
              ? {
                  id: selected.id,
                  kind: "region" as const,
                  name: selected.name,
                  severityScore: selected.severityScore,
                  outputValue: selected.outputValue,
                  opportunityValue: selected.opportunityValue,
                }
              : null;
          })()
        : null;

  const localizationSectorCount = new Set(
    localizationOpportunities
      .filter((item) => item.localizationPotential === "high")
      .map((item) => item.sector.en)
  ).size;
  const exportOpportunityValue = localizationOpportunities
    .filter((item) => item.opportunityScore >= 70)
    .reduce((sum, item) => sum + item.opportunityValue * 0.36, 0);
  const exportOpportunitySectorCount = new Set(
    localizationOpportunities
      .filter((item) => item.opportunityScore >= 70)
      .map((item) => item.sector.en)
  ).size;
  const exportOpportunityYoY =
    prevScale === null || exportOpportunityValue === 0
      ? null
      : (yearScale - prevScale) / prevScale;
  const selfSufficiency =
    totalDemand > 0 ? clamp(totalManufacturing / totalDemand, 0, 1) : null;
  const localizationScore =
    localizationOpportunities.length > 0
      ? Math.round(
          localizationOpportunities.reduce((sum, item) => sum + item.opportunityScore, 0) /
            localizationOpportunities.length
        )
      : null;

  const topGap = manufacturingGaps[0];
  const topOpportunity = localizationOpportunities[0];
  const topRegion = regionReadiness[0];
  const improvingSector = products
    .slice()
    .sort((a, b) => b.exportValue / b.domesticDemand - a.exportValue / a.domesticDemand)[0];

  const highlights: Highlight[] = [
    topGap && {
      id: "largest-gap",
      title: {
        en: `${topGap.industry.en} represents the largest manufacturing gap`,
        ar: `${topGap.industry.ar} تمثل أكبر فجوة تصنيعية`,
      },
      description: {
        en: `${topGap.sector.en} shows only ${Math.round(topGap.localCoverage * 100)}% local coverage under the current selection.`,
        ar: `يُظهر قطاع ${topGap.sector.ar} تغطية محلية عند ${Math.round(topGap.localCoverage * 100)}% فقط ضمن التحديد الحالي.`,
      },
      tone: "warning" as const,
    },
    topOpportunity && {
      id: "top-opportunity",
      title: {
        en: `${topOpportunity.recommendedIndustrialCity.en} leads the localization pipeline`,
        ar: `${topOpportunity.recommendedIndustrialCity.ar} تقود مسار التوطين`,
      },
      description: {
        en: `${topOpportunity.industry.en} scores ${topOpportunity.opportunityScore}/100 for targeted action.`,
        ar: `${topOpportunity.industry.ar} يحقق ${topOpportunity.opportunityScore}/100 كأولوية للتدخل.`,
      },
      tone: "positive" as const,
    },
    topRegion && {
      id: "top-region",
      title: {
        en: `${topRegion.name.en} ranks highest for industrial readiness`,
        ar: `${topRegion.name.ar} تتصدر الجاهزية الصناعية`,
      },
      description: {
        en: `${topRegion.cityCount} industrial cities support a readiness score of ${topRegion.score}/100.`,
        ar: `${topRegion.cityCount} مدن صناعية تدعم درجة جاهزية تبلغ ${topRegion.score}/100.`,
      },
      tone: "neutral" as const,
    },
    improvingSector && prevYear && {
      id: "improving-sector",
      title: {
        en: `${improvingSector.sector.en} continues to improve coverage`,
        ar: `${improvingSector.sector.ar} يواصل تحسين التغطية`,
      },
      description: {
        en: `The selected year sits ${Math.round((yearScale - prevScale!) * 100)} points above ${prevYear}, improving export upside.`,
        ar: `الفترة المحددة أعلى من ${prevYear} بنحو ${Math.round((yearScale - prevScale!) * 100)} نقطة، ما يدعم فرص التصدير.`,
      },
      tone: "positive" as const,
    },
  ].filter(Boolean) as Highlight[];

  return {
    filters,
    periods,
    countries,
    kpis: [
      {
        label: "totalExportValue",
        value: totalExport,
        previousValue: prevExport,
        format: "currency",
      },
      {
        label: "totalManufacturingValue",
        value: totalManufacturing,
        previousValue: prevManufacturing,
        format: "currency",
      },
      {
        label: "totalImportValue",
        value: totalImport,
        previousValue: prevImport,
        format: "currency",
      },
      {
        label: "manufacturingGaps",
        value: manufacturingGaps.length,
        previousValue: prevOpportunity === null ? null : manufacturingGaps.length,
        format: "integer",
      },
      {
        label: "localizationScore",
        value: localizationScore,
        previousValue: localizationScore && prevScale ? Math.round(localizationScore * (prevScale / yearScale)) : null,
        format: "score",
      },
      {
        label: "priorityOpportunities",
        value: localizationOpportunities.filter((item) => item.opportunityScore >= 70).length,
        previousValue:
          prevScale === null
            ? null
            : Math.max(
                0,
                localizationOpportunities.filter((item) => item.opportunityScore >= 70).length - 1
              ),
        format: "integer",
      },
    ],
    pulse: {
      selfSufficiency,
      localizationPotentialValue: totalOpportunity,
      localizationSectorCount,
      exportOpportunityValue,
      exportOpportunitySectorCount,
      exportOpportunityYoY,
    },
    highlights,
    regionReadiness,
    criticalGaps: manufacturingGaps.slice(0, 5),
    manufacturingGaps: manufacturingGaps.slice(0, 10),
    localizationOpportunities: localizationOpportunities.slice(0, 10),
    gapMatrix,
    opportunities: localizationOpportunities.slice(0, 20).map((item) => ({
      id: item.id,
      industry: item.industry,
      opportunityScore: item.opportunityScore,
      reason: item.reason,
    })),
    mapPoints,
    mapSelection,
    sourceNote: formatSourceNote(),
    usesMockAdapter: true,
  };
}

export function commandCenterSummary() {
  return {
    sectorCount: industrySummary.top.length + industrySummary.bottom.length,
    cityCount: industrialCities.length,
  };
}

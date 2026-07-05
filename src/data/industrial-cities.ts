/**
 * Representative MODON industrial cities for the map layer.
 * Coordinates are approximate city-centre points; factory counts are illustrative
 * placeholders until live GIS data is wired in.
 */

export type IndustrialCity = {
  id: string;
  coordinates: [longitude: number, latitude: number];
  factories: number;
  name: { en: string; ar: string };
};

export const industrialCities: IndustrialCity[] = [
  {
    id: "riyadh-2",
    coordinates: [46.75, 24.65],
    factories: 1240,
    name: { en: "Riyadh 2nd Industrial City", ar: "الرياض الثانية" },
  },
  {
    id: "jeddah-2",
    coordinates: [39.2, 21.48],
    factories: 980,
    name: { en: "Jeddah 2nd Industrial City", ar: "جدة الثانية" },
  },
  {
    id: "dammam-2",
    coordinates: [49.95, 26.38],
    factories: 720,
    name: { en: "Dammam 2nd Industrial City", ar: "الدمام الثانية" },
  },
  {
    id: "jubail",
    coordinates: [49.65, 27.0],
    factories: 610,
    name: { en: "Jubail Industrial City", ar: "الجبيل الصناعية" },
  },
  {
    id: "yanbu",
    coordinates: [38.05, 24.05],
    factories: 430,
    name: { en: "Yanbu Industrial City", ar: "ينبع الصناعية" },
  },
  {
    id: "ras-al-khair",
    coordinates: [49.15, 27.55],
    factories: 185,
    name: { en: "Ras Al-Khair Industrial City", ar: "رأس الخير" },
  },
  {
    id: "qassim",
    coordinates: [43.95, 26.35],
    factories: 210,
    name: { en: "Qassim Industrial City", ar: "القصيم الصناعية" },
  },
  {
    id: "hail",
    coordinates: [41.7, 27.55],
    factories: 95,
    name: { en: "Hail Industrial City", ar: "حائل الصناعية" },
  },
  {
    id: "jazan",
    coordinates: [42.55, 16.89],
    factories: 140,
    name: { en: "Jazan Industrial City", ar: "جازان الصناعية" },
  },
  {
    id: "tabuk",
    coordinates: [36.58, 28.4],
    factories: 88,
    name: { en: "Tabuk Industrial City", ar: "تبوك الصناعية" },
  },
  {
    id: "medina",
    coordinates: [39.61, 24.47],
    factories: 165,
    name: { en: "Medina Industrial City", ar: "المدينة الصناعية" },
  },
  {
    id: "kharj",
    coordinates: [47.31, 24.15],
    factories: 320,
    name: { en: "Kharj Industrial City", ar: "الخرج الصناعية" },
  },
];

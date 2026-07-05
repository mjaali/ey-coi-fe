/**
 * Static snapshot of the MODON industrial base, ranked by number of factories.
 *
 * These figures were derived from MODON's GIS layers (parcel layer 105 and
 * utility network 77). The raw GIS data is intentionally not part of this
 * front-end; the summarised values below are hard-coded so the page stays
 * fully static and dependency-free.
 */

export type Industry = {
  code: number;
  count: number;
  share: number;
  cities: number;
  coverage: number;
  name: { en: string; ar: string };
};

export type IndustrySummary = {
  totals: {
    factories: number;
    sectors: number;
    cities: number;
    networkKm: number;
  };
  top: Industry[];
  bottom: Industry[];
};

export const industrySummary: IndustrySummary = {
  totals: {
    factories: 7341,
    sectors: 22,
    cities: 36,
    networkKm: 48.7,
  },
  top: [
    {
      code: 905,
      count: 1537,
      share: 0.20937202016074105,
      cities: 33,
      coverage: 0.9166666666666666,
      name: { en: "Food Products", ar: "المنتجات الغذائية" },
    },
    {
      code: 916,
      count: 817,
      share: 0.11129273940879988,
      cities: 31,
      coverage: 0.8611111111111112,
      name: {
        en: "Rubber & Plastic Products",
        ar: "المنتجات المطاطية والبلاستيكية",
      },
    },
    {
      code: 919,
      count: 738,
      share: 0.10053126277073968,
      cities: 29,
      coverage: 0.8055555555555556,
      name: {
        en: "Fabricated Metal Products",
        ar: "المنتجات المعدنية المصنّعة",
      },
    },
    {
      code: 914,
      count: 725,
      share: 0.09876038686827408,
      cities: 34,
      coverage: 0.9444444444444444,
      name: { en: "Chemicals & Chemical Products", ar: "المواد الكيميائية" },
    },
    {
      code: 917,
      count: 546,
      share: 0.07437678790355537,
      cities: 31,
      coverage: 0.8611111111111112,
      name: {
        en: "Non-metallic Mineral Products",
        ar: "منتجات المعادن اللافلزية",
      },
    },
    {
      code: 926,
      count: 482,
      share: 0.06565862961449394,
      cities: 30,
      coverage: 0.8333333333333334,
      name: { en: "Other Manufacturing", ar: "الصناعات التحويلية الأخرى" },
    },
    {
      code: 918,
      count: 375,
      share: 0.05108295872496935,
      cities: 22,
      coverage: 0.6111111111111112,
      name: { en: "Basic Metals", ar: "الصناعات المعدنية الأساسية" },
    },
    {
      code: 921,
      count: 352,
      share: 0.0479498705898379,
      cities: 24,
      coverage: 0.6666666666666666,
      name: { en: "Electrical Equipment", ar: "المعدات الكهربائية" },
    },
    {
      code: 911,
      count: 292,
      share: 0.0397765971938428,
      cities: 30,
      coverage: 0.8333333333333334,
      name: { en: "Paper & Paper Products", ar: "المنتجات الورقية" },
    },
    {
      code: 906,
      count: 284,
      share: 0.03868682740771012,
      cities: 30,
      coverage: 0.8333333333333334,
      name: { en: "Beverages", ar: "المشروبات" },
    },
  ],
  bottom: [
    {
      code: 924,
      count: 13,
      share: 0.001770875902465604,
      cities: 8,
      coverage: 0.2222222222222222,
      name: { en: "Other Transport Equipment", ar: "معدات النقل الأخرى" },
    },
    {
      code: 909,
      count: 19,
      share: 0.002588203242065114,
      cities: 10,
      coverage: 0.2777777777777778,
      name: { en: "Leather & Related Products", ar: "المنتجات الجلدية" },
    },
    {
      code: 923,
      count: 53,
      share: 0.007219724833129002,
      cities: 16,
      coverage: 0.4444444444444444,
      name: { en: "Motor Vehicles & Trailers", ar: "المركبات والمقطورات" },
    },
  ],
};

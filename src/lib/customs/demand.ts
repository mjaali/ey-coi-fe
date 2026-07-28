import {
  type Bilingual,
  chapterName,
  cityName,
  countryArFromCode,
  countryInfo,
  flagEmoji,
  portInfo,
  type PortMode,
} from "./dictionaries";
import {
  type Cube,
  getCube,
  monthIndex,
  monthOf,
  type Table,
  yearOf,
} from "./rollup";

/* -------------------------------------------------------------------------- */
/* Filters                                                                      */
/* -------------------------------------------------------------------------- */

export type Flow = "import" | "export";

/** "all", "ttm" (trailing twelve months) or a four-digit year. */
export type PeriodId = string;

export type DemandFilters = {
  period: PeriodId;
  /** ISO alpha-2 (or fallback slug) of the counterparty country, if filtered. */
  country: string | null;
  flow: Flow;
};

export type RawFilters = {
  period?: string;
  country?: string;
  flow?: string;
};

export type PeriodOption = {
  id: PeriodId;
  kind: "all" | "ttm" | "year";
  year?: number;
  /** True when the year is not yet complete in the data. */
  partial: boolean;
  fromMonth: number;
  toMonth: number;
  fromYear: number;
  toYear: number;
};

export type CountryOption = {
  code: string;
  name: Bilingual;
  flag: string;
  /** Import weight over the full dataset, used to order the picker. */
  kg: number;
};

/* -------------------------------------------------------------------------- */
/* Result shape                                                                 */
/* -------------------------------------------------------------------------- */

export type Measure = { declarations: number; kg: number };

export type Comparison = {
  current: Measure;
  previous: Measure | null;
  /** Fractional change vs the previous window; null when not comparable. */
  deltaKg: number | null;
  deltaDeclarations: number | null;
};

export type RankRow = {
  key: string;
  label: Bilingual;
  /** Set for country rows so the UI can link straight into the filter. */
  code?: string;
  flag?: string;
  current: Measure;
  previous: Measure | null;
  deltaKg: number | null;
  /** Share of the window total for this dimension, 0..1. */
  share: number;
  avgShipmentKg: number;
};

export type SeriesPoint = {
  t: number;
  year: number;
  month: number;
  kg: number;
  declarations: number;
  /** Aligned value from the comparison window, for the overlay line. */
  priorKg: number | null;
};

export type ModeSplit = { mode: PortMode; kg: number; share: number };

export type Concentration = {
  /** "country" normally, "chapter" when a single country is already selected. */
  basis: "country" | "chapter";
  hhi: number;
  band: "low" | "moderate" | "high";
  topShare: number;
  topN: number;
  leader: Bilingual | null;
  leaderShare: number;
  members: number;
};

export type Insight =
  | {
      kind: "concentration";
      tone: Tone;
      basis: Concentration["basis"];
      band: Concentration["band"];
      topN: number;
      topShare: number;
      leader: Bilingual | null;
      leaderShare: number;
    }
  | {
      kind: "momentum";
      tone: Tone;
      name: Bilingual;
      deltaKg: number;
      kg: number;
    }
  | {
      kind: "decline";
      tone: Tone;
      name: Bilingual;
      deltaKg: number;
      kg: number;
    }
  | { kind: "peak"; tone: Tone; year: number; month: number; kg: number }
  | {
      kind: "balance";
      tone: Tone;
      importKg: number;
      exportKg: number;
      netKg: number;
      coverage: number;
    }
  | { kind: "modal"; tone: Tone; mode: PortMode; share: number }
  | {
      kind: "shipment";
      tone: Tone;
      avgKg: number;
      benchmarkKg: number;
      ratio: number;
    }
  | {
      kind: "product";
      tone: Tone;
      name: Bilingual;
      share: number;
      kg: number;
    }
  | {
      kind: "countryRank";
      tone: Tone;
      name: Bilingual;
      rank: number;
      total: number;
      share: number;
    }
  | { kind: "importers"; tone: Tone; count: number; delta: number | null };

export type Tone = "positive" | "negative" | "neutral" | "warning";

export type CountryProfile = {
  code: string;
  name: Bilingual;
  flag: string;
  rank: number;
  totalCountries: number;
  share: number;
  importKg: number;
  exportKg: number;
  netKg: number;
  topChapters: RankRow[];
  topCities: RankRow[];
  importers: number;
};

export type DemandData = {
  filters: DemandFilters;
  period: PeriodOption;
  periods: PeriodOption[];
  countries: CountryOption[];
  /** Absolute month bounds of the resolved window, for labelling. */
  window: { fromYear: number; fromMonth: number; toYear: number; toMonth: number };
  priorWindow: {
    fromYear: number;
    fromMonth: number;
    toYear: number;
    toMonth: number;
  } | null;
  headline: Comparison;
  importTotals: Measure;
  exportTotals: Measure;
  importers: { current: number; previous: number | null };
  avgShipmentKg: number;
  activeCities: number;
  activeCountries: number;
  series: SeriesPoint[];
  countriesRank: RankRow[];
  cities: RankRow[];
  chapters: RankRow[];
  ports: RankRow[];
  modeSplit: ModeSplit[];
  concentration: Concentration;
  insights: Insight[];
  countryProfile: CountryProfile | null;
  recordCount: number;
};

/* -------------------------------------------------------------------------- */
/* Window resolution                                                            */
/* -------------------------------------------------------------------------- */

type Window = { from: number; to: number };

function buildPeriodOptions(cube: Cube): PeriodOption[] {
  const describe = (
    id: PeriodId,
    kind: PeriodOption["kind"],
    win: Window,
    year?: number
  ): PeriodOption => ({
    id,
    kind,
    year,
    partial:
      kind === "year" &&
      (monthOf(win.from) !== 1 || monthOf(win.to) !== 12),
    fromMonth: monthOf(win.from),
    toMonth: monthOf(win.to),
    fromYear: yearOf(win.from),
    toYear: yearOf(win.to),
  });

  const options: PeriodOption[] = [
    describe("all", "all", { from: cube.minT, to: cube.maxT }),
  ];

  if (cube.maxT - cube.minT >= 11) {
    options.push(
      describe("ttm", "ttm", { from: cube.maxT - 11, to: cube.maxT })
    );
  }

  for (const year of [...cube.years].reverse()) {
    const win = {
      from: Math.max(cube.minT, monthIndex(year, 1)),
      to: Math.min(cube.maxT, monthIndex(year, 12)),
    };
    options.push(describe(String(year), "year", win, year));
  }

  return options;
}

function windowFor(option: PeriodOption): Window {
  return {
    from: monthIndex(option.fromYear, option.fromMonth),
    to: monthIndex(option.toYear, option.toMonth),
  };
}

/**
 * The comparison window is the equivalent stretch immediately before the
 * selected one, so a partial year (e.g. Jan–May 2026) is measured against the
 * same months a year earlier rather than against a full twelve months.
 */
function priorWindowFor(
  option: PeriodOption,
  cube: Cube
): Window | null {
  const win = windowFor(option);

  if (option.kind === "all") return null;

  const prior: Window =
    option.kind === "year"
      ? {
          from: monthIndex(option.fromYear - 1, option.fromMonth),
          to: monthIndex(option.toYear - 1, option.toMonth),
        }
      : {
          from: win.from - (win.to - win.from + 1),
          to: win.from - 1,
        };

  return prior.from < cube.minT ? null : prior;
}

/* -------------------------------------------------------------------------- */
/* Cube aggregation                                                             */
/* -------------------------------------------------------------------------- */

type Slot = { curD: number; curKg: number; prevD: number; prevKg: number };

type Aggregated = {
  total: Slot;
  byMember: Map<number, Slot>;
};

function emptySlot(): Slot {
  return { curD: 0, curKg: 0, prevD: 0, prevKg: 0 };
}

/**
 * Single pass over a table accumulating the selected window and its comparison
 * window at once, optionally narrowed to one counterparty country and flow.
 */
function aggregate(
  table: Table,
  opts: {
    countryId: number | null;
    imp: number | null;
    cur: Window;
    prev: Window | null;
    /** Skip the per-member map when only totals are needed. */
    membersNeeded?: boolean;
  }
): Aggregated {
  const { countryId, imp, cur, prev, membersNeeded = true } = opts;
  const total = emptySlot();
  const byMember = new Map<number, Slot>();

  for (let r = 0; r < table.t.length; r++) {
    if (countryId !== null && table.country[r] !== countryId) continue;
    if (imp !== null && table.imp[r] !== imp) continue;

    const t = table.t[r];
    const inCur = t >= cur.from && t <= cur.to;
    const inPrev = prev !== null && t >= prev.from && t <= prev.to;
    if (!inCur && !inPrev) continue;

    const d = table.declarations[r];
    const kg = table.kg[r];

    let slot: Slot | undefined;
    if (membersNeeded) {
      const key = table.member[r];
      slot = byMember.get(key);
      if (!slot) {
        slot = emptySlot();
        byMember.set(key, slot);
      }
    }

    if (inCur) {
      total.curD += d;
      total.curKg += kg;
      if (slot) {
        slot.curD += d;
        slot.curKg += kg;
      }
    } else {
      total.prevD += d;
      total.prevKg += kg;
      if (slot) {
        slot.prevD += d;
        slot.prevKg += kg;
      }
    }
  }

  return { total, byMember };
}

/** Distinct member count (used for active importers / cities) in one window. */
function distinctMembers(
  table: Table,
  opts: { countryId: number | null; imp: number | null; win: Window }
): number {
  const { countryId, imp, win } = opts;
  const seen = new Set<number>();
  for (let r = 0; r < table.t.length; r++) {
    if (countryId !== null && table.country[r] !== countryId) continue;
    if (imp !== null && table.imp[r] !== imp) continue;
    const t = table.t[r];
    if (t < win.from || t > win.to) continue;
    seen.add(table.member[r]);
  }
  return seen.size;
}

function pctChange(current: number, previous: number | null): number | null {
  if (previous === null || previous <= 0) return null;
  return (current - previous) / previous;
}

function toComparison(slot: Slot, hasPrev: boolean): Comparison {
  const current = { declarations: slot.curD, kg: slot.curKg };
  const previous = hasPrev
    ? { declarations: slot.prevD, kg: slot.prevKg }
    : null;
  return {
    current,
    previous,
    deltaKg: pctChange(slot.curKg, previous?.kg ?? null),
    deltaDeclarations: pctChange(
      slot.curD,
      previous?.declarations ?? null
    ),
  };
}

function toRankRows(
  aggregated: Aggregated,
  table: Table,
  hasPrev: boolean,
  label: (member: string) => {
    label: Bilingual;
    code?: string;
    flag?: string;
  },
  limit: number
): RankRow[] {
  const totalKg = aggregated.total.curKg;

  return [...aggregated.byMember.entries()]
    .map(([memberId, slot]) => {
      const member = table.members[memberId];
      const meta = label(member);
      return {
        key: member,
        ...meta,
        current: { declarations: slot.curD, kg: slot.curKg },
        previous: hasPrev
          ? { declarations: slot.prevD, kg: slot.prevKg }
          : null,
        deltaKg: pctChange(slot.curKg, hasPrev ? slot.prevKg : null),
        share: totalKg > 0 ? slot.curKg / totalKg : 0,
        avgShipmentKg: slot.curD > 0 ? slot.curKg / slot.curD : 0,
      } satisfies RankRow;
    })
    .filter((row) => row.current.kg > 0 || row.current.declarations > 0)
    .sort((a, b) => b.current.kg - a.current.kg)
    .slice(0, limit);
}

/* -------------------------------------------------------------------------- */
/* Filter parsing                                                               */
/* -------------------------------------------------------------------------- */

export function parseFilters(raw: RawFilters): DemandFilters {
  const cube = getCube();
  const periods = buildPeriodOptions(cube);
  const period = periods.some((p) => p.id === raw.period)
    ? (raw.period as PeriodId)
    : "all";
  const flow: Flow = raw.flow === "export" ? "export" : "import";

  let country: string | null = null;
  if (raw.country) {
    const ar = countryArFromCode(raw.country);
    if (ar && cube.geo.countryIndex.has(ar)) {
      country = countryInfo(ar).code;
    }
  }

  return { period, country, flow };
}

/** Shared filter options for any page that reuses the demand FilterBar. */
export function getDemandFilterOptions(): {
  periods: PeriodOption[];
  countries: CountryOption[];
} {
  const cube = getCube();
  return {
    periods: buildPeriodOptions(cube),
    countries: buildCountryOptions(cube),
  };
}

/* -------------------------------------------------------------------------- */
/* Insights                                                                     */
/* -------------------------------------------------------------------------- */

function concentrationBand(hhi: number): Concentration["band"] {
  if (hhi >= 2500) return "high";
  if (hhi >= 1500) return "moderate";
  return "low";
}

function buildConcentration(
  rows: Array<{ label: Bilingual; kg: number }>,
  total: number,
  basis: Concentration["basis"]
): Concentration {
  const positive = rows.filter((r) => r.kg > 0);
  const hhi =
    total > 0
      ? positive.reduce((acc, r) => acc + (r.kg / total) ** 2, 0) * 10_000
      : 0;
  const sorted = [...positive].sort((a, b) => b.kg - a.kg);
  const topN = Math.min(5, sorted.length);
  const topShare =
    total > 0
      ? sorted.slice(0, topN).reduce((acc, r) => acc + r.kg, 0) / total
      : 0;

  return {
    basis,
    hhi: Math.round(hhi),
    band: concentrationBand(hhi),
    topShare,
    topN,
    leader: sorted[0]?.label ?? null,
    leaderShare: total > 0 && sorted[0] ? sorted[0].kg / total : 0,
    members: positive.length,
  };
}

/** Movers need a meaningful base so a 2t → 20t jump does not top the list. */
function pickMover(rows: RankRow[], direction: "up" | "down"): RankRow | null {
  const totalKg = rows.reduce((acc, r) => acc + r.current.kg, 0);
  const floor = totalKg * 0.01;
  const candidates = rows.filter(
    (r) =>
      r.deltaKg !== null &&
      r.current.kg >= floor &&
      (direction === "up" ? r.deltaKg > 0 : r.deltaKg < 0)
  );
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) =>
    direction === "up"
      ? (b.deltaKg ?? 0) - (a.deltaKg ?? 0)
      : (a.deltaKg ?? 0) - (b.deltaKg ?? 0)
  )[0];
}

/* -------------------------------------------------------------------------- */
/* Main loader                                                                  */
/* -------------------------------------------------------------------------- */

export function loadDemand(raw: RawFilters): DemandData {
  const cube = getCube();
  const filters = parseFilters(raw);
  const periods = buildPeriodOptions(cube);
  const period = periods.find((p) => p.id === filters.period) ?? periods[0];
  const cur = windowFor(period);
  const prev = priorWindowFor(period, cube);
  const hasPrev = prev !== null;

  const countryAr = filters.country
    ? countryArFromCode(filters.country)
    : null;
  const countryId =
    countryAr !== null
      ? (cube.geo.countryIndex.get(countryAr) ?? null)
      : null;
  const imp = filters.flow === "import" ? 1 : 0;

  /** Same country resolved per table, since each interns its own strings. */
  const idIn = (table: Table) =>
    countryAr === null ? null : (table.countryIndex.get(countryAr) ?? -1);

  /* ---- Headline totals -------------------------------------------------- */

  const geoSelected = aggregate(cube.geo, {
    countryId,
    imp,
    cur,
    prev,
    membersNeeded: false,
  });
  const headline = toComparison(geoSelected.total, hasPrev);

  const geoImports = aggregate(cube.geo, {
    countryId,
    imp: 1,
    cur,
    prev: null,
    membersNeeded: false,
  });
  const geoExports = aggregate(cube.geo, {
    countryId,
    imp: 0,
    cur,
    prev: null,
    membersNeeded: false,
  });

  const importTotals: Measure = {
    declarations: geoImports.total.curD,
    kg: geoImports.total.curKg,
  };
  const exportTotals: Measure = {
    declarations: geoExports.total.curD,
    kg: geoExports.total.curKg,
  };

  /* ---- Monthly series --------------------------------------------------- */

  const byMonth = new Map<number, { kg: number; d: number }>();
  for (let r = 0; r < cube.geo.t.length; r++) {
    if (countryId !== null && cube.geo.country[r] !== countryId) continue;
    if (cube.geo.imp[r] !== imp) continue;
    const t = cube.geo.t[r];
    const slot = byMonth.get(t) ?? { kg: 0, d: 0 };
    slot.kg += cube.geo.kg[r];
    slot.d += cube.geo.declarations[r];
    byMonth.set(t, slot);
  }

  const series: SeriesPoint[] = [];
  for (let t = cur.from; t <= cur.to; t++) {
    const point = byMonth.get(t) ?? { kg: 0, d: 0 };
    const priorT = prev ? prev.from + (t - cur.from) : null;
    const priorPoint =
      priorT !== null ? (byMonth.get(priorT)?.kg ?? 0) : null;
    series.push({
      t,
      year: yearOf(t),
      month: monthOf(t),
      kg: point.kg,
      declarations: point.d,
      priorKg: priorPoint,
    });
  }

  /* ---- Rankings --------------------------------------------------------- */

  const countriesAgg = aggregate(cube.geo, {
    countryId: null,
    imp,
    cur,
    prev,
  });
  // The geo table has a single empty member, so counterparties are grouped by
  // the country column instead.
  const countrySlots = new Map<number, Slot>();
  for (let r = 0; r < cube.geo.t.length; r++) {
    if (cube.geo.imp[r] !== imp) continue;
    const t = cube.geo.t[r];
    const inCur = t >= cur.from && t <= cur.to;
    const inPrev = prev !== null && t >= prev.from && t <= prev.to;
    if (!inCur && !inPrev) continue;

    const key = cube.geo.country[r];
    let slot = countrySlots.get(key);
    if (!slot) {
      slot = emptySlot();
      countrySlots.set(key, slot);
    }
    if (inCur) {
      slot.curD += cube.geo.declarations[r];
      slot.curKg += cube.geo.kg[r];
    } else {
      slot.prevD += cube.geo.declarations[r];
      slot.prevKg += cube.geo.kg[r];
    }
  }

  const allCountryTotalKg = countriesAgg.total.curKg;
  const countriesRankAll: RankRow[] = [...countrySlots.entries()]
    .map(([id, slot]) => {
      const ar = cube.geo.countries[id];
      const info = countryInfo(ar);
      return {
        key: ar,
        label: { en: info.en, ar: info.ar },
        code: info.code,
        flag: flagEmoji(info),
        current: { declarations: slot.curD, kg: slot.curKg },
        previous: hasPrev
          ? { declarations: slot.prevD, kg: slot.prevKg }
          : null,
        deltaKg: pctChange(slot.curKg, hasPrev ? slot.prevKg : null),
        share: allCountryTotalKg > 0 ? slot.curKg / allCountryTotalKg : 0,
        avgShipmentKg: slot.curD > 0 ? slot.curKg / slot.curD : 0,
      } satisfies RankRow;
    })
    .filter((row) => row.current.kg > 0 || row.current.declarations > 0)
    .sort((a, b) => b.current.kg - a.current.kg);

  const cityAgg = aggregate(cube.city, {
    countryId: idIn(cube.city),
    imp,
    cur,
    prev,
  });
  // Full list feeds the map; rank panels slice to a short leaderboard.
  const cities = toRankRows(cityAgg, cube.city, hasPrev, (m) => ({
    label: cityName(m),
  }), 50);

  const chapterAgg = aggregate(cube.chapter, {
    countryId: idIn(cube.chapter),
    imp,
    cur,
    prev,
  });
  const chapters = toRankRows(chapterAgg, cube.chapter, hasPrev, (m) => {
    const name = chapterName(m);
    return { label: { en: `${m} · ${name.en}`, ar: `${m} · ${name.ar}` } };
  }, 12);

  const portAgg = aggregate(cube.port, {
    countryId: idIn(cube.port),
    imp,
    cur,
    prev,
  });
  const ports = toRankRows(portAgg, cube.port, hasPrev, (m) => {
    const info = portInfo(m);
    return { label: { en: info.en, ar: info.ar } };
  }, 10);

  /* ---- Modal split ------------------------------------------------------ */

  const modeTotals = new Map<PortMode, number>();
  let modeTotalKg = 0;
  for (const [memberId, slot] of portAgg.byMember) {
    const mode = portInfo(cube.port.members[memberId]).mode;
    modeTotals.set(mode, (modeTotals.get(mode) ?? 0) + slot.curKg);
    modeTotalKg += slot.curKg;
  }
  const modeSplit: ModeSplit[] = (["sea", "land", "air"] as PortMode[])
    .map((mode) => {
      const kg = modeTotals.get(mode) ?? 0;
      return { mode, kg, share: modeTotalKg > 0 ? kg / modeTotalKg : 0 };
    })
    .filter((m) => m.kg > 0);

  /* ---- Importers & coverage --------------------------------------------- */

  const importerTable = cube.importer;
  const importersCurrent = distinctMembers(importerTable, {
    countryId: idIn(importerTable),
    imp,
    win: cur,
  });
  const importersPrevious = prev
    ? distinctMembers(importerTable, {
        countryId: idIn(importerTable),
        imp,
        win: prev,
      })
    : null;

  const activeCities = distinctMembers(cube.city, {
    countryId: idIn(cube.city),
    imp,
    win: cur,
  });
  const activeCountries = countriesRankAll.length;

  /* ---- Concentration ---------------------------------------------------- */

  const concentration = countryId
    ? buildConcentration(
        [...chapterAgg.byMember.entries()].map(([id, slot]) => {
          const name = chapterName(cube.chapter.members[id]);
          return { label: name, kg: slot.curKg };
        }),
        chapterAgg.total.curKg,
        "chapter"
      )
    : buildConcentration(
        countriesRankAll.map((r) => ({ label: r.label, kg: r.current.kg })),
        allCountryTotalKg,
        "country"
      );

  /* ---- Country profile -------------------------------------------------- */

  let countryProfile: CountryProfile | null = null;
  if (countryAr && filters.country) {
    const info = countryInfo(countryAr);
    const rank =
      countriesRankAll.findIndex((r) => r.key === countryAr) + 1 || 0;
    const selected = countriesRankAll.find((r) => r.key === countryAr);
    countryProfile = {
      code: info.code,
      name: { en: info.en, ar: info.ar },
      flag: flagEmoji(info),
      rank,
      totalCountries: countriesRankAll.length,
      share: selected?.share ?? 0,
      importKg: importTotals.kg,
      exportKg: exportTotals.kg,
      netKg: exportTotals.kg - importTotals.kg,
      topChapters: chapters.slice(0, 6),
      topCities: cities.slice(0, 6),
      importers: importersCurrent,
    };
  }

  /* ---- Insights --------------------------------------------------------- */

  const avgShipmentKg =
    headline.current.declarations > 0
      ? headline.current.kg / headline.current.declarations
      : 0;

  const benchmarkShipmentKg =
    countriesAgg.total.curD > 0
      ? countriesAgg.total.curKg / countriesAgg.total.curD
      : 0;

  const insights: Insight[] = [];

  if (countryProfile) {
    insights.push({
      kind: "countryRank",
      tone: "neutral",
      name: countryProfile.name,
      rank: countryProfile.rank,
      total: countryProfile.totalCountries,
      share: countryProfile.share,
    });
  }

  if (concentration.leader) {
    insights.push({
      kind: "concentration",
      tone: concentration.band === "high" ? "warning" : "neutral",
      basis: concentration.basis,
      band: concentration.band,
      topN: concentration.topN,
      topShare: concentration.topShare,
      leader: concentration.leader,
      leaderShare: concentration.leaderShare,
    });
  }

  const moverPool = countryId ? chapters : countriesRankAll;
  const riser = hasPrev ? pickMover(moverPool, "up") : null;
  if (riser?.deltaKg != null) {
    insights.push({
      kind: "momentum",
      tone: "positive",
      name: riser.label,
      deltaKg: riser.deltaKg,
      kg: riser.current.kg,
    });
  }

  const faller = hasPrev ? pickMover(moverPool, "down") : null;
  if (faller?.deltaKg != null) {
    insights.push({
      kind: "decline",
      tone: "negative",
      name: faller.label,
      deltaKg: faller.deltaKg,
      kg: faller.current.kg,
    });
  }

  const peak = series.reduce<SeriesPoint | null>(
    (best, p) => (best === null || p.kg > best.kg ? p : best),
    null
  );
  if (peak && peak.kg > 0) {
    insights.push({
      kind: "peak",
      tone: "neutral",
      year: peak.year,
      month: peak.month,
      kg: peak.kg,
    });
  }

  if (importTotals.kg > 0 || exportTotals.kg > 0) {
    insights.push({
      kind: "balance",
      tone: exportTotals.kg >= importTotals.kg ? "positive" : "neutral",
      importKg: importTotals.kg,
      exportKg: exportTotals.kg,
      netKg: exportTotals.kg - importTotals.kg,
      coverage: importTotals.kg > 0 ? exportTotals.kg / importTotals.kg : 0,
    });
  }

  const leadingMode = [...modeSplit].sort((a, b) => b.share - a.share)[0];
  if (leadingMode) {
    insights.push({
      kind: "modal",
      tone: "neutral",
      mode: leadingMode.mode,
      share: leadingMode.share,
    });
  }

  if (countryId && benchmarkShipmentKg > 0 && avgShipmentKg > 0) {
    const ratio = avgShipmentKg / benchmarkShipmentKg;
    if (ratio >= 1.5 || ratio <= 0.67) {
      insights.push({
        kind: "shipment",
        tone: "neutral",
        avgKg: avgShipmentKg,
        benchmarkKg: benchmarkShipmentKg,
        ratio,
      });
    }
  }

  const topChapter = chapters[0];
  if (topChapter && !countryId) {
    insights.push({
      kind: "product",
      tone: "neutral",
      name: topChapter.label,
      share: topChapter.share,
      kg: topChapter.current.kg,
    });
  }

  insights.push({
    kind: "importers",
    tone: "neutral",
    count: importersCurrent,
    delta:
      importersPrevious !== null && importersPrevious > 0
        ? (importersCurrent - importersPrevious) / importersPrevious
        : null,
  });

  return {
    filters,
    period,
    periods,
    countries: buildCountryOptions(cube),
    window: {
      fromYear: yearOf(cur.from),
      fromMonth: monthOf(cur.from),
      toYear: yearOf(cur.to),
      toMonth: monthOf(cur.to),
    },
    priorWindow: prev
      ? {
          fromYear: yearOf(prev.from),
          fromMonth: monthOf(prev.from),
          toYear: yearOf(prev.to),
          toMonth: monthOf(prev.to),
        }
      : null,
    headline,
    importTotals,
    exportTotals,
    importers: { current: importersCurrent, previous: importersPrevious },
    avgShipmentKg,
    activeCities,
    activeCountries,
    series,
    countriesRank: countriesRankAll.slice(0, 12),
    cities,
    chapters,
    ports,
    modeSplit,
    concentration,
    insights,
    countryProfile,
    recordCount: cube.totalDeclarations,
  };
}

let countryOptionsCache: CountryOption[] | null = null;

/** Country picker list, ordered by total trade weight across the dataset. */
function buildCountryOptions(cube: Cube): CountryOption[] {
  if (countryOptionsCache) return countryOptionsCache;

  const totals = new Map<number, number>();
  for (let r = 0; r < cube.geo.t.length; r++) {
    const id = cube.geo.country[r];
    totals.set(id, (totals.get(id) ?? 0) + cube.geo.kg[r]);
  }

  countryOptionsCache = [...totals.entries()]
    .map(([id, kg]) => {
      const info = countryInfo(cube.geo.countries[id]);
      return {
        code: info.code,
        name: { en: info.en, ar: info.ar },
        flag: flagEmoji(info),
        kg,
      };
    })
    .sort((a, b) => b.kg - a.kg);

  return countryOptionsCache;
}

import { openCustomsDb } from "./db";

/**
 * The dashboard slices 1.5M declarations by period, counterparty country and
 * trade flow. Re-querying SQLite on every filter change costs ~0.5s per
 * aggregate, so instead we pre-aggregate once into a small columnar cube and
 * answer every subsequent filter combination from memory in a few milliseconds.
 *
 * Each table is stored as parallel typed arrays with interned string labels,
 * which keeps the whole cube around ~40MB for ~1.1M grouped rows (including
 * the four-way flow table used by the Sankey).
 */

/** Absolute month index, so date windows are simple integer comparisons. */
export function monthIndex(year: number, monthNum: number): number {
  return year * 12 + (monthNum - 1);
}

export function yearOf(t: number): number {
  return Math.floor(t / 12);
}

export function monthOf(t: number): number {
  return (t % 12) + 1;
}

export type Table = {
  /** Index into `countries` for the counterparty of each grouped row. */
  country: Int32Array;
  /** Index into `members` for the dimension value (city, chapter, port...). */
  member: Int32Array;
  t: Int32Array;
  /** 1 = import into MODON, 0 = export out of MODON. */
  imp: Uint8Array;
  declarations: Float64Array;
  kg: Float64Array;
  countries: string[];
  members: string[];
  /** Reverse lookup for resolving a country filter to its interned index. */
  countryIndex: Map<string, number>;
};

/**
 * Four-way rollup used to draw the demand Sankey. Keeping chapter, port and
 * city on the same row means link weights conserve across hops.
 */
export type FlowTable = {
  country: Int32Array;
  chapter: Int32Array;
  port: Int32Array;
  city: Int32Array;
  t: Int32Array;
  imp: Uint8Array;
  declarations: Float64Array;
  kg: Float64Array;
  countries: string[];
  chapters: string[];
  ports: string[];
  cities: string[];
  countryIndex: Map<string, number>;
};

export type Cube = {
  geo: Table;
  city: Table;
  chapter: Table;
  port: Table;
  importer: Table;
  flow: FlowTable;
  /** Full extent of the data, as absolute month indices. */
  minT: number;
  maxT: number;
  years: number[];
  totalDeclarations: number;
};

type RawRow = {
  country: string | null;
  member: string | null;
  y: number;
  m: number;
  i: number;
  d: number;
  w: number;
};

type RawFlowRow = {
  country: string | null;
  chapter: string | null;
  port: string | null;
  city: string | null;
  y: number;
  m: number;
  i: number;
  d: number;
  w: number;
};

/** Counterparty is the origin for imports and the destination for exports. */
const COUNTERPARTY = `CASE WHEN is_import = 1 THEN origin_country ELSE destination_country END`;

function intern(
  value: string,
  list: string[],
  index: Map<string, number>
): number {
  const existing = index.get(value);
  if (existing !== undefined) return existing;
  const id = list.length;
  list.push(value);
  index.set(value, id);
  return id;
}

function buildTable(rows: RawRow[]): Table {
  const n = rows.length;
  const table: Table = {
    country: new Int32Array(n),
    member: new Int32Array(n),
    t: new Int32Array(n),
    imp: new Uint8Array(n),
    declarations: new Float64Array(n),
    kg: new Float64Array(n),
    countries: [],
    members: [],
    countryIndex: new Map(),
  };

  const memberIndex = new Map<string, number>();

  for (let r = 0; r < n; r++) {
    const row = rows[r];
    table.country[r] = intern(
      row.country ?? "",
      table.countries,
      table.countryIndex
    );
    table.member[r] = intern(row.member ?? "", table.members, memberIndex);
    table.t[r] = monthIndex(row.y, row.m);
    table.imp[r] = row.i;
    table.declarations[r] = row.d;
    table.kg[r] = row.w;
  }

  return table;
}

function buildFlowTable(rows: RawFlowRow[]): FlowTable {
  const n = rows.length;
  const table: FlowTable = {
    country: new Int32Array(n),
    chapter: new Int32Array(n),
    port: new Int32Array(n),
    city: new Int32Array(n),
    t: new Int32Array(n),
    imp: new Uint8Array(n),
    declarations: new Float64Array(n),
    kg: new Float64Array(n),
    countries: [],
    chapters: [],
    ports: [],
    cities: [],
    countryIndex: new Map(),
  };

  const chapterIndex = new Map<string, number>();
  const portIndex = new Map<string, number>();
  const cityIndex = new Map<string, number>();

  for (let r = 0; r < n; r++) {
    const row = rows[r];
    table.country[r] = intern(
      row.country ?? "",
      table.countries,
      table.countryIndex
    );
    table.chapter[r] = intern(row.chapter ?? "", table.chapters, chapterIndex);
    table.port[r] = intern(row.port ?? "", table.ports, portIndex);
    table.city[r] = intern(row.city ?? "", table.cities, cityIndex);
    table.t[r] = monthIndex(row.y, row.m);
    table.imp[r] = row.i;
    table.declarations[r] = row.d;
    table.kg[r] = row.w;
  }

  return table;
}

function queryTable(memberExpr: string): Table {
  const db = openCustomsDb();
  const rows = db
    .prepare(
      `SELECT ${COUNTERPARTY} AS country,
              ${memberExpr} AS member,
              year AS y,
              month_num AS m,
              is_import AS i,
              COUNT(*) AS d,
              SUM(net_weight_kg) AS w
       FROM declarations
       WHERE year IS NOT NULL AND month_num IS NOT NULL
       GROUP BY country, member, y, m, i`
    )
    .all() as RawRow[];
  return buildTable(rows);
}

function queryFlowTable(): FlowTable {
  const db = openCustomsDb();
  const rows = db
    .prepare(
      `SELECT ${COUNTERPARTY} AS country,
              hs_chapter AS chapter,
              port,
              industrial_city AS city,
              year AS y,
              month_num AS m,
              is_import AS i,
              COUNT(*) AS d,
              SUM(net_weight_kg) AS w
       FROM declarations
       WHERE year IS NOT NULL AND month_num IS NOT NULL
       GROUP BY country, chapter, port, city, y, m, i`
    )
    .all() as RawFlowRow[];
  return buildFlowTable(rows);
}

let cache: Cube | null = null;

/** Builds the cube on first use (~10s) and reuses it for the process lifetime. */
export function getCube(): Cube {
  if (cache) return cache;

  const geo = queryTable("''");
  const city = queryTable("industrial_city");
  const chapter = queryTable("hs_chapter");
  const port = queryTable("port");
  const importer = queryTable("commercial_register");
  const flow = queryFlowTable();

  let minT = Infinity;
  let maxT = -Infinity;
  let totalDeclarations = 0;
  const years = new Set<number>();

  for (let r = 0; r < geo.t.length; r++) {
    const t = geo.t[r];
    if (t < minT) minT = t;
    if (t > maxT) maxT = t;
    years.add(yearOf(t));
    totalDeclarations += geo.declarations[r];
  }

  cache = {
    geo,
    city,
    chapter,
    port,
    importer,
    flow,
    minT,
    maxT,
    years: [...years].sort((a, b) => a - b),
    totalDeclarations,
  };

  return cache;
}

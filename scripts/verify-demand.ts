import Database from "better-sqlite3";
import { resolve } from "node:path";
import { loadDemand } from "../src/lib/customs/demand";

const db = new Database(resolve("../material/customs-declarations.db"), {
  readonly: true,
});

const COUNTERPARTY = `CASE WHEN is_import=1 THEN origin_country ELSE destination_country END`;

let failures = 0;

function check(label: string, actual: number, expected: number, tol = 1) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}\n      got=${actual}  sql=${expected}`
  );
}

function sql(where: string): { d: number; kg: number } {
  const row = db
    .prepare(
      `SELECT COUNT(*) d, COALESCE(SUM(net_weight_kg),0) kg FROM declarations WHERE ${where}`
    )
    .get() as { d: number; kg: number };
  return row;
}

const monthsIn = (y: number) =>
  `year = ${y} AND month_num BETWEEN 1 AND ${
    (db
      .prepare(`SELECT MAX(month_num) m FROM declarations WHERE year = ${y}`)
      .get() as { m: number }).m
  }`;

/* --- 1. All time, imports, no country -------------------------------- */
{
  const data = loadDemand({});
  const expected = sql("is_import = 1");
  check("all/import declarations", data.headline.current.declarations, expected.d);
  check("all/import weight", Math.round(data.headline.current.kg), Math.round(expected.kg));

  const exp = sql("is_import = 0");
  check("all/export totals weight", Math.round(data.exportTotals.kg), Math.round(exp.kg));

  const partners = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT ${COUNTERPARTY}) c FROM declarations WHERE is_import = 1`
      )
      .get() as { c: number }
  ).c;
  check("all/import partner count", data.activeCountries, partners);

  const cities = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT industrial_city) c FROM declarations WHERE is_import = 1`
      )
      .get() as { c: number }
  ).c;
  check("all/import active cities", data.activeCities, cities);

  const importers = (
    db
      .prepare(
        `SELECT COUNT(DISTINCT commercial_register) c FROM declarations WHERE is_import = 1`
      )
      .get() as { c: number }
  ).c;
  check("all/import businesses", data.importers.current, importers);

  const top = (
    db
      .prepare(
        `SELECT ${COUNTERPARTY} c, SUM(net_weight_kg) kg FROM declarations
         WHERE is_import = 1 GROUP BY c ORDER BY kg DESC LIMIT 1`
      )
      .get() as { c: string; kg: number }
  );
  check("all/import top partner kg", Math.round(data.countriesRank[0].current.kg), Math.round(top.kg));
  console.log(`      top partner: ${data.countriesRank[0].label.en} / ${top.c}`);
}

/* --- 2. Year 2026 (partial), imports ---------------------------------- */
{
  const data = loadDemand({ period: "2026" });
  const expected = sql(`is_import = 1 AND ${monthsIn(2026)}`);
  check("2026/import declarations", data.headline.current.declarations, expected.d);
  check("2026/import weight", Math.round(data.headline.current.kg), Math.round(expected.kg));

  // The comparison window must be the same months of the previous year.
  const prior = sql(`is_import = 1 AND year = 2025 AND month_num BETWEEN 1 AND 5`);
  check("2026 prior window weight", Math.round(data.headline.previous!.kg), Math.round(prior.kg));
  console.log(
    `      window ${data.window.fromMonth}/${data.window.fromYear}-${data.window.toMonth}/${data.window.toYear}` +
      ` vs ${data.priorWindow!.fromMonth}/${data.priorWindow!.fromYear}-${data.priorWindow!.toMonth}/${data.priorWindow!.toYear}`
  );
}

/* --- 3. Trailing twelve months ---------------------------------------- */
{
  const data = loadDemand({ period: "ttm" });
  const expected = sql(
    `is_import = 1 AND ((year = 2025 AND month_num >= 6) OR (year = 2026 AND month_num <= 5))`
  );
  check("ttm/import weight", Math.round(data.headline.current.kg), Math.round(expected.kg));
  const prior = sql(
    `is_import = 1 AND ((year = 2024 AND month_num >= 6) OR (year = 2025 AND month_num <= 5))`
  );
  check("ttm prior weight", Math.round(data.headline.previous!.kg), Math.round(prior.kg));
  check("ttm series length", data.series.length, 12, 0);
}

/* --- 4. Country filter: China, 2025, imports --------------------------- */
{
  const data = loadDemand({ period: "2025", country: "CN" });
  const where = `is_import = 1 AND year = 2025 AND origin_country = 'الصين'`;
  const expected = sql(where);
  check("CN/2025 declarations", data.headline.current.declarations, expected.d);
  check("CN/2025 weight", Math.round(data.headline.current.kg), Math.round(expected.kg));

  const topCity = db
    .prepare(
      `SELECT industrial_city c, SUM(net_weight_kg) kg FROM declarations
       WHERE ${where} GROUP BY c ORDER BY kg DESC LIMIT 1`
    )
    .get() as { c: string; kg: number };
  check("CN/2025 top city kg", Math.round(data.cities[0].current.kg), Math.round(topCity.kg));
  console.log(`      top city: ${data.cities[0].label.ar} / ${topCity.c}`);

  const topChapter = db
    .prepare(
      `SELECT hs_chapter c, SUM(net_weight_kg) kg FROM declarations
       WHERE ${where} GROUP BY c ORDER BY kg DESC LIMIT 1`
    )
    .get() as { c: string; kg: number };
  check("CN/2025 top chapter kg", Math.round(data.chapters[0].current.kg), Math.round(topChapter.kg));
  console.log(`      top chapter: ${data.chapters[0].label.en} / ${topChapter.c}`);

  const businesses = (
    db
      .prepare(`SELECT COUNT(DISTINCT commercial_register) c FROM declarations WHERE ${where}`)
      .get() as { c: number }
  ).c;
  check("CN/2025 businesses", data.importers.current, businesses);

  // Exports to China in the same window, for the balance card.
  const exp = sql(`is_import = 0 AND year = 2025 AND destination_country = 'الصين'`);
  check("CN/2025 export weight", Math.round(data.exportTotals.kg), Math.round(exp.kg));

  console.log(
    `      profile rank=${data.countryProfile!.rank}/${data.countryProfile!.totalCountries} share=${(data.countryProfile!.share * 100).toFixed(1)}%`
  );
}

/* --- 5. Export flow, all time ------------------------------------------ */
{
  const data = loadDemand({ flow: "export" });
  const expected = sql("is_import = 0");
  check("export/all weight", Math.round(data.headline.current.kg), Math.round(expected.kg));

  const top = db
    .prepare(
      `SELECT destination_country c, SUM(net_weight_kg) kg FROM declarations
       WHERE is_import = 0 GROUP BY c ORDER BY kg DESC LIMIT 1`
    )
    .get() as { c: string; kg: number };
  check("export top destination kg", Math.round(data.countriesRank[0].current.kg), Math.round(top.kg));
  console.log(`      top destination: ${data.countriesRank[0].label.en} / ${top.c}`);
}

/* --- 6. Internal consistency ------------------------------------------- */
{
  const data = loadDemand({ period: "2025" });
  const seriesSum = data.series.reduce((a, p) => a + p.kg, 0);
  check("series sums to headline", Math.round(seriesSum), Math.round(data.headline.current.kg), 2);

  const shareSum = data.countriesRank.reduce((a, r) => a + r.share, 0);
  console.log(`      top-12 partner share = ${(shareSum * 100).toFixed(1)}%`);

  const modeSum = data.modeSplit.reduce((a, m) => a + m.share, 0);
  check("mode shares sum to 1", Number(modeSum.toFixed(6)), 1, 1e-6);

  const portSum = data.modeSplit.reduce((a, m) => a + m.kg, 0);
  check("mode kg equals headline", Math.round(portSum), Math.round(data.headline.current.kg), 2);

  console.log(
    `      HHI=${data.concentration.hhi} band=${data.concentration.band} top${data.concentration.topN}=${(data.concentration.topShare * 100).toFixed(1)}%`
  );
  console.log(`      insights: ${data.insights.map((i) => i.kind).join(", ")}`);
}

/* --- 7. Filter parsing hardening --------------------------------------- */
{
  const junk = loadDemand({ period: "1999", country: "ZZZZ", flow: "sideways" });
  check("junk period falls back to all", junk.period.id === "all" ? 1 : 0, 1, 0);
  check("junk country ignored", junk.filters.country === null ? 1 : 0, 1, 0);
  check("junk flow falls back to import", junk.filters.flow === "import" ? 1 : 0, 1, 0);
}

console.log(failures === 0 ? "\nALL CHECKS PASSED" : `\n${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);

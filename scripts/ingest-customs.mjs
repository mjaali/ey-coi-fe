#!/usr/bin/env node
/**
 * Stream material/customs-declarations.json into a SQLite database.
 * The app queries this DB at runtime — no pre-aggregated summary files.
 *
 * Usage: npm run ingest:customs
 */

import { createReadStream, mkdirSync, unlinkSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chain from "stream-chain";
import { parser } from "stream-json";
import { streamArray } from "stream-json/streamers/stream-array.js";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const INPUT = resolve(ROOT, "material/customs-declarations.json");
const OUTPUT = resolve(ROOT, "material/customs-declarations.db");

const IMPORT_TYPE = "بيان وارد";

const MONTH_ORDER = {
  يناير: 1,
  فبراير: 2,
  مارس: 3,
  ابريل: 4,
  أبريل: 4,
  مايو: 5,
  يونيو: 6,
  يوليو: 7,
  اغسطس: 8,
  أغسطس: 8,
  سبتمبر: 9,
  اكتوبر: 10,
  أكتوبر: 10,
  نوفمبر: 11,
  ديسمبر: 12,
};

function hsChapter(code) {
  if (!code || typeof code !== "string") return null;
  const digits = code.replace(/\D/g, "");
  if (digits.length < 2) return null;
  return digits.slice(0, 2);
}

if (existsSync(OUTPUT)) unlinkSync(OUTPUT);
mkdirSync(dirname(OUTPUT), { recursive: true });

console.log(`Ingesting ${INPUT}`);
console.log(`→ ${OUTPUT}`);
console.time("ingest");

const db = new Database(OUTPUT);
db.pragma("journal_mode = WAL");
db.pragma("synchronous = OFF");
db.pragma("temp_store = MEMORY");

db.exec(`
  CREATE TABLE declarations (
    hs_code TEXT,
    hs_chapter TEXT,
    hs_description TEXT,
    year INTEGER,
    month TEXT,
    month_num INTEGER,
    declaration_type TEXT,
    is_import INTEGER NOT NULL,
    net_weight_kg REAL NOT NULL,
    origin_country TEXT,
    destination_country TEXT,
    port TEXT,
    commercial_register TEXT,
    industrial_city TEXT
  );
`);

const insert = db.prepare(`
  INSERT INTO declarations (
    hs_code, hs_chapter, hs_description, year, month, month_num,
    declaration_type, is_import, net_weight_kg, origin_country,
    destination_country, port, commercial_register, industrial_city
  ) VALUES (
    @hs_code, @hs_chapter, @hs_description, @year, @month, @month_num,
    @declaration_type, @is_import, @net_weight_kg, @origin_country,
    @destination_country, @port, @commercial_register, @industrial_city
  )
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) insert.run(row);
});

let recordCount = 0;
let batch = [];
const BATCH_SIZE = 5000;

await new Promise((resolvePromise, reject) => {
  const pipeline = chain([
    createReadStream(INPUT),
    parser(),
    streamArray(),
  ]);

  pipeline.on("data", ({ value: row }) => {
    const month =
      typeof row.month === "string" ? row.month.trim() : "";
    const type =
      typeof row.declarationType === "string"
        ? row.declarationType.trim()
        : "";
    const hsCode =
      typeof row.hsCode === "string" ? row.hsCode.trim() : "";

    batch.push({
      hs_code: hsCode || null,
      hs_chapter: hsChapter(hsCode),
      hs_description:
        typeof row.hsDescription === "string"
          ? row.hsDescription.trim()
          : null,
      year: Number.isFinite(Number(row.year)) ? Number(row.year) : null,
      month: month || null,
      month_num: MONTH_ORDER[month] ?? null,
      declaration_type: type || null,
      is_import: type === IMPORT_TYPE ? 1 : 0,
      net_weight_kg: Number(row.netWeightKg) || 0,
      origin_country:
        typeof row.originCountry === "string"
          ? row.originCountry.trim()
          : null,
      destination_country:
        typeof row.destinationCountry === "string"
          ? row.destinationCountry.trim()
          : null,
      port: typeof row.port === "string" ? row.port.trim() : null,
      commercial_register:
        typeof row.commercialRegister === "string"
          ? row.commercialRegister.trim()
          : null,
      industrial_city:
        typeof row.industrialCity === "string"
          ? row.industrialCity.trim()
          : null,
    });

    recordCount += 1;
    if (batch.length >= BATCH_SIZE) {
      insertMany(batch);
      batch = [];
      if (recordCount % 250_000 === 0) {
        console.log(`  … ${recordCount.toLocaleString()} records`);
      }
    }
  });

  pipeline.on("end", () => {
    if (batch.length) insertMany(batch);
    resolvePromise();
  });
  pipeline.on("error", reject);
});

console.log("Creating indexes…");
db.exec(`
  CREATE INDEX idx_declarations_year ON declarations(year);
  CREATE INDEX idx_declarations_import ON declarations(is_import);
  CREATE INDEX idx_declarations_city ON declarations(industrial_city);
  CREATE INDEX idx_declarations_origin ON declarations(origin_country);
  CREATE INDEX idx_declarations_chapter ON declarations(hs_chapter);
  CREATE INDEX idx_declarations_port ON declarations(port);
  CREATE INDEX idx_declarations_month ON declarations(year, month_num);
`);

db.pragma("synchronous = NORMAL");
db.close();

console.timeEnd("ingest");
console.log(`Done — ${recordCount.toLocaleString()} declarations`);

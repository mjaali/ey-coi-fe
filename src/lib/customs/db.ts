import Database from "better-sqlite3";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_DB_PATH = resolve(
  process.cwd(),
  "../material/customs-declarations.db"
);

export function getCustomsDbPath() {
  return process.env.CUSTOMS_DB_PATH?.trim() || DEFAULT_DB_PATH;
}

let cached: Database.Database | null = null;

export function openCustomsDb(): Database.Database {
  if (cached) return cached;

  const path = getCustomsDbPath();
  if (!existsSync(path)) {
    throw new Error(
      `Customs database not found at ${path}. Run: npm run ingest:customs`
    );
  }

  cached = new Database(path, { readonly: true, fileMustExist: true });
  cached.pragma("query_only = ON");
  return cached;
}

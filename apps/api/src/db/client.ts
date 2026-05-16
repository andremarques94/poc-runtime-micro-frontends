import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema.js";

function resolveSqlitePath(): string {
	const relative = process.env.SQLITE_PATH ?? "data/app.db";
	const absolute = resolve(process.cwd(), relative);
	mkdirSync(dirname(absolute), { recursive: true });
	return absolute;
}

const sqlitePath = resolveSqlitePath();

const sqlite = new Database(sqlitePath);

export const db = drizzle(sqlite, { schema });

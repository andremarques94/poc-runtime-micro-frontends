import { join } from "node:path";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import type * as schema from "./schema.js";

export function runMigrations(
	database: BetterSQLite3Database<typeof schema>,
): void {
	migrate(database, { migrationsFolder: join(process.cwd(), "drizzle") });
}

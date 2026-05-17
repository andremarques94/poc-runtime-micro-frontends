import { db } from "./db/client.js";
import { migrateLegacyCheckoutRemoteUrl } from "./db/migrate-catalog.js";
import { runMigrations } from "./db/run-migrations.js";

export function prepareDatabase(): void {
	runMigrations(db);
	migrateLegacyCheckoutRemoteUrl();
}

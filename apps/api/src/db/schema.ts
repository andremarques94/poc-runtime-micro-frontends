import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const microFrontends = sqliteTable("micro_frontends", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	slug: text("slug").notNull().unique(),
	remoteEntryUrl: text("remote_entry_url").notNull(),
	scope: text("scope").notNull(),
	exposedModule: text("exposed_module").notNull(),
	routeBasePath: text("route_base_path"),
	displayName: text("display_name"),
	version: text("version"),
	enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
	metadata: text("metadata", { mode: "json" })
		.$type<Record<string, unknown>>()
		.notNull()
		.default(sql`'{}'`),
});

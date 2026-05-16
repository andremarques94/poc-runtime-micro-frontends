import { resolve } from "node:path";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "sqlite",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
	dbCredentials: {
		url: resolve(process.cwd(), process.env.SQLITE_PATH ?? "data/app.db"),
	},
});

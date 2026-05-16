import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { db } from "./db/client.js";
import { migrateLegacyCheckoutRemoteUrl } from "./db/migrate-catalog.js";
import { runMigrations } from "./db/run-migrations.js";
import { mfApp } from "./routes/mf.js";

runMigrations(db);
migrateLegacyCheckoutRemoteUrl();

const app = new Hono();

app.get("/health", (c) => c.json({ ok: true }));
app.route("/mf", mfApp);

const port = Number(process.env.PORT ?? 3000);

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(`API listening on http://localhost:${info.port}`);
	},
);

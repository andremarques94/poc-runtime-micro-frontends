import { Hono } from "hono";

import { mfApp } from "./routes/mf.js";

export function createApiApp(): Hono {
	const app = new Hono();
	app.get("/health", (c) => c.json({ ok: true }));
	app.route("/mf", mfApp);
	return app;
}

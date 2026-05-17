import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

import {
	type CatalogRemoteResponse,
	type CatalogRemotesResponse,
	catalogRemoteSchema,
	slugParamSchema,
} from "../catalog.js";
import { db } from "../db/client.js";
import { microFrontends } from "../db/schema.js";

export const mfApp = new Hono();

mfApp.get("/remotes", (c) => {
	const rows = db
		.select()
		.from(microFrontends)
		.where(eq(microFrontends.enabled, true))
		.all();
	const remotes = rows.map((row) => catalogRemoteSchema.parse(row));
	const response: CatalogRemotesResponse = { remotes };
	return c.json(response);
});

mfApp.get("/remotes/:slug", zValidator("param", slugParamSchema), (c) => {
	const { slug } = c.req.valid("param");
	const row = db
		.select()
		.from(microFrontends)
		.where(and(eq(microFrontends.slug, slug), eq(microFrontends.enabled, true)))
		.get();
	if (!row) {
		return c.notFound();
	}
	const remote = catalogRemoteSchema.parse(row);
	const response: CatalogRemoteResponse = { remote };
	return c.json(response);
});

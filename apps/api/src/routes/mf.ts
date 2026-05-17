import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

import {
	catalogRemoteResponseSchema,
	catalogRemotesResponseSchema,
	slugParamSchema,
} from "../catalog.js";
import { db } from "../db/client.js";
import { microFrontends } from "../db/schema.js";

export const mfApp = new Hono();

mfApp.get("/remotes", (c) => {
	const remotes = db
		.select()
		.from(microFrontends)
		.where(eq(microFrontends.enabled, true))
		.all();
	const payload = catalogRemotesResponseSchema.parse({ remotes });
	return c.json(payload);
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
	const payload = catalogRemoteResponseSchema.parse({ remote: row });
	return c.json(payload);
});

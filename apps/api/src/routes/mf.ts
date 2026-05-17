import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";

import {
	catalogRemoteResponseSchema,
	catalogRemoteSchema,
	catalogRemotesResponseSchema,
	slugParamSchema,
} from "../catalog.js";
import { db } from "../db/client.js";
import { microFrontends } from "../db/schema.js";

export const mfApp = new Hono();

function enabledRemotesRows() {
	return db
		.select()
		.from(microFrontends)
		.where(eq(microFrontends.enabled, true))
		.all();
}

mfApp.get("/remotes", (c) => {
	const remotes = enabledRemotesRows().map((row) =>
		catalogRemoteSchema.parse(row),
	);
	const body = catalogRemotesResponseSchema.parse({ remotes });
	return c.json(body);
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
	const body = catalogRemoteResponseSchema.parse({ remote });
	return c.json(body);
});

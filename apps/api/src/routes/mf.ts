import { zValidator } from "@hono/zod-validator";
import { and, eq, or } from "drizzle-orm";
import { Hono } from "hono";

import {
	type CatalogRemoteResponse,
	type CatalogRemotesResponse,
	catalogRemoteSchema,
	createCatalogRemoteSchema,
	slugParamSchema,
} from "../catalog.js";
import { db } from "../db/client.js";
import { microFrontends } from "../db/schema.js";

export const mfApp = new Hono();

mfApp.post("/remotes", zValidator("json", createCatalogRemoteSchema), (c) => {
	const body = c.req.valid("json");

	try {
		const result = db
			.insert(microFrontends)
			.values({
				slug: body.slug,
				scope: body.scope,
				remoteEntryUrl: body.remoteEntryUrl,
				exposedModule: body.exposedModule,
				routeBasePath: body.routeBasePath ?? null,
				displayName: body.displayName ?? null,
				version: body.version ?? null,
				enabled: true,
				metadata: body.metadata,
			})
			.returning()
			.get();

		const remote = catalogRemoteSchema.parse(result);
		const response: CatalogRemoteResponse = { remote };
		return c.json(response, 201);
	} catch (error) {
		if (
			error instanceof Error &&
			(error.message.includes("UNIQUE constraint failed") ||
				error.message.includes("SQLITE_CONSTRAINT"))
		) {
			return c.json(
				{ error: "A remote with this slug or scope already exists" },
				409,
			);
		}
		throw error;
	}
});

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

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
	const conflict = db
		.select({ slug: microFrontends.slug })
		.from(microFrontends)
		.where(
			or(
				eq(microFrontends.slug, body.slug),
				eq(microFrontends.scope, body.scope),
			),
		)
		.get();

	if (conflict) {
		return c.json(
			{ error: "A remote with this slug or scope already exists" },
			409,
		);
	}

	db.insert(microFrontends)
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
		.run();

	const row = db
		.select()
		.from(microFrontends)
		.where(eq(microFrontends.slug, body.slug))
		.get();

	if (!row) {
		return c.json({ error: "Failed to create remote" }, 500);
	}

	const remote = catalogRemoteSchema.parse(row);
	const response: CatalogRemoteResponse = { remote };
	return c.json(response, 201);
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

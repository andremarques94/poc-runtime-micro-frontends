import { z } from "zod";

const slugSegment = "[a-z0-9]+";
const slugPattern = new RegExp(`^${slugSegment}(?:-${slugSegment})*$`);

export const slugParamSchema = z.object({
	slug: z.string().min(1).max(128).regex(slugPattern),
});

export const catalogRemoteSchema = z.object({
	slug: z.string(),
	remoteEntryUrl: z.string(),
	scope: z.string(),
	exposedModule: z.string(),
	routeBasePath: z.string().nullable(),
	displayName: z.string().nullable(),
	version: z.string().nullable(),
	enabled: z.boolean(),
	metadata: z.record(z.unknown()),
});

export const catalogRemotesResponseSchema = z.object({
	remotes: z.array(catalogRemoteSchema),
});

export const catalogRemoteResponseSchema = z.object({
	remote: catalogRemoteSchema,
});

export type CatalogRemote = z.infer<typeof catalogRemoteSchema>;
export type CatalogRemoteResponse = z.infer<typeof catalogRemoteResponseSchema>;
export type CatalogRemotesResponse = z.infer<
	typeof catalogRemotesResponseSchema
>;

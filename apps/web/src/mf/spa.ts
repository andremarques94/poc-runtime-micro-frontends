import { useQuery } from "@tanstack/react-query";
import { type CatalogRemote, catalogRemotesResponseSchema } from "api/catalog";
import { useEffect } from "react";
import { registerApplication, start, triggerAppChange } from "single-spa";

import { loadRemoteLifecycles, registerCatalogRemote } from "./host";

export type { CatalogRemote };

const registeredScopes = new Set<string>();
let started = false;

export function mountPointId(scope: string): string {
	return `${scope}-mfe-root`;
}

function registerCatalogApps(remotes: CatalogRemote[]): void {
	for (const remote of remotes) {
		if (!remote.enabled || registeredScopes.has(remote.scope)) {
			continue;
		}
		registeredScopes.add(remote.scope);
		registerCatalogRemote(remote);
		registerApplication({
			name: remote.scope,
			app: () => loadRemoteLifecycles(remote.scope, remote.exposedModule),
			// This demo shell mounts every enabled catalog app into its named bay.
			activeWhen: () => true,
		});
	}
}

function ensureSingleSpaStarted(): void {
	if (!started) {
		started = true;
		start();
	}
	triggerAppChange();
}

function syncCatalogWithSingleSpa(remotes: CatalogRemote[]): void {
	registerCatalogApps(remotes);
	ensureSingleSpaStarted();
}

async function fetchCatalogRemotes(): Promise<CatalogRemote[]> {
	const response = await fetch("/api/mf/remotes");
	if (!response.ok) {
		throw new Error(`catalog HTTP ${response.status}`);
	}
	const { remotes } = catalogRemotesResponseSchema.parse(await response.json());
	return remotes;
}

export function useCatalog() {
	const catalogQuery = useQuery({
		queryKey: ["mf", "remotes"],
		queryFn: fetchCatalogRemotes,
	});

	useEffect(() => {
		if (catalogQuery.data) {
			syncCatalogWithSingleSpa(catalogQuery.data);
		}
	}, [catalogQuery.data]);

	return catalogQuery;
}

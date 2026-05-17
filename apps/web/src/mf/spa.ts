import { useQuery } from "@tanstack/react-query";
import { type CatalogRemote, catalogRemotesResponseSchema } from "api/catalog";
import { registerApplication, start, triggerAppChange } from "single-spa";

import { loadRemoteLifecycles, registerCatalogRemote } from "./host";

export type { CatalogRemote };

const registeredScopes = new Set<string>();
const catalogQueryKey = ["mf", "remotes"] as const;
let singleSpaStarted = false;

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
			activeWhen: () => true,
		});
	}
}

function ensureSingleSpaStarted(): void {
	if (!singleSpaStarted) {
		singleSpaStarted = true;
		start();
	}
	triggerAppChange();
}

async function readCatalogRemotes(): Promise<CatalogRemote[]> {
	const response = await fetch("/api/mf/remotes");
	if (!response.ok) {
		throw new Error(`catalog HTTP ${response.status}`);
	}
	const { remotes } = catalogRemotesResponseSchema.parse(await response.json());
	return remotes;
}

function syncCatalogRemotes(remotes: CatalogRemote[]): void {
	registerCatalogApps(remotes);
	ensureSingleSpaStarted();
}

async function fetchCatalogRemotes(): Promise<CatalogRemote[]> {
	const remotes = await readCatalogRemotes();
	syncCatalogRemotes(remotes);
	return remotes;
}

export function useCatalog() {
	return useQuery({
		queryKey: catalogQueryKey,
		queryFn: fetchCatalogRemotes,
	});
}

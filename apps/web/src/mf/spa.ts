import { useQuery } from "@tanstack/react-query";
import { type CatalogRemote, catalogRemotesResponseSchema } from "api/catalog";
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

async function fetchCatalogRemotes(): Promise<CatalogRemote[]> {
	const response = await fetch("/api/mf/remotes");
	if (!response.ok) {
		throw new Error(`catalog HTTP ${response.status}`);
	}
	const { remotes } = catalogRemotesResponseSchema.parse(await response.json());
	registerCatalogApps(remotes);
	ensureSingleSpaStarted();
	return remotes;
}

export function useCatalog() {
	return useQuery({
		queryKey: ["mf", "remotes"],
		queryFn: fetchCatalogRemotes,
	});
}

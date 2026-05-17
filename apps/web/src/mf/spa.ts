import { useQuery } from "@tanstack/react-query";
import { type CatalogRemote, catalogRemotesResponseSchema } from "api/catalog";
import { registerApplication, start, triggerAppChange } from "single-spa";

import { loadRemoteLifecycles, registerCatalogRemote } from "./host";

export type { CatalogRemote };

const registeredScopes = new Set<string>();
let singleSpaStarted = false;

export function mountPointId(scope: string): string {
	return `${scope}-mfe-root`;
}

function registerRemoteAsApplication(remote: CatalogRemote): void {
	registerCatalogRemote(remote);
	registerApplication({
		name: remote.scope,
		app: () => loadRemoteLifecycles(remote.scope, remote.exposedModule),
		activeWhen: () => true,
	});
}

function registerEnabledRemotes(remotes: CatalogRemote[]): void {
	for (const remote of remotes) {
		if (!remote.enabled) {
			continue;
		}
		if (registeredScopes.has(remote.scope)) {
			continue;
		}
		registeredScopes.add(remote.scope);
		registerRemoteAsApplication(remote);
	}
}

function startSingleSpaIfNeeded(): void {
	if (!singleSpaStarted) {
		singleSpaStarted = true;
		start();
	}
	triggerAppChange();
}

async function fetchRemotesPayload(): Promise<CatalogRemote[]> {
	const response = await fetch("/api/mf/remotes");
	if (!response.ok) {
		throw new Error(`catalog HTTP ${response.status}`);
	}
	const payload: unknown = await response.json();
	const { remotes } = catalogRemotesResponseSchema.parse(payload);
	return remotes;
}

export function useCatalog() {
	return useQuery({
		queryKey: ["mf", "remotes"],
		queryFn: async () => {
			const remotes = await fetchRemotesPayload();
			registerEnabledRemotes(remotes);
			startSingleSpaIfNeeded();
			return remotes;
		},
	});
}

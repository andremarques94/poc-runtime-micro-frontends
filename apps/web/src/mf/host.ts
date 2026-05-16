import {
	getInstance,
	loadRemote,
	registerRemotes,
} from "@module-federation/enhanced/runtime";
import type { CatalogRemote } from "api/catalog";
import type { LifeCycles } from "single-spa";

import { lifeCyclesSchema } from "./lifecycles";

function resolveRemoteEntryUrl(entry: string): string {
	if (/^https?:\/\//i.test(entry)) {
		return entry;
	}
	return new URL(entry, window.location.origin).href;
}

export function registerCatalogRemote(
	remote: Pick<CatalogRemote, "remoteEntryUrl" | "scope">,
): void {
	registerRemotes([
		{
			entry: resolveRemoteEntryUrl(remote.remoteEntryUrl),
			name: remote.scope,
			type: "var",
		},
	]);
}

export async function loadRemoteLifecycles(
	scope: string,
	exposedModule: string,
): Promise<LifeCycles> {
	if (!getInstance()) {
		throw new Error("Module Federation runtime not initialized");
	}
	const segment = exposedModule.startsWith("./")
		? exposedModule.slice(2)
		: exposedModule;
	const mod: unknown = await loadRemote(`${scope}/${segment}`);
	return lifeCyclesSchema.parse(mod);
}

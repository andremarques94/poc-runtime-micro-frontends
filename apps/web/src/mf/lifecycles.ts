import type { LifeCycles } from "single-spa";
import { z } from "zod";

function isSingleSpaLifeCycles(value: unknown): value is LifeCycles {
	if (typeof value !== "object" || value === null) {
		return false;
	}
	if (!("bootstrap" in value) || typeof value.bootstrap !== "function") {
		return false;
	}
	if (!("mount" in value) || typeof value.mount !== "function") {
		return false;
	}
	if (!("unmount" in value) || typeof value.unmount !== "function") {
		return false;
	}
	return true;
}

export const lifeCyclesSchema = z.custom<LifeCycles>(isSingleSpaLifeCycles, {
	message: "Remote module did not export single-spa lifecycles",
});

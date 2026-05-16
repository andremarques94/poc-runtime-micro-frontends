import type { LifeCycles } from "single-spa";
import { z } from "zod";

export const lifeCyclesSchema = z.custom<LifeCycles>(
	(value): value is LifeCycles =>
		typeof value === "object" &&
		value !== null &&
		"bootstrap" in value &&
		typeof value.bootstrap === "function" &&
		"mount" in value &&
		typeof value.mount === "function" &&
		"unmount" in value &&
		typeof value.unmount === "function",
	{ message: "Remote module did not export single-spa lifecycles" },
);

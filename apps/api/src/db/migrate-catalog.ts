import { and, eq, like, or } from "drizzle-orm";

import { db } from "./client.js";
import { microFrontends } from "./schema.js";

const CHECKOUT_SLUG = "checkout";
const WEBPACK_CHECKOUT_ENTRY = "/mf-checkout/remoteEntry.js";

export function migrateLegacyCheckoutRemoteUrl(): void {
	db.update(microFrontends)
		.set({ remoteEntryUrl: WEBPACK_CHECKOUT_ENTRY })
		.where(
			and(
				eq(microFrontends.slug, CHECKOUT_SLUG),
				or(
					like(microFrontends.remoteEntryUrl, "%mf-manifest%"),
					like(microFrontends.remoteEntryUrl, "http://localhost:5174/%"),
				),
			),
		)
		.run();
}

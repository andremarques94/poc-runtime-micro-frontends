import { db } from "../db/client.js";
import { runMigrations } from "../db/run-migrations.js";
import { microFrontends } from "../db/schema.js";

runMigrations(db);

db.delete(microFrontends).run();

db.insert(microFrontends)
	.values([
		{
			slug: "checkout",
			remoteEntryUrl: "/mf-checkout/remoteEntry.js",
			scope: "checkout",
			exposedModule: "./lifecycles",
			routeBasePath: "/checkout",
			displayName: "Checkout",
			version: "1.0.0",
			enabled: true,
			metadata: {},
		},
	])
	.run();

console.log("Seeded micro_frontends table.");

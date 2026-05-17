import { serve } from "@hono/node-server";

import { prepareDatabase } from "./bootstrap.js";
import { createApiApp } from "./create-app.js";

prepareDatabase();

const app = createApiApp();
const port = Number(process.env.PORT ?? 3000);

serve(
	{
		fetch: app.fetch,
		port,
	},
	(info) => {
		console.log(`API listening on http://localhost:${info.port}`);
	},
);

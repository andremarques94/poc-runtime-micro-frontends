# api

Hono API with SQLite + Drizzle + Zod. Exposes a **module federation remote catalog** under `/mf`.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `SQLITE_PATH` | `data/app.db` (relative to **current working directory**) | SQLite file path |

Local DB files live in `data/` (ignored by git). Create the directory automatically on boot.

## Database

From `apps/api`:

```sh
pnpm db:generate   # after schema changes — generates SQL under drizzle/
pnpm db:migrate    # apply migrations via drizzle-kit (optional if you rely on server startup migrate)
pnpm db:push       # push schema without migration files (local dev only)
pnpm db:studio     # Drizzle Studio
pnpm db:seed       # reset seed rows (runs migrations, clears table; seeds checkout catalog entry)
```

On **`pnpm dev`** / **`pnpm start`**, the server runs **`runMigrations`**, then **`migrateLegacyCheckoutRemoteUrl`** (rewrites old **`mf-manifest.json`** checkout URLs to **`/mf-checkout/remoteEntry.js`**).

## Module federation catalog

- **`GET /mf/remotes`** — enabled remotes (JSON `{ remotes: [...] }`).
- **`GET /mf/remotes/:slug`** — one enabled remote (`{ remote: {...} }`) or **404**.
- **`POST /mf/remotes`** — register a remote (`{ remote: {...} }`, **201**) or **409** if slug/scope exists.

With the shell’s **webpack-dev-server** proxy, the browser calls **`http://localhost:5173/api/mf/remotes`** (rewritten to **`/mf/remotes`** on this API).

The seed uses **`remoteEntryUrl`: `/mf-checkout/remoteEntry.js`** so the **shell dev server** (port **5173**) proxies to **`checkout-remote`** (port **5174**) and the browser never cross-origin fetches the remote entry. Re-run **`pnpm --filter api db:seed`** after changing URLs.

Direct **`http://localhost:5174/remoteEntry.js`** also works if **`checkout-remote`** sends CORS headers (enabled in dev).

For ESM manifest flows, point **`remoteEntryUrl`** at a URL containing **`mf-manifest`**; the shell uses **`type: "module"`** in that case.

### Examples

```sh
curl -s http://localhost:3000/mf/remotes
curl -s http://localhost:3000/mf/remotes/checkout
```

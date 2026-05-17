# MFE registry demo

Step-by-step walkthrough of the **catalog API**, **shell** (`web`), and **registry studio** (`registry-remote`). You remove a seeded remote from SQLite, re-register it through the registry form, and optionally add another remote.

## Prerequisites

From the repo root:

```sh
pnpm install
pnpm --filter api db:seed
pnpm dev
```

Then open **`http://localhost:5173/`**.

`db:seed` creates `apps/api/data/app.db`, runs migrations, clears `micro_frontends`, and inserts **checkout** and **registry** rows. `pnpm dev` starts **api** (3000), **web** (5173), **checkout-remote** (5174), and **registry-remote** (5175).

## What you see

The shell has two panels:

1. **Catalog** — enabled remotes from `GET /api/mf/remotes` (proxied to the Hono API). Each row shows slug, scope, and `remoteEntryUrl`.
2. **Mount bay** — one DOM root per catalog scope (`#checkout-mfe-root`, `#registry-mfe-root`, …). single-spa loads each remote’s `./lifecycles` when the catalog resolves.

With the default seed you should see **checkout** and **registry** in the catalog, the checkout UI in its bay, and the **MFE Registry** form in the registry bay. Registering a remote dispatches `mf-catalog-changed`; the shell refetches the catalog and mounts new scopes when their entries load.

## Demo: remove checkout and re-register via registry

This shows that the shell only mounts remotes present in the catalog, and that the registry form can put them back without re-running the full seed.

### 1. Delete checkout from the catalog

There is no `DELETE /mf/remotes` yet. Remove the row with SQLite (stop nothing; the API keeps running):

```sh
sqlite3 apps/api/data/app.db "DELETE FROM micro_frontends WHERE slug = 'checkout';"
```

Verify:

```sh
sqlite3 apps/api/data/app.db "SELECT slug, scope FROM micro_frontends;"
```

You should see **registry** only.

### 2. Hard refresh the shell

Reload **`http://localhost:5173/`** with a full refresh (e.g. Cmd+Shift+R). The catalog lists **registry** only; the checkout mount bay is gone and checkout no longer loads.

Leave **`checkout-remote`** running on port **5174** — you are only removing the catalog entry, not the dev server.

### 3. Re-register checkout in the registry bay

Scroll to the **MFE Registry** panel (registry mount bay). Submit **Add to catalog** with:

| Field | Value |
|-------|--------|
| Slug | `checkout` |
| Scope | `checkout` |
| Display name | `Checkout` |
| Version | `1.0.0` |
| Remote entry URL | `/mf-checkout/remoteEntry.js` |
| Exposed module | `./lifecycles` |
| Route base (optional) | `/checkout` |
| Metadata JSON | `{}` |

Scope must match the Module Federation `name` in `checkout-remote` webpack config. The entry URL is same-origin on the shell: **web** proxies `/mf-checkout/*` → `http://localhost:5174`.

On success, the form shows a confirmation and the shell refetches. Checkout reappears in the catalog and mounts in the checkout bay.

## Demo: register a new remote (optional)

Example slug **payments** (you need a real federated app and routing for it to load).

| Field | Example value |
|-------|----------------|
| Slug | `payments` |
| Scope | `payments` |
| Display name | `Payments` |
| Remote entry URL | `/mf-payments/remoteEntry.js` |
| Exposed module | `./lifecycles` |

Same-origin entries use **`/mf-<slug>/remoteEntry.js`**. The platform must serve that path:

- **Dev:** add a `devServer.proxy` entry in `apps/web/webpack.config.cjs` (mirror `/mf-checkout` → your remote port).
- **Docker/nginx:** add a `location /mf-payments/` block in `apps/web/nginx/default.conf.template` and wire the upstream in `docker-compose.yml`.

Without proxy/nginx, the catalog row exists but the shell cannot fetch `remoteEntry.js`.

## Resetting the catalog without DELETE

- **Full reset to seed defaults:** `pnpm --filter api db:seed` (clears `micro_frontends` and re-inserts checkout + registry).
- **Single row:** `sqlite3` as above, or delete by scope/slug in Drizzle Studio (`pnpm --filter api db:studio`).

Re-seeding after manual POSTs will wipe any remotes you added only in the database.

## curl: catalog API

Direct API (port **3000**):

```sh
curl -s http://localhost:3000/mf/remotes | jq .
curl -s http://localhost:3000/mf/remotes/checkout | jq .
```

Through the shell proxy (port **5173**):

```sh
curl -s http://localhost:5173/api/mf/remotes | jq .
```

Register a remote (duplicate slug/scope returns **409**):

```sh
curl -s -X POST http://localhost:3000/mf/remotes \
  -H 'Content-Type: application/json' \
  -d '{
    "slug": "checkout",
    "scope": "checkout",
    "displayName": "Checkout",
    "version": "1.0.0",
    "remoteEntryUrl": "/mf-checkout/remoteEntry.js",
    "exposedModule": "./lifecycles",
    "routeBasePath": "/checkout",
    "metadata": {}
  }' | jq .
```

See [`apps/api/README.md`](apps/api/README.md) for schema details and environment variables.

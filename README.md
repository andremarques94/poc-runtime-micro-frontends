# ds-remote

Turborepo monorepo with a **Module Federation + single-spa shell** (`web`), **`checkout-remote`** and **`registry-remote`** federated micro-apps, a **Hono + Drizzle** catalog API, shared configs, and **Biome** (Ultracite) for lint/format.

Lint runs once at the workspace root via a **Turborepo root task** ([Biome + Turborepo](https://turborepo.dev/docs/guides/tools/biome)), not per app.

## Apps and packages

- `web`: Federation shell — **Webpack 5** + React + **single-spa** (`pnpm dev` → port **5173**; proxies `/api/*`, `/mf-checkout/*`, `/mf-registry/*`)
- `checkout-remote`: Federated remote `checkout` — exposes **`./lifecycles`** (`pnpm dev` → port **5174**)
- `registry-remote`: MFE registry studio — register remotes via POST (`pnpm dev` → port **5175**)
- `api`: Hono + SQLite + Drizzle catalog ([`/mf/remotes`](apps/api/README.md); `pnpm dev` → port **3000**)
- `@repo/typescript-config`: shared `tsconfig` bases
- `@repo/biome-config`: shared Biome preset (`ultracite/biome/*` in [`preset.jsonc`](packages/biome-config/preset.jsonc)), extended by root [`biome.jsonc`](biome.jsonc)

## Commands

From the repo root:

```sh
pnpm install
pnpm --filter api db:seed   # checkout + registry catalog rows
pnpm dev                    # runs api + web + checkout-remote + registry-remote (Turbo)
pnpm build
pnpm lint
pnpm lint:fix
pnpm check-types
pnpm fix
```

## Containers

Production images are built from the root [`Dockerfile`](Dockerfile):

- `api`: compiled Hono API on port **3000** with `SQLITE_PATH=/data/app.db`.
- `web`: nginx on port **8080**, serving the shell at `/`, remotes at `/mf-checkout/` and `/mf-registry/`, and proxying `/api/*`.
- `registry`: nginx serving the registry remote (compose port **8082**).

Run the production-like stack locally:

```sh
docker compose run --rm --build api-seed
docker compose up --build
```

Then open **`http://localhost:8080/`**. The one-shot seed command populates `/api/mf/remotes` without wiping the persistent volume on every API restart.

See [`deploy/README.md`](deploy/README.md) for the Docker/nginx routing layout and the future Postgres path.

## Demo

For a guided walkthrough (remove checkout from SQLite, re-register via the registry bay, optional new remotes, curl examples), see **[`DEMO.md`](DEMO.md)**.

## Architecture

1. **API catalog** lists remotes (`remoteEntryUrl`, `scope`, `exposedModule`).
2. **Module Federation** (`@module-federation/enhanced`) loads `remoteEntry.js` and the exposed module (e.g. `checkout/lifecycles`).
3. **single-spa** registers each remote’s `bootstrap` / `mount` / `unmount` and mounts into `#<scope>-mfe-root` in the shell UI.

## Develop

Run **`pnpm dev`** from the root to start **api** (3000), **web** (5173), **checkout-remote** (5174), and **registry-remote** (5175) together.

After seeding, open **`http://localhost:5173/`** — the shell lists the catalog and mounts checkout and registry remotes when their dev servers are up. Use the registry bay to POST new remotes; the shell refetches on `mf-catalog-changed`.

```sh
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=api
pnpm exec turbo dev --filter=checkout-remote
pnpm exec turbo dev --filter=registry-remote
```

## Useful Links

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)

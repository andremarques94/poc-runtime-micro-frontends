# ds-remote

Turborepo monorepo with a **Module Federation + single-spa shell** (`web`), a **`checkout-remote`** federated micro-app, a **Hono + Drizzle** catalog API, shared configs, and **Biome** (Ultracite) for lint/format.

Lint runs once at the workspace root via a **Turborepo root task** ([Biome + Turborepo](https://turborepo.dev/docs/guides/tools/biome)), not per app.

## Apps and packages

- `web`: Federation shell — **Webpack 5** + React + **single-spa** (`pnpm dev` → port **5173**; proxies `/api/*` to the API)
- `checkout-remote`: Federated remote `checkout` — exposes **`./lifecycles`** (single-spa-react) via **Module Federation** (`pnpm dev` → port **5174**)
- `api`: Hono + SQLite + Drizzle catalog ([`/mf/remotes`](apps/api/README.md); `pnpm dev` → port **3000**)
- `@repo/typescript-config`: shared `tsconfig` bases
- `@repo/biome-config`: shared Biome preset (`ultracite/biome/*` in [`preset.jsonc`](packages/biome-config/preset.jsonc)), extended by root [`biome.jsonc`](biome.jsonc)

## Commands

From the repo root:

```sh
pnpm install
pnpm --filter api db:seed   # checkout → /mf-checkout/remoteEntry.js (proxied via shell :5173)
pnpm dev                    # runs api + web + checkout-remote (Turbo)
pnpm build
pnpm lint
pnpm lint:fix
pnpm check-types
pnpm fix
```

## Containers

Production images are built from the root [`Dockerfile`](Dockerfile):

- `api`: compiled Hono API on port **3000** with `SQLITE_PATH=/data/app.db`.
- `web`: nginx on port **8080**, serving the shell and checkout remote while proxying `/api/*`.

Run the production-like stack locally:

```sh
docker compose up --build
```

Then open **`http://localhost:8080/`**. The API container is seeded in compose so `/api/mf/remotes` returns the checkout remote immediately.

See [`deploy/README.md`](deploy/README.md) for ECS notes and the nginx routing layout.

## Architecture

1. **API catalog** lists remotes (`remoteEntryUrl`, `scope`, `exposedModule`).
2. **Module Federation** (`@module-federation/enhanced`) loads `remoteEntry.js` and the exposed module (e.g. `checkout/lifecycles`).
3. **single-spa** registers each remote’s `bootstrap` / `mount` / `unmount` and mounts into `#<scope>-mfe-root` in the shell UI.

## Develop

Run **`pnpm dev`** from the root to start **api** (3000), **web** (5173), and **checkout-remote** (5174) together.

After seeding, open **`http://localhost:5173/`** — the shell shows the catalog JSON and mounts the checkout remote when port **5174** is up.

```sh
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=api
pnpm exec turbo dev --filter=checkout-remote
```

## Useful Links

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)

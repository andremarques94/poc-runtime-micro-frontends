# registry-remote

Federated **MFE registry** — teams register micro-frontends in the catalog without touching the shell build.

- Dev server: **http://localhost:5175**
- Federation entry: **`/mf-registry/remoteEntry.js`** (via shell proxy on :5173)
- Scope: **`registry`** — mounts into `#registry-mfe-root` in the shell

## Standalone

```sh
pnpm dev
```

Open port **5175** (proxies `/api` to the catalog API on :3000).

## With the shell

After `pnpm --filter api db:seed`, the registry remote is listed in the catalog. Open **http://localhost:5173/** and use the registry mount bay to add remotes.

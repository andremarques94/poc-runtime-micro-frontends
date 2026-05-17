# Container layout

This folder defines a **local stack** that mirrors how you would split concerns on AWS: static assets behind a reverse proxy and the API as its own process with a private database file.

## Services

- **edge** (`nginx`): serves the webpack shell from `/`, the federated remote from `/mf-checkout/`, and proxies `/api/*` to the API (same path rules as the webpack dev server).
- **api** (`node`): runs the compiled Hono server on port 3000 inside the network. SQLite lives on a named volume at `/data/app.db`.

## Run

From the repository root:

```sh
docker compose -f docker/docker-compose.yml up --build
```

Open `http://localhost:8080/`. On first start, `AUTO_SEED=1` loads the catalog row that points at `/mf-checkout/remoteEntry.js`.

Set `AUTO_SEED=0` in `docker-compose.yml` once you have real data; the seed script clears and reinserts catalog rows.

## ECS-style mapping

For production you would typically:

1. **Task definition — two containers** (similar to this compose file): an **nginx** (or ALB) sidecar/front container and an **api** container on a shared bridge network, with nginx proxying `/api` to `localhost:3000` or the task’s private address.
2. **Or** an **Application Load Balancer** with path rules: `/api/*` → target group for the API service, default → target group for static hosting (S3 + CloudFront, or nginx on Fargate/EC2).
3. Replace the SQLite volume with **RDS or another managed store** if the API is not single-instance; keep **one writer** for SQLite.

The API image runs as **root** in this template so a fresh named volume on `/data` remains writable for SQLite. For ECS/Fargate, run as a non-root user and initialize the data directory in an entrypoint or use a managed database instead of SQLite on a volume.

Health checks: the API exposes `GET /health`. Nginx also maps `GET /api/health` to the same handler for convenience when the load balancer only reaches the edge.

## Build notes

- `WEBPACK_PUBLIC_PATH` is set during the image build so chunk URLs match the `/mf-checkout/` prefix nginx uses for the remote.
- The API image uses `pnpm deploy` for a production `node_modules` tree, then copies the TypeScript `dist` output into that tree.

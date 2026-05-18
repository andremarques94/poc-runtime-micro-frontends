# Container deployment

This repo builds four production images from the root `Dockerfile`:

- `api`: Node 22 image that runs the compiled Hono API on port `3000`.
- `checkout`: nginx image that serves the checkout micro frontend at `/` on port `8080`.
- `registry`: nginx image that serves the registry micro frontend at `/` on port `8080`.
- `web`: nginx image that serves the shell at `/`, proxies `/mf-checkout/*` and `/mf-registry/*`, and proxies `/api/*` to `API_UPSTREAM`.

The `web` container is the browser-facing entry point. It routes traffic to three backend services: `checkout`, `registry`, and `api`:

| Route | Handled by | Env var |
| --- | --- | --- |
| `/` | shell static files (`apps/web/dist`) | — |
| `/mf-checkout/*` | `checkout` nginx container | `CHECKOUT_UPSTREAM` |
| `/mf-registry/*` | `registry` nginx container | `REGISTRY_UPSTREAM` |
| `/api/*` | `api` Node container | `API_UPSTREAM` |

The checkout micro frontend runs in its own container so it can be moved to a separate repository in the future — only the `CHECKOUT_UPSTREAM` value needs to change.

Each app owns its nginx configuration:

| App | nginx config |
| --- | --- |
| Shell | `apps/web/nginx/default.conf.template` |
| Checkout | `apps/checkout-remote/nginx/default.conf.template` |
| Registry | `apps/registry-remote/nginx/default.conf.template` |

## Local production smoke

```sh
docker compose run --rm --build api-seed
docker compose up --build
```

Open `http://localhost:8080/`. The one-shot seed command populates the local SQLite volume so the shell can load `/api/mf/remotes` immediately. Re-run it only when you want to reset the demo catalog data.

Useful checks:

```sh
curl http://localhost:8080/health
curl http://localhost:8080/api/mf/remotes
curl -I http://localhost:8080/mf-checkout/remoteEntry.js
curl -I http://localhost:8080/mf-registry/remoteEntry.js
curl http://localhost:8081/health   # checkout container directly
curl http://localhost:8082/health   # registry container directly
```

## Image targets

```sh
docker build --target api      -t ds-remote-api      .
docker build --target checkout -t ds-remote-checkout .
docker build --target registry -t ds-remote-registry .
docker build --target web      -t ds-remote-web      .
```

## API serving pattern

Run nginx as the public service. It owns the browser-facing origin, serves the shell and micro frontend static assets, and forwards `/api/*` to the API container. Set `API_UPSTREAM` to the API service host and port, such as `api:3000` in compose.

Run the API as a private service on port `3000`. Set:

- `PORT=3000`
- `SQLITE_PATH=/data/app.db`

SQLite is only the local catalog store for this proof of concept. When the API moves to Postgres, keep the same container boundary and replace the SQLite volume with database connection settings such as `DATABASE_URL`; Terraform can then create the managed database, networking, and runtime service definitions.

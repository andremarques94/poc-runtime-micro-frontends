# Container deployment

This repo builds two production images from the root `Dockerfile`:

- `api`: Node 22 image that runs the compiled Hono API on port `3000`.
- `web`: nginx image that serves the shell at `/`, serves the checkout remote from `/mf-checkout/`, and proxies `/api/*` to `API_UPSTREAM`.

The nginx image is the browser-facing container. It serves both static bundles from disk:

| Bundle | Route | Files |
| --- | --- | --- |
| Shell | `/` | `apps/web/dist` |
| Checkout micro frontend | `/mf-checkout/` | `apps/checkout-remote/dist` |

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
```

## Image targets

Build the API image with the `api` target:

```sh
docker build --target api -t ds-remote-api .
```

Build the nginx/static image with the `web` target:

```sh
docker build --target web -t ds-remote-web .
```

## API serving pattern

Run nginx as the public service. It owns the browser-facing origin, serves the shell and micro frontend static assets, and forwards `/api/*` to the API container. Set `API_UPSTREAM` to the API service host and port, such as `api:3000` in compose.

Run the API as a private service on port `3000`. Set:

- `PORT=3000`
- `SQLITE_PATH=/data/app.db`

SQLite is only the local catalog store for this proof of concept. When the API moves to Postgres, keep the same container boundary and replace the SQLite volume with database connection settings such as `DATABASE_URL`; Terraform can then create the managed database, networking, and runtime service definitions.

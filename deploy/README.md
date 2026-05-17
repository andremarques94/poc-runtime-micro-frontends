# Container deployment

This repo builds two production images from the root `Dockerfile`:

- `api`: Node 22 image that runs the compiled Hono API on port `3000`.
- `web`: nginx image that serves the shell at `/`, serves the checkout remote from `/mf-checkout/`, and proxies `/api/*` to `API_UPSTREAM`.

## Local production smoke

```sh
docker compose up --build
```

Open `http://localhost:8080/`. The compose file seeds a local SQLite volume before starting the API so the shell can load `/api/mf/remotes` immediately.

Useful checks:

```sh
curl http://localhost:8080/health
curl http://localhost:8080/api/mf/remotes
curl -I http://localhost:8080/mf-checkout/remoteEntry.js
```

## ECS shape

Build and push the API image with the `api` target:

```sh
docker build --target api -t ds-remote-api .
```

Run the API as its own ECS Fargate service behind an internal target group. Set:

- `PORT=3000`
- `SQLITE_PATH=/data/app.db`
- an EFS mount at `/data` if SQLite remains the backing store

`deploy/ecs/api-task-definition.example.json` mirrors that runtime shape. SQLite should stay single-writer; move the catalog to a managed database before scaling the API service beyond one task.

Build and push the nginx image with the `web` target:

```sh
docker build --target web -t ds-remote-web .
```

Run nginx as the public service. It owns the browser-facing origin and forwards `/api/*` to the API target group, matching the local compose topology and the dev server proxy paths.

Set `API_UPSTREAM` to the API service DNS name, Cloud Map name, or internal ALB host and port, such as `api.internal:3000`.

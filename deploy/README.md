# Deployment notes

## Images

- API image: `docker/api.Dockerfile`
- Edge image (Nginx + static web assets): `docker/nginx.Dockerfile`

Build locally:

```sh
docker compose build
```

## Local runtime that mirrors production routing

```sh
docker compose up -d
docker compose exec api node dist/scripts/seed.js
```

- App entry: `http://localhost:8080`
- Nginx forwards `/api/*` to API and serves `/mf-checkout/*` from static files.

## ECS recommendation for API

Use the API container image as an ECS service behind an ALB target group:

1. Health check target on `/health`.
2. Keep `PORT=3000`.
3. Set `SQLITE_PATH` to an EFS mount path (example: `/mnt/data/app.db`) to avoid data loss on task restart.
4. Run seeding as a one-off ECS task (`node dist/scripts/seed.js`) during environment bootstrap, not on every service start.

Template task definition: `deploy/ecs/api-task-definition.json`.

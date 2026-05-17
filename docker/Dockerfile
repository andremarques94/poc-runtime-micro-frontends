# syntax=docker/dockerfile:1

FROM node:22-bookworm AS builder

RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages

ENV HUSKY=0
RUN pnpm install --frozen-lockfile

RUN WEBPACK_PUBLIC_PATH=/ pnpm exec turbo run build --filter=web
RUN WEBPACK_PUBLIC_PATH=/mf-checkout/ pnpm exec turbo run build --filter=checkout-remote
RUN pnpm exec turbo run build --filter=api

RUN pnpm --filter api deploy --prod /out/api \
	&& cp -r apps/api/dist /out/api/dist \
	&& rm -rf /out/api/src

FROM nginx:1.27-alpine AS nginx

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html
COPY --from=builder /repo/apps/checkout-remote/dist /usr/share/nginx/html/mf-checkout

FROM node:22-bookworm-slim AS api

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /out/api ./
COPY apps/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]

# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
WORKDIR /app
RUN corepack enable

FROM base AS deps
RUN apt-get update \
	&& apt-get install -y --no-install-recommends g++ make python3 \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/checkout-remote/package.json apps/checkout-remote/package.json
COPY packages/biome-config/package.json packages/biome-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json

RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm build

FROM build AS api-prod
RUN pnpm --filter api deploy --prod /prod/api

FROM node:22-bookworm-slim AS api
ENV NODE_ENV="production"
ENV PORT="3000"
ENV SQLITE_PATH="/data/app.db"
WORKDIR /app/apps/api

RUN mkdir -p /data && chown -R node:node /app /data
COPY --chown=node:node --from=api-prod /prod/api/node_modules ./node_modules
COPY --chown=node:node --from=build /app/apps/api/package.json ./package.json
COPY --chown=node:node --from=build /app/apps/api/dist ./dist
COPY --chown=node:node --from=build /app/apps/api/drizzle ./drizzle

EXPOSE 3000
USER node
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:3000/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]

FROM nginx:1.27-alpine AS web
ENV API_UPSTREAM="api:3000"
COPY deploy/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
COPY --from=build /app/apps/checkout-remote/dist /usr/share/nginx/html/mf-checkout
RUN touch /var/run/nginx.pid \
	&& chown -R nginx:nginx /etc/nginx/conf.d /etc/nginx/templates /usr/share/nginx/html /var/cache/nginx /var/run/nginx.pid

EXPOSE 8080
USER nginx
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD wget -qO- http://127.0.0.1:8080/health >/dev/null || exit 1

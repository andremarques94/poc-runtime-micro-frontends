# syntax=docker/dockerfile:1.7

FROM node:20-alpine AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps/web ./apps/web
COPY apps/checkout-remote ./apps/checkout-remote
COPY apps/api/src ./apps/api/src

RUN pnpm install --frozen-lockfile --filter web... --filter checkout-remote...
RUN pnpm --filter checkout-remote build
RUN pnpm --filter web build

FROM nginx:1.27-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/apps/web/dist/ /usr/share/nginx/html/
COPY --from=build /workspace/apps/checkout-remote/dist/ /usr/share/nginx/html/mf-checkout/

EXPOSE 80

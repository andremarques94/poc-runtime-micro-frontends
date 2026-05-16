# web

**Webpack 5** shell + React + **single-spa**. Proxies **`/api`** to the Hono API (port **3000**) and **`/mf-checkout`** to **checkout-remote** ([`webpack.config.cjs`](webpack.config.cjs)).

- **Module Federation** ([`src/mf/host.ts`](src/mf/host.ts)): loads remotes from the catalog via `@module-federation/enhanced/runtime`
- **single-spa** ([`src/mf/spa.ts`](src/mf/spa.ts)): registers `bootstrap` / `mount` / `unmount` and mounts into `#<scope>-mfe-root`

```sh
pnpm dev
```

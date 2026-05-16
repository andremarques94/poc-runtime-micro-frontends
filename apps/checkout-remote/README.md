# checkout-remote

**Webpack 5** + [**@module-federation/enhanced**](https://www.npmjs.com/package/@module-federation/enhanced) remote (`name: checkout`). Exposes **`./lifecycles`** — single-spa-react wrappers around the checkout UI ([`src/checkout-spa.tsx`](src/checkout-spa.tsx)).

- Dev server: **http://localhost:5174**
- Federation entry: **`http://localhost:5174/remoteEntry.js`**
- **With the shell:** seed uses **`/mf-checkout/remoteEntry.js`**; shell proxies **`/mf-checkout`** → this app

Standalone preview (without the shell): open port **5174** — uses [`src/bootstrap.tsx`](src/bootstrap.tsx).

```sh
pnpm dev
pnpm build
```

After changing `remoteEntryUrl` or `exposedModule`, re-seed:

```sh
pnpm --filter api db:seed
```

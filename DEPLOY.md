# Cloudflare Workers deployment

## package.json scripts

- `npm run build` — builds the Vite app into `dist/`
- `npm run deploy` — runs build, then `wrangler deploy`

## Cloudflare Workers Builds settings

In the dashboard: **Workers & Pages** → **expense-tracker** → **Settings** → **Build**

| Setting | Value |
|--------|--------|
| **Build command** | *(leave empty, or remove `npm run build` if set)* |
| **Deploy command** | `npm run deploy` |

Do **not** use `npx wrangler deploy` alone — that runs before `dist/` exists and causes:

```
The directory specified by assets.directory does not exist: /dist
```

`npm run deploy` runs `npm run build` first, then deploys from `./dist`.

## Local deploy

```bash
npm ci
npm run deploy
```

# Cloudflare Workers deployment

## Auto-deploy from GitHub

Every push to `main` triggers Cloudflare Workers Builds (if repo is connected).

**Required Cloudflare settings** — Workers & Pages → **expense-tracker** → Settings → **Build**:

| Setting | Value |
|--------|--------|
| **Install command** | `npm ci` |
| **Build command** | *(leave empty)* |
| **Deploy command** | `npm run deploy` |

Do **not** use `npx wrangler deploy` alone — `dist/` will not exist yet.

## package.json scripts

- `npm run build` — builds the Vite app into `dist/`
- `npm run deploy` — runs build, then `wrangler deploy`

## Local deploy (needs `CLOUDFLARE_API_TOKEN` or `wrangler login`)

```bash
npm ci
npm run deploy
```

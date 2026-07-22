# LunchPool

**Group ordering** app (lunch orders): one person creates an order, shares a link,
and others join to add their items. Each order and its share link are kept for
**6 hours** before expiring automatically (native Redis TTL).

> Status: **project setup** (technical foundation). Screens and business logic are not
> implemented yet.

## Stack

- [Nuxt 4](https://nuxt.com) + [Nuxt UI 4](https://ui.nuxt.com) (Tailwind CSS 4, Reka UI, Iconify icons)
- [Pinia](https://pinia.vuejs.org) — client state
- [VueUse](https://vueuse.org) — utilities (clipboard, heartbeat…)
- [@nuxtjs/i18n](https://i18n.nuxtjs.org) — internationalization (default `fr`)
- [Zod](https://zod.dev) — API payload validation
- [Upstash Redis](https://upstash.com) — serverless storage with TTL (6 h)
- Deployment: [Vercel](https://vercel.com) (Nitro `vercel` preset)

Package manager: **pnpm** (via `corepack`).

## Prerequisites

- Node.js 20/22 LTS recommended (the project also works on Node 24)
- `corepack` enabled (bundled with Node) to use the pnpm version pinned in `package.json`

## Installation

```bash
corepack pnpm install
```

## Redis configuration (Upstash)

1. Create a free Redis database at https://console.upstash.com
2. In the database's **REST API** tab → copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
3. Put them in a local `.env` file (see `.env.example`):

```bash
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## Development

```bash
corepack pnpm dev
```

The app starts at http://localhost:3000.

### Verifying the Redis connection

A health route writes a key with a TTL and reads it back:

```bash
curl http://localhost:3000/api/health
# → {"ok":true,"value":<timestamp>,"ttl":21600}
```

A `ttl` close to `21600` confirms the 6-hour expiration. Without valid Upstash credentials in `.env`,
this route returns a connection error — expected until the database is configured.

## Branching & releases

- `master` — production branch, deployed by Vercel
- `develop` — integration branch: everything validated and ready to ship
- Feature work goes through branches/PRs targeting `develop` (CI runs lint + typecheck)
- Feature PRs are **squash-merged** into `develop`; release PRs are **merge-committed**
  into `master` so both branches share the same history (enforced by branch rulesets)

To release: GitHub → **Actions** → **release** → *Run workflow*, enter a version (e.g. `1.2.0`).
The workflow opens a PR from `develop` to `master`, waits for CI, merges it, tags `v1.2.0`
and creates a GitHub Release with generated notes. Vercel then deploys `master` to
production automatically.

## Deployment (Vercel)

1. Import the repository at https://vercel.com (Nuxt is auto-detected, no `vercel.json` required)
2. Set the `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` environment variables in
   **Settings → Environment Variables**
3. Deploy

> Real-time note: Nitro WebSockets require persistent hosting and do not work on
> Vercel serverless. Presence/real-time will be done via **polling** on Vercel.

## Useful scripts

```bash
corepack pnpm dev        # dev server
corepack pnpm build      # production build
corepack pnpm preview    # preview the build
corepack pnpm typecheck  # type checking
corepack pnpm lint       # ESLint
```

# @camp_candor/dashboard

Astro + Cloudflare SSR application powering the Camp Candor Cauldron web
cockpit.

## Features

- **Astro SSR with Cloudflare Adapter**: Edge runtime deployment configured via
  `@astrojs/cloudflare` and `wrangler.jsonc`.
- **Clerk Authentication**: Dynamic middleware integration for session
  orchestration and role gating.
- **Tailwind CSS v4**: Modern utility-first styling with `@tailwindcss/vite`.
- **V8 Boundary Shield Verification**: Guard scan ensuring no unsupported Node
  built-ins enter production client bundles.

## Scripts

Run commands either directly in `apps/dashboard` or from the monorepo root:

| Command                 | Action                                              |
| :---------------------- | :-------------------------------------------------- |
| `npm run dev`           | Start local Astro development server                |
| `npm run build`         | Build SSR application and client assets to `dist/`  |
| `npm run preview`       | Run production bundle locally via Wrangler          |
| `npm run deploy`        | Build and deploy to Cloudflare                      |
| `npm run verify:bundle` | Scan production bundle for unsupported Node imports |
| `npm run test`          | Run unit test suite (Vitest)                        |
| `npm run test:e2e`      | Run end-to-end suite (Puppeteer + Vitest)           |

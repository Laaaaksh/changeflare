# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

## Layout

npm workspaces monorepo: `apps/web` (Next.js 16 app — admin dashboard, public
`/changelog` pages, all API routes) and `packages/widget` (the embeddable
`<script>` bundle, built separately with esbuild, kept dependency-free and
under ~4 KB gzipped). `apps/web/scripts/copy-widget.mjs` copies the widget's
`dist/widget.js` into `apps/web/public/` — it must run before `next dev`/`next
build` (already wired into both npm scripts and the Makefile).

## Build/test — see CONTRIBUTING.md

Don't duplicate the commands here; CONTRIBUTING.md documents the real
clone/build/test workflow and stays authoritative for it.

## Sharp edges

- **Prisma is pinned to 6.19.3, not the "latest" tag.** Prisma 7's `prisma`
  CLI removed schema-file `datasource.url` in favor of a `prisma.config.ts` +
  driver-adapter setup; 6.19.3 is the last version supporting the classic
  `url = env("DATABASE_URL")` pattern this project uses. Don't blindly bump to
  latest without migrating the config approach first.
- **eslint is pinned to 9.39.5.** `eslint-config-next@16.3.3`'s flat config
  (imported directly in `apps/web/eslint.config.mjs` — no `FlatCompat` needed,
  it ships real flat config now) breaks under eslint 10 with a circular-JSON
  crash in `@eslint/eslintrc`'s error formatter. If bumping eslint, verify
  `npm run lint -w apps/web` still works before merging.
- **Any page that queries Prisma directly at the top of a Server Component
  must set `export const dynamic = "force-dynamic"`** (see `src/app/page.tsx`,
  `login/page.tsx`, `setup/page.tsx`) — otherwise Next tries to statically
  prerender it at `next build` time, which requires a live DB connection and
  breaks the Docker build (there's no DB during `docker build`). This bit us
  once already; if you add a new page reading DB state to decide what to
  render (not just inside a Route Handler), add the same export.
- **`node:crypto` must not leak into `middleware.ts`'s import graph** — it
  runs on the Edge Runtime. `SESSION_COOKIE` lives in its own
  `lib/session-cookie.ts` with zero dependencies specifically so middleware
  can import just the cookie name without pulling in `lib/auth.ts`'s
  `scryptSync`/`createHmac` usage.
- **The widget's audience-matching and unread-count logic intentionally live
  in two different places** — `apps/web/src/lib/audience.ts` (server, filters
  which posts a request even returns) and
  `packages/widget/src/unread.ts` (client, computes the badge count from
  posts already filtered by the server). They're not duplicates of the same
  concern; don't try to unify them into one shared package.
- **Widget vitest tests need `NODE_OPTIONS=--no-experimental-webstorage`**
  (already set in `packages/widget/package.json`'s `test` script) — Node's own
  built-in `localStorage` global otherwise shadows jsdom's per-window
  implementation and the storage tests fail in a confusing way (right error
  message, wrong object).
- **`docker-compose.yml` port collisions**: Postgres binds to
  `127.0.0.1:${POSTGRES_PORT:-5432}` (loopback only — the image ships default
  creds) and the app to `${APP_PORT:-3000}`. If either is already taken
  locally, set `POSTGRES_PORT`/`APP_PORT` in `.env` rather than editing the
  compose file.
- **Sibling worktrees of this repo share Docker state.** Compose derives the
  project name from the directory basename (`changeflare`), so two checkouts
  both named `changeflare` on the same Docker host reuse the same named
  volume (`changeflare_postgres-data`) and network — one worktree's `docker
  compose down` or stale data can surface in another's run. Confirmed by
  seeing a prior worktree's admin account still present after a fresh `up`.
  Set `COMPOSE_PROJECT_NAME` if you need real isolation between worktrees.
- **`docs/assets/demo.mp4`/`demo.gif` are captured, not hand-made.**
  `scripts/record-demo/` is a standalone Playwright package (dev-only, not an
  npm workspace — it must not become a product dependency) that drives the
  real UI end to end and writes `output/raw.webm`; `convert.sh` turns that
  into the two committed assets. Re-run with `make demo` (boots a fresh
  stack, records, converts, tears down) whenever the admin or widget UI
  changes enough to make the demo stale — see `scripts/record-demo/README.md`.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.

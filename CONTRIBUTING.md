# Contributing to Changeflare

Thanks for considering a contribution. This is a young project, so if you're
planning something bigger than a small fix, open an issue first so we can
agree on the approach before you put time into it.

## Project layout

An npm workspaces monorepo:

- `apps/web` — the Next.js app: admin dashboard, public `/changelog` pages,
  and all API routes (both the authenticated admin API and the public,
  CORS-open widget API)
- `packages/widget` — the embeddable `<script>` bundle, built separately with
  esbuild and kept dependency-free and small

## Clone, build, and test

```bash
git clone https://github.com/Laaaaksh/changeflare.git
cd changeflare
npm install

# Local Postgres for development (or point apps/web/.env at your own)
docker compose up -d postgres
cp apps/web/.env.example apps/web/.env   # DATABASE_URL already matches docker-compose's postgres
# set SESSION_SECRET in apps/web/.env — openssl rand -base64 32
npm run db:migrate                        # creates/updates prisma/migrations

npm run dev      # apps/web on http://localhost:3000, widget rebuilt first
npm test         # widget + web unit tests (vitest)
npm run lint      # widget typecheck (tsc --noEmit) + web eslint
npm run build     # production build of both packages
```

These map to `make run`, `make test`, `make lint`, and `make build` if you'd
rather use the Makefile.

## Before opening a PR

- `master` is protected — all changes land through a PR, no direct pushes.
- Run `make lint` and `make test` locally; both must pass. CI runs the same
  three checks (`lint`, `test`, `build` — see `.github/workflows/ci.yml`) and
  they're required to merge.
- Add or update tests for any behavior change. We aim for tests that would
  actually fail if the change were reverted — not tests that just execute the
  code path.
- Add a bullet under `## [Unreleased]` in `CHANGELOG.md` for any user-facing
  change (new feature, fixed bug, changed behavior). Purely internal changes
  (refactors, CI tweaks, docs typos) don't need one.

## Code style

- TypeScript, `strict: true`, everywhere. Don't add `any` to work around a
  type error — fix the type.
- `packages/widget` ships on other people's pages: no new runtime
  dependencies without a real reason, and re-check the gzipped bundle size
  (`gzip -c packages/widget/dist/widget.js | wc -c`) if you touch it — it's
  currently ~3.6 KB and should stay in that neighborhood.
- Server-side Markdown rendering (`apps/web/src/lib/markdown.ts`) is the one
  place XSS actually matters, since the output is embedded on third-party
  pages — if you change the sanitizer's allowed tags/attributes, add a test
  in `apps/web/src/test/markdown.test.ts` proving the specific thing you
  opened up is still safe.
- Match whatever the surrounding file already does over introducing a new
  pattern.

## Releasing (maintainers)

1. Move the relevant `## [Unreleased]` bullets under a new
   `## [X.Y.Z] - YYYY-MM-DD` heading in `CHANGELOG.md`, and update the compare
   links at the bottom of the file.
2. Commit that, then tag: `git tag vX.Y.Z && git push origin vX.Y.Z`.
3. Pushing the tag triggers `.github/workflows/release.yml`, which builds and
   pushes a `ghcr.io/laaaaksh/changeflare:X.Y.Z` Docker image and creates a
   GitHub Release whose notes are pulled directly from that CHANGELOG
   section — the release fails loudly if the section is missing, so step 1
   isn't optional.

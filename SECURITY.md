# Security Policy

## Supported versions

Changeflare is pre-1.0. Security fixes are made against the latest release and
`master` only — there is no long-term support branch yet.

## Reporting a vulnerability

Please report vulnerabilities privately via
[GitHub Security Advisories](https://github.com/Laaaaksh/changeflare/security/advisories/new)
rather than a public issue. We'll acknowledge reports within a few days.

## What's in scope

Changeflare's real trust boundary is that **post content, once published, is
rendered as HTML on other people's pages** (both the embedded widget and the
public `/changelog` page). The things most worth reporting:

- Any way Markdown/HTML input on a post (title, body, cover image URL) can
  survive sanitization (`apps/web/src/lib/markdown.ts`, backed by
  `sanitize-html`) and execute script, load a `javascript:`/`data:` URL, or
  break out of the widget's Shadow DOM styling on an embedding page
- A way to forge or replay an admin session cookie, or bypass `SESSION_SECRET`
  signature verification (`apps/web/src/lib/auth.ts`)
- A way for the widget's public, unauthenticated API routes
  (`/api/widget/*` — deliberately CORS-open, since they only ever return
  already-published post data) to read or mutate anything beyond published
  posts, view/click counters, and a visitor's own read-state row
- SQL injection, since queries go through Prisma — any path that reaches raw
  SQL construction from user input would be a bug worth a report
- Password hashing weaknesses in `hashPassword`/`verifyPassword` (Node's
  built-in `scrypt`, not a third-party crypto implementation)

## What's out of scope

- Denial-of-service reports that just describe sending a lot of traffic —
  self-hosted instances are expected to run behind their own rate limiting
  if that's a concern
- Missing security headers on a self-hosted deployment that hasn't been put
  behind TLS/a reverse proxy — that's a deployment choice, documented in the
  README, not a Changeflare bug
- Reports that require an attacker to already have your instance's admin
  credentials or `SESSION_SECRET`

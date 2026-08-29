# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.0] - 2026-08-29

### Added

- Embeddable changelog widget: a bell icon with an unread-count badge, opening
  a panel of published posts, built as a dependency-free ~3.6 KB gzipped
  Shadow DOM bundle
- Admin dashboard with a Markdown post editor (live preview, draft/publish
  states, cover images), per-post view/click counters, and total widget-open
  count
- Simple audience targeting: show a post to everyone, or only to visitors
  matching attribute conditions passed into the widget
- Server-synced read state for visitors identified with an external user id,
  falling back to `localStorage` for anonymous visitors
- Public, unauthenticated `/changelog` page rendering the same posts
- First-run admin account setup, scrypt password hashing, signed session
  cookies
- Docker Compose self-hosting path (Postgres + migration job + app)

[Unreleased]: https://github.com/Laaaaksh/changeflare/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Laaaaksh/changeflare/releases/tag/v0.1.0

# record-demo

Dev-only tooling that records a genuine end-to-end Changeflare walkthrough
with Playwright and turns it into the demo assets embedded in the root
README (`docs/assets/demo.mp4` / `demo.gif`). It is a standalone npm package
so Playwright never becomes a dependency of the product build.

## One command

```bash
make demo
```

Boots a fresh Docker Compose stack (existing data is wiped so the recording
starts from `/setup`), records the walkthrough, converts it, and tears the
stack back down.

## Manual steps

```bash
# 1. Fresh stack, reachable at localhost:3000, no admin account yet
docker compose down -v
docker compose up --build -d

# 2. Install the recorder's own deps (kept out of the product's package.json)
cd scripts/record-demo
npm install
npx playwright install chromium

# 3. Record — drives the real UI end to end and writes output/raw.webm
npm run record

# 4. Convert output/raw.webm into docs/assets/demo.mp4 + demo.gif
./convert.sh
```

## What it records

1. Creates the admin account via `/setup`.
2. Writes and publishes a post (title, Markdown body, cover image) from the
   admin dashboard.
3. Opens a separate static "host" page (served locally by the recorder) with
   the widget installed via the real `<script src=".../widget.js">` snippet,
   and shows the unread badge, the panel opening, the post being read, and
   the badge clearing.

`record.mjs` paces itself with deliberate waits so the result reads as a
walkthrough, not a speedrun, and is deterministic: re-running it against a
freshly seeded stack (no existing admin user) reproduces the same recording.

## Notes

- Requires `ffmpeg` on `PATH` for `convert.sh`.
- `CHANGEFLARE_URL` (default `http://localhost:3000`) points the recorder at
  the running app. `RECORD_DEMO_HOST_PORT` (default `4949`) is the local port
  used for the static host page.
- If the app already has an admin account, `record.mjs` will fail at the
  `/setup` step — reset the stack (`docker compose down -v`) first.

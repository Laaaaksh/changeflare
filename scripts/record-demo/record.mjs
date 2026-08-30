// Records a real end-to-end Changeflare walkthrough against a genuinely running
// stack: author + publish a post in the admin, then read it through the
// embeddable widget on a separate "host" page. Produces a raw .webm video;
// convert.sh turns that into docs/assets/demo.mp4 and demo.gif.
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, rm, readdir, rename } from "node:fs/promises";
import { chromium } from "@playwright/test";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, "output");

const APP_URL = process.env.CHANGEFLARE_URL ?? "http://localhost:3000";
const HOST_PAGE_PORT = Number(process.env.RECORD_DEMO_HOST_PORT ?? 4949);

const ADMIN_EMAIL = "admin@changeflare.dev";
const ADMIN_PASSWORD = "demo-changelog-2026!";

const POST_TITLE = "Dark mode is here";
const POST_BODY = `We shipped **dark mode** across the whole app, based on the most-requested item in our feedback board.

- Toggle it from the settings menu, or let it follow your OS preference
- Applies to the public changelog page too
- No flash of the wrong theme on load

More is coming — [see the roadmap](https://example.com/roadmap) for what's next.`;

// A small generated gradient PNG, embedded so the recording needs no network
// access for the cover image and stays deterministic across runs.
const COVER_IMAGE_DATA_URI =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPAAAABkCAIAAAA3wCqQAAAEJklEQVR42u3Sd1cICgCGcV/ifRFZEVkhIiIiQmRFRGZEZIsI2SsiQomIiOyZlSIy7nb33nvv+9ftfox7zvOc5yP86tX/Lzdo4IYNHRDgRgFu3MiBjd0k0E0D3ayJmzd1i2YOauaWzd2qhYOD3DrIbVo6pJVDgt022O1au30bdwhxxxCHtnWndu7c3l3aO6yDu3Z0t1CHh7p7J/fo7Igu7hnmXmGO7OrIbu4d7j7hjuruvj3cL8LREe7f0wN6OSbSAyM9qLdj+3hwlIdEeWhfx/XzsGgPj3Z8f8cP8IgYj4zxqIEePchjYp0Q67GDPW6IE4d6fJwnxDlpmCcO96R4J8d78ghPGempozyt7tGePsYzEpyS4JljPWucUxM9O9FzxjttgucmeV6S0yd6/iQvSPbCZC+a7MVTvGSql9Y9zcumO2OGl6d4RYozZ3rlLK9KdVaqV8/2mjlem+bsNK+b6/XzvCHdG9O9ab43L/CWhXVr6yJtW6ztS7RjiXKWaucy7cpQboZ2L9eeFcrL1N5M7Vup/FXan6UDWTq4WgVrVLhWhdk6lK2idTq8Xkc2qHiDjm7UsU0q2azjm3Vii0q36uQ2ndqmsu06vUNnclSeo7M7dW6XzuXqfK4u7NbFPbqUp8t5urJXV/fpWr6u5+vGflUc0M2DulWg2wW6U6i7h1RZpHtFqjqsqiOqLtb9Yj04qppjeliiRyWqPa7HJ/SkVE9L9eykXjilF8v0UplePq1XzujVcr1Wrudn9fycXj+vN87rzQt666LevqR3Luvdy3rvit6/qg+u6cNr+ui6Pr6hTyr0aYU+u6nPb+mL2/qy7jv66q6+rtQ3lfr2nr6r0vfV+qFaP97XTw/0c41+qdGvD/XbI/1eqz9q9edj/fVEfz/VP89UD9CABjSgAQ1oQAMa0IAGNKABDWhAAxrQgAY0oAENaEADGtCABjSgAQ1oQAMa0IAGNKABDWhAAxrQgAY0oAENaEADGtCABjSgAQ1oQAMa0IAGNKABDWhAAxrQgAY0oAENaEADGtCABjSgAQ1oQAMa0IAGNKABDWhAAxrQgAY0oAENaEADGtCABjSgAQ1oQAMa0IAGNKABDWhAAxrQgAY0oAENaEADGtCABjSgAQ1oQAMa0IAGNKABDWhAAxrQgAY0oAENaEADGtCABjSgAQ1oQAMa0IAGNKABDWhAAxrQgAY0oAENaEADGtCABjSgAQ1oQAMa0IAGNKD/P6D/Be2rFlqR1/lgAAAAAElFTkSuQmCC";

const HOST_PAGE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Acme Docs — demo host page</title>
<style>
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f5f5f4; color: #171717; }
  header { padding: 20px 32px; border-bottom: 1px solid #e5e5e5; background: #fff; }
  main { max-width: 720px; margin: 0 auto; padding: 48px 32px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  p { line-height: 1.6; color: #404040; }
</style>
</head>
<body>
<header><strong>Acme Docs</strong></header>
<main>
  <h1>Welcome to Acme</h1>
  <p>This page is a stand-in for a real customer site with the Changeflare widget installed via one script tag. Look for the bell icon in the bottom-right corner.</p>
</main>
<script src="${APP_URL}/widget.js" async></script>
</body>
</html>`;

function startHostServer() {
  return new Promise((resolve) => {
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(HOST_PAGE_HTML);
    });
    server.listen(HOST_PAGE_PORT, "127.0.0.1", () => resolve(server));
  });
}

async function main() {
  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  const hostServer = await startHostServer();
  const hostPageUrl = `http://127.0.0.1:${HOST_PAGE_PORT}/`;

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 2,
    recordVideo: { dir: OUTPUT_DIR, size: { width: 1280, height: 800 } },
  });
  const page = await context.newPage();

  try {
    // --- Admin: create the account (first run on a freshly seeded stack) ---
    await page.goto(`${APP_URL}/setup`);
    await page.waitForTimeout(3000);
    await page.locator("#email").fill(ADMIN_EMAIL);
    await page.waitForTimeout(600);
    await page.locator("#password").fill(ADMIN_PASSWORD);
    await page.waitForTimeout(900);
    await page.getByRole("button", { name: "Create admin account" }).click();
    await page.waitForURL("**/admin");
    await page.waitForTimeout(5000);

    // --- Admin: author and publish a post ---
    await page.getByRole("link", { name: "New post" }).last().click();
    await page.waitForURL("**/admin/posts/new");
    await page.waitForTimeout(2500);

    await page.locator("#title").pressSequentially(POST_TITLE, { delay: 45 });
    await page.waitForTimeout(700);
    await page.locator("#cover").fill(COVER_IMAGE_DATA_URI);
    await page.waitForTimeout(700);
    await page.locator("#body").pressSequentially(POST_BODY, { delay: 15 });
    await page.waitForTimeout(6000);

    await page.getByRole("button", { name: "Publish" }).click();
    await page.waitForURL("**/admin");
    await page.waitForTimeout(6500);

    // --- Reader: the same post through the embedded widget on another page ---
    await page.goto(hostPageUrl);
    await page.waitForTimeout(6000);

    const trigger = page.locator(".cf-trigger");
    await trigger.waitFor({ state: "visible" });
    await page.waitForTimeout(2000);
    await trigger.click();
    await page.waitForTimeout(2000);

    await page.waitForTimeout(1000);
    await page.locator(".cf-item").first().click();
    await page.waitForTimeout(7000);

    await page.waitForTimeout(2500);
    await page.locator(".cf-close").click();
    await page.waitForTimeout(2500);
  } finally {
    await context.close();
    await browser.close();
    hostServer.close();
  }

  const files = await readdir(OUTPUT_DIR);
  const video = files.find((f) => f.endsWith(".webm"));
  if (!video) throw new Error("Playwright did not produce a video file");
  await rename(path.join(OUTPUT_DIR, video), path.join(OUTPUT_DIR, "raw.webm"));
  console.log(`Recorded ${path.join(OUTPUT_DIR, "raw.webm")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

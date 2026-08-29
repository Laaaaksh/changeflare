// The embed widget is built separately (packages/widget) and served as a static
// asset from this app so a single Changeflare deployment hosts both the
// dashboard and the <script> tag customers embed.
import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(new URL("../../../packages/widget/dist/widget.js", import.meta.url));
const destDir = fileURLToPath(new URL("../public", import.meta.url));
const dest = fileURLToPath(new URL("../public/widget.js", import.meta.url));

await mkdir(destDir, { recursive: true });
await copyFile(src, dest);
console.log("copied widget.js into public/");

import * as esbuild from "esbuild";
import { fileURLToPath } from "node:url";
import { stat } from "node:fs/promises";

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: [fileURLToPath(new URL("./src/index.ts", import.meta.url))],
  outfile: fileURLToPath(new URL("./dist/widget.js", import.meta.url)),
  bundle: true,
  minify: true,
  sourcemap: true,
  target: ["es2020"],
  format: "iife",
  legalComments: "none",
};

if (watch) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  console.log("watching for changes...");
} else {
  await esbuild.build(options);
  const { size } = await stat(options.outfile);
  console.log(`built dist/widget.js (${(size / 1024).toFixed(1)} KB minified)`);
}

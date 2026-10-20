// Reports what consumers actually pay: minified + gzipped/brotli size of the ESM bundle
// (React excluded), for the full entry and for tree-shaken single imports.
import { build } from "esbuild";
import { readFileSync } from "node:fs";
import { gzipSync, brotliCompressSync } from "node:zlib";

const entries = {
  "everything (import *)": `export * from "./dist/index.js";`,
  "{ Rating }": `export { Rating } from "./dist/index.js";`,
  "{ useRating } (headless)": `export { useRating } from "./dist/index.js";`,
  "{ ThumbsRating }": `export { ThumbsRating } from "./dist/index.js";`,
  "{ RatingSummary }": `export { RatingSummary } from "./dist/index.js";`,
  "{ ExperienceRating }": `export { ExperienceRating } from "./dist/index.js";`,
};

const fmt = (n) => `${(n / 1024).toFixed(2)} kB`;
const rows = [];
for (const [name, contents] of Object.entries(entries)) {
  const result = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: "js" },
    bundle: true,
    minify: true,
    format: "esm",
    write: false,
    external: ["react", "react-dom", "react/jsx-runtime"],
    logLevel: "silent",
  });
  const code = result.outputFiles[0].contents;
  rows.push({ name, min: fmt(code.length), gzip: fmt(gzipSync(code).length), brotli: fmt(brotliCompressSync(code).length) });
}
const css = readFileSync("dist/styles.css");
rows.push({ name: "styles.css", min: fmt(css.length) + " (unminified)", gzip: fmt(gzipSync(css).length), brotli: fmt(brotliCompressSync(css).length) });
console.table(rows);

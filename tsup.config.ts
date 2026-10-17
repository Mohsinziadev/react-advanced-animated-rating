import { copyFile } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  tsconfig: "tsconfig.build.json",
  sourcemap: true,
  clean: true,
  target: "es2020",
  external: ["react", "react-dom"],
  // Components use hooks; mark the bundle as a client module for React Server Components (Next.js app router).
  banner: { js: '"use client";' },
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
  async onSuccess() {
    await copyFile("src/styles.css", "dist/styles.css");
  },
});

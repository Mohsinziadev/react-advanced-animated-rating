import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: "demo",
  base: "./",
  plugins: [react()],
  resolve: {
    // The demo consumes the library exactly like an app would, but from source.
    alias: [
      { find: /^react-advanced-rating\/styles\.css$/, replacement: src("./src/styles.css") },
      { find: /^react-advanced-rating$/, replacement: src("./src/index.ts") },
    ],
  },
  server: { port: 3001, strictPort: true },
  preview: { port: 3001 },
  build: { outDir: "../demo-dist", emptyOutDir: true },
  test: {
    root: ".",
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
  },
});

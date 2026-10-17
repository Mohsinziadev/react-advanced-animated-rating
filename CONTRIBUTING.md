# Contributing

Thanks for helping improve react-advanced-rating!

## Setup

Requires Node.js 22.22+ or 24+ for development tooling (the published package itself has no Node requirement).

```bash
npm install
npm run dev   # playground at http://localhost:3001 (uses the library source directly)
```

## Project layout

- `src/` is the library. `useRating.ts` holds behaviour (state, pointer, keyboard, ARIA). `Rating.tsx` renders it. `motion.ts` contains the WAAPI animations, and `styles.css` all of the styling.
- `src/__tests__/` contains the Vitest + Testing Library tests.
- `demo/` is the playground site (Vite).

## Before opening a pull request

```bash
npm run check   # lint, typecheck, tests, build and size report
```

- Add or update tests for any behaviour change.
- Keep the library free of runtime dependencies.
- If the change affects the bundle, include the `npm run size` output in the PR.
- Update `README.md` and `CHANGELOG.md` for user-facing changes.

## Landing page

The demo doubles as this package's landing page at https://www.m2toolkit.com/npm-packages/react-advanced-rating.
That URL is also the `homepage` in `package.json`, which npm shows as the package's homepage.

- `npm run build:site` builds the demo as prerendered static HTML into `site-dist/`. It adds the
  canonical, Open Graph and JSON-LD tags, and writes `package-info.json` (listing data taken from
  `package.json` and `site.config.json`). `scripts/build-site.mjs` is shared verbatim with the other
  M2Toolkit packages, and per-package settings go in `site.config.json`.
- Keep the demo server-renderable. Browser APIs (`window`, `localStorage`, `navigator`, …) belong
  in effects or event handlers, not in render.
- Keep one `<h1>`, a `<title>` of 15–65 characters and a meta description of 70–170 characters.
- To publish a change to the site, run `npm run sync:packages` in the m2toolkit repo and commit the
  result there. See `docs/NPM-PACKAGES.md` in m2toolkit.

## Reporting bugs

Open an issue at https://github.com/Mohsinziadev/react-advanced-animated-rating/issues with a minimal reproduction, your React version and your browser.

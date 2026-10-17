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

## Reporting bugs

Open an issue at https://github.com/Mohsinziadev/react-advanced-animated-rating/issues with a minimal reproduction, your React version and your browser.

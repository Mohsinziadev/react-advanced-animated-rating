# Changelog

## 3.0.0

A ground-up rebuild. Existing 2.x props keep working (deprecated); see "Migrating from 2.x" in the README.

### Added

- `Rating` supports any `max`, any `precision` (½, ¼, 0.1…), `readOnly`, `disabled`, `allowClear`, and controlled or uncontrolled use (`value` / `defaultValue`).
- Built-in `star`, `heart`, `circle`, `bolt`, `smiley` and `number` icons; custom SVG, emoji or render-function icons; `emptyIcon`; `emptyStyle="outline"`.
- `highlight="single"` for smiley and numeric scales.
- Colour scales (`color` as an array or function), seven themes, and CSS custom properties for every visual token.
- Animation presets `none` / `subtle` / `spring` / `playful`: a cascading fill, a commit pop and ripple, and optional `celebrate` particle bursts. `prefers-reduced-motion` is respected.
- Accessibility: WAI-ARIA slider pattern (arrows, Home/End, PageUp/Down, digits, Backspace), `aria-valuetext` with `labels`, `getLabelText` for i18n, `role="img"` for read-only ratings, visible focus, forced-colors support.
- `label`, `helperText`, `error`, `showLabel` and `tooltip`.
- Form integration: `name`, `form`, `required` with `requiredMessage`, and form reset for uncontrolled ratings.
- RTL support (auto-detected or `dir`) and touch drag-to-scrub.
- `onHoverChange` callback.
- `useRating` headless hook.
- `ThumbsRating` component.
- `RatingSummary` component and `computeRatingStats` helper.
- Exported icon components.
- TypeScript types, ESM + CJS builds, `"use client"` directive, tree-shakable exports.
- A default export alongside the named `Rating` export.

### Changed

- **Removed all runtime dependencies.** `framer-motion`, `tailwindcss`, `npm`, `install`, `postcss-*`, `autoprefixer`, `@tailwindcss/forms` and `rollup-plugin-css-only` are no longer installed with the package.
- Styling no longer depends on Tailwind classes in the host app. Import `react-advanced-rating/styles.css` once.
- The default icon size is 28px (was 40px).
- Hover previews work regardless of animation settings.
- Clicking the current value clears the rating (`allowClear={false}` restores the old behaviour).

### Deprecated

- `rating` → `value` / `defaultValue`
- `editable` → `readOnly`
- `enableAnimation` → `animation`
- `starColor` → `color`
- `backgroundClass` → `itemClassName`

### Fixed

- The `whileHover` prop leaked onto DOM elements when animation was disabled (React warning).
- A missing `onChange` crashed editable ratings on click.

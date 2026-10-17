# react-advanced-rating

[![npm](https://img.shields.io/npm/v/react-advanced-rating.svg)](https://www.npmjs.com/package/react-advanced-rating)
[![license](https://img.shields.io/npm/l/react-advanced-rating.svg)](./LICENSE)

**Accessible, animated, zero-dependency rating components for React.** Stars, hearts, smileys, numeric scales, thumbs and review summaries, with fractional precision, keyboard and touch support, RTL, native forms and SSR.

**[Live demo and playground →](https://www.m2toolkit.com/npm-packages/react-advanced-rating)**

```tsx
import { Rating } from "react-advanced-rating";
import "react-advanced-rating/styles.css";

<Rating defaultValue={3.5} precision={0.5} label="Your rating" />;
```

## Why this package

- **Interaction that feels right.** The hover preview tracks the pointer at any precision (½, ¼, 0.1…). Fills cascade in and drain out, commits pop with a spring, and top scores can trigger a particle burst. Touch users can drag across the icons to scrub.
- **Accessible by default.** Interactive ratings follow the WAI-ARIA slider pattern, with arrow keys, Home/End, PageUp/Down, digits and Backspace. They announce text like "3.5 out of 5, Good". Read-only ratings are exposed as a single image whose name includes the value. Reduced motion and Windows High Contrast are respected.
- **Tiny and dependency-free.** No animation library and no CSS framework. Animations use CSS transitions and the Web Animations API on DOM nodes, so they cause no React re-renders.
- **More than stars.** Built-in star, heart, circle, bolt, smiley and numeric icons; any SVG, emoji or render function; colour scales (red → green); `ThumbsRating` for helpful/not-helpful; and `RatingSummary` for review distributions with filters.
- **Headless when you need it.** `useRating()` exposes all the state, pointer, keyboard and ARIA logic, so you can render any UI.
- **Production details.** Controlled and uncontrolled modes, `name`/`required`/form reset support, RTL, i18n label hooks, `"use client"` for React Server Components, strict TypeScript types, ESM + CJS.

### Size

Measured with `npm run size` (esbuild, minified, React excluded):

| Import                     | min + gzip |
| -------------------------- | ---------- |
| `{ useRating }` (headless) | 2.2 kB     |
| `{ ThumbsRating }`         | 2.6 kB     |
| `{ Rating }`               | 6.4 kB     |
| everything                 | 8.1 kB     |
| `styles.css`               | 3.5 kB     |

Exports are tree-shakable (`sideEffects` is limited to the CSS file).

## Installation

```bash
npm install react-advanced-rating
# or
pnpm add react-advanced-rating
yarn add react-advanced-rating
bun add react-advanced-rating
```

Requires React 18 or 19. Import the stylesheet **once**, for example in your root layout or entry file:

```ts
import "react-advanced-rating/styles.css";
```

## Quick start

### Controlled

```tsx
import { useState } from "react";
import { Rating } from "react-advanced-rating";

export function ReviewStars() {
  const [value, setValue] = useState(0);
  return <Rating value={value} onChange={setValue} precision={0.5} label="Your rating" />;
}
```

### Uncontrolled

```tsx
<Rating defaultValue={4} onChange={(value) => console.log(value)} />
```

`onChange` receives the new value; `0` means "no rating" (for example after clearing).

### Read-only (product cards, listings)

```tsx
<Rating readOnly value={4.37} size="sm" aria-label="Customer rating" />
```

Read-only ratings render the exact fraction (4.37) unless you pass `precision`. Screen readers announce "Customer rating, Rated 4.37 out of 5".

### JavaScript

Everything works the same without TypeScript:

```jsx
import { Rating } from "react-advanced-rating";
import "react-advanced-rating/styles.css";

export default function App() {
  return <Rating defaultValue={3} icon="heart" theme="rose" onChange={(v) => console.log(`You rated ${v}`)} />;
}
```

## Recipes

### Labels, tooltips and helper text

```tsx
<Rating
  label="Overall rating"
  labels={["Terrible", "Bad", "Okay", "Good", "Excellent"]}
  showLabel // shows "Good" next to the stars (live while hovering)
  tooltip // shows a tooltip above the hovered star
  helperText="Tap a star to rate"
/>
```

### Forms and validation

```tsx
<form onSubmit={handleSubmit}>
  <Rating name="score" required requiredMessage="Please choose a rating." />
  <button type="submit">Send</button>
</form>
```

- `name` adds a hidden input, so the value is part of `FormData`. An empty rating submits `""`.
- `required` blocks native submission while empty, focuses the rating, marks it `aria-invalid` and shows `requiredMessage`.
- Uncontrolled ratings follow `<form>` resets.
- For library-driven validation, pass `error="Message"` (or `error` alone for just the invalid state).

With React Hook Form:

```tsx
<Controller
  name="score"
  control={control}
  rules={{ min: { value: 1, message: "Required" } }}
  render={({ field, fieldState }) => (
    <Rating value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} />
  )}
/>
```

### Icons

```tsx
<Rating icon="heart" />
<Rating icon="smiley" />            // single highlight + red→green scale by default
<Rating icon="number" max={10} highlight="single" />
<Rating icon="🔥" />                 // any emoji or text
<Rating icon={<MyIcon />} />        // any SVG; use fill="currentColor"
<Rating icon={({ value, filled }) => <Pill active={filled}>{value}</Pill>} />
<Rating icon="star" emptyIcon={<StarOutline />} />
<Rating emptyStyle="outline" />     // outlined empty shapes
```

The built-in icons are exported too: `StarIcon`, `HeartIcon`, `CircleIcon`, `BoltIcon`, `FaceIcon`, `ThumbUpIcon`, `ThumbDownIcon`.

### Colours and themes

```tsx
<Rating theme="violet" />                              // gold | rose | violet | emerald | ocean | mono | contrast
<Rating color="#ff5e3a" inactiveColor="#eee" />
<Rating color={["#e5484d", "#f5b400", "#30a46c"]} />   // colour scale across the range
<Rating color={(value, max) => (value / max > 0.6 ? "green" : "orange")} />
```

Or with plain CSS custom properties:

```css
.my-rating {
  --rar-active-color: hotpink;
  --rar-inactive-color: #e5e7eb;
  --rar-size: 40px;
  --rar-gap: 6px;
}
```

| Variable                                        | Purpose                                               |
| ----------------------------------------------- | ----------------------------------------------------- |
| `--rar-active-color` / `--rar-inactive-color`   | Filled / empty colour                                 |
| `--rar-outline-color`                           | Stroke for `emptyStyle="outline"`                     |
| `--rar-size` / `--rar-gap`                      | Icon size / spacing                                   |
| `--rar-focus-color`                             | Focus outline (defaults to the text colour)           |
| `--rar-tooltip-bg` / `--rar-tooltip-color`      | Tooltip colours                                       |
| `--rar-face-detail`                             | Eye/mouth colour of smiley icons (match your surface) |
| `--rar-number-active-color`                     | Text colour on filled number tiles                    |
| `--rar-duration`, `--rar-stagger`, `--rar-ease` | Fill transition timing                                |
| `--rar-hover-scale`, `--rar-hover-rotate`       | Hover transform                                       |
| `--rar-error-color`                             | Error message colour                                  |

The empty colour is derived from `currentColor` by default, so ratings adapt to light and dark surfaces without configuration.

### Animation

```tsx
<Rating animation="none" />     // instant
<Rating animation="subtle" />   // quick fade-fill, light pop
<Rating animation="spring" />   // default: springy hover, cascading fill, ripple on commit
<Rating animation="playful" />  // bouncy + tilt, particle burst on the top score
<Rating celebrate />            // burst on every selection
<Rating celebrate="max" />      // only on the top score
<Rating celebrate={4} />        // 4 and above
```

With `prefers-reduced-motion: reduce`, transitions collapse to instant and pops and particles are skipped. Programmatic value changes (for example a parent resetting `value`) animate the fill but never pop or celebrate.

### Thumbs (helpful / not helpful)

```tsx
import { ThumbsRating, type ThumbsValue } from "react-advanced-rating";

const [vote, setVote] = useState<ThumbsValue>(null);

<ThumbsRating
  aria-label="Was this answer helpful?"
  value={vote}
  onChange={setVote} // "up" | "down" | null (pressing the active thumb clears it)
  counts={{ up: 128, down: 9 }}
  showLabels
  labels={{ up: "Yes", down: "No" }}
/>;
```

### Review summary and distribution

```tsx
import { RatingSummary, computeRatingStats } from "react-advanced-rating";

const distribution = { 5: 812, 4: 301, 3: 96, 2: 41, 1: 34 };

<RatingSummary
  title="Customer reviews"
  distribution={distribution}
  onSelect={setFilter} // optional: rows become filter buttons
  selected={filter}
/>;

computeRatingStats(distribution);
// → { average: 4.41, total: 1284, counts: [34, 41, 96, 301, 812], percentages: [3, 3, 8, 23, 63] }
```

Percentages use largest-remainder rounding, so they always add up to 100.

### Headless: `useRating`

```tsx
import { useRating } from "react-advanced-rating";

function SpiceMeter() {
  const rating = useRating({ max: 4, defaultValue: 2, labels: ["Mild", "Medium", "Hot", "Extreme"] });
  return (
    <div {...rating.getControlProps()} aria-label="Spice level" className="spice">
      {rating.items.map((i) => {
        const item = rating.getItemState(i); // { value, fill, isFilled, isPartial, isActive, isPreview }
        return (
          <span key={i} {...rating.getItemProps(i)} data-on={item.isFilled}>
            🌶
          </span>
        );
      })}
      <output>{rating.label}</output>
    </div>
  );
}
```

`getControlProps()` provides `role`, all `aria-*` attributes, `tabIndex`, and the pointer and keyboard handlers. Items must carry `getItemProps(i)` so the pointer maths can find them.

### RTL and i18n

```tsx
<div dir="rtl" lang="ar">
  <Rating label="قيّم تجربتك" precision={0.5} getLabelText={(value, { max }) => `${value} من ${max}`} />
</div>
```

Direction is detected from the DOM (or set with `dir`). Fills start from the right, and the arrow keys are mirrored. Every announced string can be replaced: `getLabelText` for `Rating`, `labels` for `ThumbsRating`, and `formatTotal`/`getRowLabel`/`locale` for `RatingSummary`.

### Next.js / React Server Components

The bundle starts with `"use client"`, so you can render `<Rating />` directly from a server component. Import the CSS in `app/layout.tsx`. Server rendering and hydration are covered by the test suite.

## API

### `<Rating>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `number` | — | Controlled value (`0` = no rating). |
| `defaultValue` | `number` | `0` | Initial value when uncontrolled. |
| `onChange` | `(value: number) => void` | — | Called when the user commits a value. |
| `onHoverChange` | `(value: number \| null) => void` | — | Live preview while hovering or scrubbing; `null` when it ends. |
| `max` | `number` | `5` | Number of items (1–100). |
| `precision` | `number` | `1` | Step in (0, 1]: `0.5`, `0.25`, `0.1`… |
| `readOnly` | `boolean` | `false` | Display only (`role="img"`). |
| `disabled` | `boolean` | `false` | Inert, not focusable. |
| `allowClear` | `boolean` | `true` | Clicking the current value, Backspace/Delete or `0` clears it. |
| `highlight` | `"range" \| "single"` | `"range"` (smiley: `"single"`) | Fill up to the value, or only the selected item. |
| `icon` | `"star" \| "heart" \| "circle" \| "bolt" \| "smiley" \| "number" \| ReactNode \| (state) => ReactNode` | `"star"` | Filled icon. |
| `emptyIcon` | same as `icon` | `icon` | Empty icon. |
| `emptyStyle` | `"filled" \| "outline"` | `"filled"` | Empty shapes as solid or outline. |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl" \| number \| string` | `"md"` | Icon size (16 / 20 / 28 / 36 / 48 px). |
| `gap` | `number \| string` | `size × 0.16` | Space between icons. |
| `color` | `string \| string[] \| (value, max) => string` | theme | Active colour or colour scale. |
| `inactiveColor` | `string` | derived from `currentColor` | Empty colour. |
| `theme` | `"gold" \| "rose" \| "violet" \| "emerald" \| "ocean" \| "mono" \| "contrast"` | `"gold"` | Built-in palettes. |
| `animation` | `"none" \| "subtle" \| "spring" \| "playful"` | `"spring"` | Motion preset. |
| `celebrate` | `boolean \| "max" \| number` | `"max"` when playful, else `false` | Particle burst on selection. |
| `labels` | `string[]` | — | Label per whole value (index 0 → value 1). |
| `getLabelText` | `(value, { max, label, readOnly }) => string` | English | Screen-reader text. |
| `showLabel` | `boolean \| (value, label) => ReactNode` | `false` | Visible label/value next to the icons. |
| `tooltip` | `boolean` | `false` | Tooltip above the hovered item. |
| `label` | `ReactNode` | — | Visible label; used as the accessible name. |
| `helperText` | `ReactNode` | — | Description linked via `aria-describedby`. |
| `error` | `boolean \| ReactNode` | — | Invalid state and optional message. |
| `name` / `form` | `string` | — | Hidden input for form submission. |
| `required` / `requiredMessage` | `boolean` / `ReactNode` | `false` / "Please select a rating." | Native form validation. |
| `dir` | `"ltr" \| "rtl"` | inherited | Text direction. |
| `id`, `controlClassName` | `string` | — | Applied to the `role="slider"` / `role="img"` element. |
| `itemClassName` | `string` | — | Added to every item. |
| `aria-label`, `aria-labelledby`, `aria-describedby` | `string` | — | Forwarded to the control. |
| `className`, `style`, `ref`, other `div` props | — | — | Applied to the root element. |

### `useRating(options)`

Accepts the behaviour props above (`value`, `defaultValue`, `onChange`, `onHoverChange`, `max`, `precision`, `readOnly`, `disabled`, `allowClear`, `highlight`, `dir`, `labels`, `getLabelText`) and returns:

| Field | Description |
| --- | --- |
| `value`, `hoverValue`, `displayValue` | Committed value, preview value (or `null`), and what to render. |
| `items` | `[0, 1, …, max - 1]` |
| `getControlProps()` | Spread on the container (role, ARIA, handlers, ref). |
| `getItemProps(index)` | Spread on each item. |
| `getItemState(index)` | `{ value, fill, isFilled, isPartial, isActive, isPreview }` |
| `label`, `valueText` | Current label and the announced text. |
| `setValue(v)`, `clear()` | Imperative updates (call `onChange`). |
| `isHovering`, `interactive`, `max`, `step` | State helpers. |

### `<ThumbsRating>`

`value` / `defaultValue` (`"up" | "down" | null`), `onChange`, `readOnly`, `disabled`, `labels` (`{ up, down }`, default "Helpful" / "Not helpful"), `showLabels`, `counts` (`{ up, down }`), `formatCount`, `size`, `animation`, `celebrate` (default `true`), `name`, `aria-label`. It renders a `role="group"` containing two `aria-pressed` toggle buttons.

### `<RatingSummary>`

`distribution` (object keyed by score, or an array where index 0 is score 1), `max`, `average` / `total` (override the computed values), `title`, `onSelect(score | null)` and `selected` (filter mode), `color`, `theme`, `compact`, `locale`, `formatTotal`, `getRowLabel`.

### `computeRatingStats(distribution, max = 5)`

Returns `{ average, total, counts, percentages }`. Invalid or negative counts are treated as 0.

## Keyboard

| Key | Action |
| --- | --- |
| → / ↑ | Next step (← in RTL) |
| ← / ↓ | Previous step (→ in RTL) |
| Page Up / Page Down | ±1 |
| Home / End | Minimum / maximum |
| 1–9 | Jump to that value |
| 0, Backspace, Delete | Clear (when `allowClear`) |

## Accessibility notes

- Interactive: `role="slider"` with `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext`. Give it a name with `label`, `aria-label` or `aria-labelledby`.
- Read-only: `role="img"` whose accessible name includes the value, so lists of products don't produce a tab stop per rating.
- Focus uses a 2px outline in the text colour (customisable with `--rar-focus-color`).
- The default gold works for decorative ratings. When the difference between filled and empty icons must meet the 3:1 non-text contrast guideline on light surfaces, use `theme="contrast"` or choose colours yourself.
- The automated tests cover roles, names, descriptions, keyboard behaviour and SSR hydration. They are not a substitute for testing with your own screen readers and design.

## Browser support

The current versions of Chrome, Edge, Firefox and Safari. The stylesheet relies on `color-mix()` and `clip-path` (Chrome/Edge 111+, Safari 16.2+, Firefox 113+). Older browsers still render working ratings, with fallback colours.

## What changed from 2.x

| | 2.x | 3.x |
| --- | --- | --- |
| Runtime dependencies | framer-motion, tailwindcss, npm, postcss-cli, … | none |
| Requires Tailwind in your app | yes | no |
| Scale | 5 stars | any `max` (1–100), stars/hearts/smileys/numbers/custom |
| Precision | whole stars | any step (½, ¼, 0.1…) |
| Keyboard & screen readers | none | WAI-ARIA slider pattern |
| Touch | tap | tap and drag-to-scrub |
| Forms | — | `name`, `required`, reset |
| TypeScript | `any` props | full types |
| Module formats | ESM | ESM + CJS, `"use client"` |
| Companions | — | `ThumbsRating`, `RatingSummary`, `useRating` |

## Migrating from 2.x

3.0 keeps the 2.x props working, so most apps only need the stylesheet import:

```diff
  import { Rating } from "react-advanced-rating";
+ import "react-advanced-rating/styles.css";
```

| 2.x prop | 3.x equivalent | Still supported? |
| --- | --- | --- |
| `rating` | `value` (controlled) or `defaultValue` | Yes (deprecated) |
| `editable` | `readOnly={false}` (ratings are editable by default) | Yes (deprecated) |
| `enableAnimation` | `animation` (`"none"` to disable) | Yes (deprecated) |
| `starColor` | `color` | Yes (deprecated) |
| `backgroundClass` | `itemClassName` | Yes (deprecated) |

Behaviour notes:

- **Styles:** 2.x depended on Tailwind classes in your app. 3.x ships its own CSS and works without Tailwind.
- **Legacy defaults:** when you pass the old `rating` prop without `editable`, the rating stays read-only, exactly as in 2.x. New code that uses `value`/`defaultValue` is editable by default.
- **Size:** the default icon size is now 28px (2.x used 40px). Pass `size={40}` to keep the old look.
- **Hover:** hover previews now work regardless of `enableAnimation`.
- **Clearing:** clicking the current value now clears the rating. Pass `allowClear={false}` for the 2.x behaviour.
- **Imports:** both `import { Rating }` and `import Rating` work.

See [CHANGELOG.md](./CHANGELOG.md) for the full list.

## Troubleshooting

- **Icons are huge, stacked or unstyled.** The stylesheet isn't loaded. Add `import "react-advanced-rating/styles.css"`. In development, a console warning tells you when it's missing.
- **Jest can't parse the CSS import.** Map CSS files to a stub, for example `moduleNameMapper: { "\\.css$": "identity-obj-proxy" }`.
- **Clicking doesn't change the value.** In controlled mode you must update `value` in `onChange`.
- **Smiley details look wrong on dark backgrounds.** Set `--rar-face-detail` to your surface colour.
- **I want every click to set a value, never clear.** Use `allowClear={false}`.

## Development

```bash
npm install
npm run dev        # playground at http://localhost:3001
npm test           # vitest + Testing Library
npm run lint       # eslint
npm run typecheck  # tsc
npm run build      # library → dist/
npm run build:demo # playground → demo-dist/
npm run build:site # prerendered landing page → site-dist/ (used by m2toolkit.com)
npm run size       # bundle size report
npm run check      # all of the above (runs before publish)
```

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md), and report bugs in the [issue tracker](https://github.com/Mohsinziadev/react-advanced-animated-rating/issues).

## License

[ISC](./LICENSE) © Mohsin Zia

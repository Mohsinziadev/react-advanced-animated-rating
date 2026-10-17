import * as React from "react";
import { Rating } from "react-advanced-rating";
import { Examples } from "./components/Examples";
import { Playground } from "./components/Playground";
import { Presets } from "./components/Presets";
import { CodeBlock, CopyButton, Section } from "./components/ui";

const REPO = "https://github.com/Mohsinziadev/react-advanced-animated-rating";
const NPM = "https://www.npmjs.com/package/react-advanced-rating";
const PACKAGES = "https://www.m2toolkit.com/npm-packages";
const VERSION = "3.0.0";

const MANAGERS = {
  npm: "npm install react-advanced-rating",
  pnpm: "pnpm add react-advanced-rating",
  yarn: "yarn add react-advanced-rating",
  bun: "bun add react-advanced-rating",
} as const;
type Manager = keyof typeof MANAGERS;

type Mode = "system" | "light" | "dark";

// The inline script in index.html applies the saved mode before first paint. Reading it
// through an external store keeps the prerendered HTML ("system") hydration-safe.
const modeListeners = new Set<() => void>();
const subscribeMode = (listener: () => void) => {
  modeListeners.add(listener);
  return () => modeListeners.delete(listener);
};
const readMode = (): Mode => (document.documentElement.dataset.mode as Mode) || "system";
function writeMode(mode: Mode) {
  document.documentElement.dataset.mode = mode;
  try {
    localStorage.setItem("rar-demo-mode", mode);
  } catch {
    /* storage unavailable */
  }
  modeListeners.forEach((listener) => listener());
}

function useColorMode() {
  const mode = React.useSyncExternalStore(subscribeMode, readMode, () => "system" as Mode);
  return [mode, writeMode] as const;
}

const QUICK_START = `import { useState } from "react";
import { Rating } from "react-advanced-rating";
import "react-advanced-rating/styles.css"; // once, anywhere in your app

export function ReviewStars() {
  const [value, setValue] = useState(0);
  return <Rating value={value} onChange={setValue} precision={0.5} label="Your rating" />;
}`;

const PROPS: Array<[string, string, string, string]> = [
  ["value / defaultValue", "number", "0", "Controlled or initial value. 0 means no rating."],
  ["onChange", "(value: number) => void", "", "Called on commit; receives 0 when cleared."],
  ["onHoverChange", "(value: number | null) => void", "", "Live preview value while hovering or scrubbing."],
  ["max", "number", "5", "Number of items (1–100)."],
  ["precision", "number", "1", "Selectable step: 1, 0.5, 0.25, 0.1 or any value in (0, 1]."],
  ["readOnly / disabled", "boolean", "false", "Display-only (role=img) or inert slider."],
  ["allowClear", "boolean", "true", "Clicking the current value, Backspace or 0 clears it."],
  ["icon / emptyIcon", '"star" | "heart" | "circle" | "bolt" | "smiley" | "number" | ReactNode | fn', '"star"', "Built-ins, any SVG/emoji, or a render function."],
  ["highlight", '"range" | "single"', '"range"', "Fill up to the value, or only the selected item (smileys default to single)."],
  ["color", "string | string[] | (value, max) => string", "theme", "Active colour; arrays and functions create colour scales."],
  ["theme", '"gold" | "rose" | "violet" | "emerald" | "ocean" | "mono" | "contrast"', '"gold"', "Built-in palettes."],
  ["size / gap", '"xs"–"xl" | number | CSS length', '"md"', "Icon size and spacing."],
  ["animation", '"none" | "subtle" | "spring" | "playful"', '"spring"', "Motion personality (reduced motion respected)."],
  ["celebrate", 'boolean | "max" | number', "playful → max", "Particle burst on selection."],
  ["labels / getLabelText", "string[] / fn", "", "Words per value and the screen-reader text (i18n)."],
  ["label / helperText / error", "ReactNode", "", "Visible label, description and validation message."],
  ["showLabel / tooltip", "boolean | fn", "false", "Show the current label next to or above the icons."],
  ["name / required / form", "string / boolean", "", "Native form integration and validation."],
  ["dir", '"ltr" | "rtl"', "inherited", "Right-to-left support; auto-detected from the DOM."],
];

const KEYS: Array<[string, string]> = [
  ["→ / ↑", "Increase by one step (← in RTL)"],
  ["← / ↓", "Decrease by one step (→ in RTL)"],
  ["Page Up / Page Down", "Increase / decrease by 1"],
  ["Home / End", "Minimum / maximum"],
  ["1–9", "Jump to that value"],
  ["0, Backspace, Delete", "Clear (when allowClear)"],
];

export function App() {
  const [mode, setMode] = useColorMode();
  const [manager, setManager] = React.useState<Manager>("npm");
  const [heroValue, setHeroValue] = React.useState(4);

  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="nav">
        <div className="nav-inner">
          <a href="#top" className="brand" aria-label="react-advanced-rating home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M12 2.6c.4 0 .77.23.94.6l2.42 4.9 5.41.79c.86.12 1.2 1.18.58 1.79l-3.92 3.82.93 5.39c.15.85-.75 1.5-1.52 1.1L12 18.43l-4.84 2.55c-.77.4-1.67-.25-1.52-1.1l.93-5.39-3.92-3.82c-.62-.61-.28-1.67.58-1.79l5.41-.79 2.42-4.9c.17-.37.54-.6.94-.6z" />
              </svg>
            </span>
            <span className="brand-name">react-advanced-rating</span>
            <span className="brand-version">v{VERSION}</span>
          </a>
          <p className="nav-note">Rebuilt with zero dependencies</p>
          <nav aria-label="Primary" className="nav-links">
            <a href="#playground">Playground</a>
            <a href="#motion">Motion</a>
            <a href="#examples">Examples</a>
            <a href="#api">API</a>
            <a href={PACKAGES}>More packages</a>
          </nav>
          <div className="nav-actions">
            <button
              type="button"
              className="icon-btn"
              onClick={() => setMode(mode === "system" ? "light" : mode === "light" ? "dark" : "system")}
              aria-label={`Colour mode: ${mode}. Click to change.`}
              title={`Colour mode: ${mode}`}
            >
              {mode === "dark" ? (
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <path d="M16 12.3A6.5 6.5 0 0 1 7.7 4a6.5 6.5 0 1 0 8.3 8.3z" fill="currentColor" />
                </svg>
              ) : mode === "light" ? (
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <circle cx="10" cy="10" r="3.5" fill="currentColor" />
                  <path d="M10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M4 16l1.4-1.4M14.6 5.4L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
                  <rect x="2.5" y="3.5" width="15" height="10" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 17h6M10 13.5V17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <a className="icon-btn" href={REPO} target="_blank" rel="noreferrer" aria-label="GitHub repository">
              <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
                />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero-copy">
            <h1 id="hero-title">
              Ratings that feel as good <span className="hero-accent">as they look.</span>
            </h1>
            <p className="hero-lead">
              Accessible, animated rating components for React: stars, hearts, smileys, numeric scales, thumbs and
              review summaries. Fractional precision, keyboard and touch, RTL, forms and SSR included.
            </p>

            <div className="install">
              <div className="install-tabs" role="group" aria-label="Package manager">
                {(Object.keys(MANAGERS) as Manager[]).map((m) => (
                  <button key={m} type="button" aria-pressed={manager === m} onClick={() => setManager(m)}>
                    {m}
                  </button>
                ))}
              </div>
              <div className="install-cmd">
                <code>
                  <span className="prompt" aria-hidden="true">
                    $
                  </span>{" "}
                  {MANAGERS[manager]}
                </code>
                <CopyButton text={MANAGERS[manager]} />
              </div>
            </div>

            <div className="hero-ctas">
              <a href="#playground" className="btn btn-primary">
                Open the playground
              </a>
              <a href={NPM} className="btn btn-ghost" target="_blank" rel="noreferrer">
                View on npm
              </a>
            </div>

            <ul className="facts" aria-label="Package facts">
              <li>
                <b>0</b> runtime dependencies
              </li>
              <li>
                <b>6.4 kB</b> min+gzip for <code>Rating</code>
              </li>
              <li>
                <b>2.2 kB</b> headless hook
              </li>
              <li>
                <b>TypeScript</b> · ESM + CJS
              </li>
            </ul>
          </div>

          <div className="hero-demo">
            <div className="hero-card">
              <div className="hero-card-glow" aria-hidden="true" />
              <p className="hero-card-kicker">Try it. Five stars celebrates.</p>
              <Rating
                value={heroValue}
                onChange={setHeroValue}
                precision={0.5}
                size={52}
                animation="playful"
                labels={["Terrible", "Bad", "Okay", "Good", "Excellent"]}
                tooltip
                aria-label="Try the rating"
                className="hero-rating"
              />
              <div className="hero-card-meta">
                <span className="hero-score">{heroValue.toFixed(1)}</span>
                <span className="hero-score-label">
                  {heroValue === 0
                    ? "No rating"
                    : ["Terrible", "Bad", "Okay", "Good", "Excellent"][Math.ceil(heroValue) - 1]}
                </span>
              </div>
              <div className="hero-mini">
                <Rating icon="heart" theme="rose" defaultValue={3} size="sm" aria-label="Hearts sample" />
                <Rating icon="smiley" defaultValue={4} size="sm" aria-label="Smiley sample" />
                <Rating icon="number" max={5} highlight="single" defaultValue={4} size={22} theme="violet" aria-label="Numeric sample" />
              </div>
            </div>
          </div>
        </section>

        <Section
          id="playground"
          eyebrow="Playground"
          title="Tune every prop and copy the code"
          lead="Every control maps to a real prop. The snippet updates as you change things, and copy gives you exactly what's rendered."
        >
          <Playground />
        </Section>

        <Section
          id="motion"
          eyebrow="Motion"
          title="Four motion personalities"
          lead="Fills cascade with a stagger, commits pop with a spring, and top scores can celebrate. Everything runs on CSS transitions and the Web Animations API: no animation library, and no React re-renders per frame. Users who prefer reduced motion get instant changes."
        >
          <Presets />
        </Section>

        <Section
          id="examples"
          eyebrow="Recipes"
          title="Built for real product surfaces"
          lead="Each example below is live, and you can open its code."
        >
          <Examples />
        </Section>

        <Section
          id="start"
          eyebrow="Quick start"
          title="Up and running in three lines"
          lead="Import the component and the stylesheet once. Works with Vite, Next.js (app & pages router), Remix and CRA."
        >
          <div className="start-grid">
            <CodeBlock code={QUICK_START} title="ReviewStars.tsx" />
            <ul className="checklist">
              <li>
                <b>Controlled or uncontrolled.</b> Use <code>value</code> + <code>onChange</code>, or{" "}
                <code>defaultValue</code>.
              </li>
              <li>
                <b>Server components ready.</b> The bundle ships with <code>&quot;use client&quot;</code>.
              </li>
              <li>
                <b>No styling framework required.</b> Theme with props or CSS variables like{" "}
                <code>--rar-active-color</code>.
              </li>
              <li>
                <b>Upgrading from 2.x?</b> Old props (<code>rating</code>, <code>editable</code>,{" "}
                <code>starColor</code>…) still work. See the{" "}
                <a href={`${REPO}#migrating-from-2x`} target="_blank" rel="noreferrer">
                  migration guide
                </a>
                .
              </li>
            </ul>
          </div>
        </Section>

        <Section
          id="accessibility"
          eyebrow="Accessibility"
          title="Keyboard, screen readers, and user preferences"
          lead="Interactive ratings follow the WAI-ARIA slider pattern; read-only ones are announced as a single image with the value in its name."
        >
          <div className="a11y-grid">
            <table className="keys">
              <caption className="sr-only">Keyboard shortcuts</caption>
              <thead>
                <tr>
                  <th scope="col">Key</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {KEYS.map(([k, a]) => (
                  <tr key={k}>
                    <td>
                      <kbd>{k}</kbd>
                    </td>
                    <td>{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="checklist">
              <li>
                <b>Meaningful announcements.</b> <code>aria-valuetext</code> reads &ldquo;3.5 out of 5, Good&rdquo;
                and is fully customisable for i18n.
              </li>
              <li>
                <b>Visible focus</b> using an outline that inherits the text colour, plus Windows High Contrast (
                <code>forced-colors</code>) support.
              </li>
              <li>
                <b>Reduced motion</b> disables transitions, pops and particles automatically.
              </li>
              <li>
                <b>Forms.</b> <code>required</code> blocks submit, focuses the control and links the message via{" "}
                <code>aria-describedby</code>.
              </li>
              <li>
                <b>Touch-friendly.</b> Drag across the icons to scrub; vertical page scrolling still works.
              </li>
              <li>
                <b>Contrast.</b> The default gold suits decorative use; pick <code>theme=&quot;contrast&quot;</code>{" "}
                when state must meet 3:1 non-text contrast on light surfaces.
              </li>
            </ul>
          </div>
        </Section>

        <Section id="api" eyebrow="API" title="Props at a glance" lead="Full reference, types and recipes are in the README.">
          <div className="table-wrap">
            <table className="props">
              <thead>
                <tr>
                  <th scope="col">Prop</th>
                  <th scope="col">Type</th>
                  <th scope="col">Default</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {PROPS.map(([name, type, def, desc]) => (
                  <tr key={name}>
                    <td>
                      <code>{name}</code>
                    </td>
                    <td>
                      <code className="type">{type}</code>
                    </td>
                    <td>{def ? <code>{def}</code> : <span className="muted">-</span>}</td>
                    <td>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="api-more">
            Also exported: <code>useRating</code>, <code>ThumbsRating</code>, <code>RatingSummary</code>,{" "}
            <code>computeRatingStats</code> and the icon components (<code>StarIcon</code>, <code>HeartIcon</code>,{" "}
            <code>FaceIcon</code>…).
          </p>
        </Section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <span>
            react-advanced-rating · ISC licence · by Mohsin Zia
          </span>
          <nav aria-label="Footer" className="footer-links">
            <a href={REPO} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={`${REPO}/issues`} target="_blank" rel="noreferrer">
              Issues
            </a>
            <a href={NPM} target="_blank" rel="noreferrer">
              npm
            </a>
            <a href={PACKAGES}>More packages on M2Toolkit</a>
          </nav>
        </div>
      </footer>
    </>
  );
}

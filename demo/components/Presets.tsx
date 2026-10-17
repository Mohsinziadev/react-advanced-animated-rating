import * as React from "react";
import { Rating, type AnimationPreset } from "react-advanced-rating";

const PRESETS: Array<{ id: AnimationPreset; title: string; body: string }> = [
  { id: "none", title: "none", body: "Instant state changes. For dense tables and dashboards." },
  { id: "subtle", title: "subtle", body: "A quick fade-fill and a light pop. Feels professional." },
  { id: "spring", title: "spring", body: "The default. Springy hover, a cascading fill and a ripple on commit." },
  { id: "playful", title: "playful", body: "Bouncy and tilted, with a particle burst on the top score." },
];

function PresetCard({ id, title, body }: (typeof PRESETS)[number]) {
  const [value, setValue] = React.useState(3);
  const timers = React.useRef<number[]>([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const replay = () => {
    timers.current.forEach(clearTimeout);
    setValue(0);
    timers.current = [window.setTimeout(() => setValue(5), 420)];
  };

  return (
    <article className="preset">
      <div className="preset-stage">
        <Rating animation={id} value={value} onChange={setValue} size="lg" aria-label={`${title} preset demo`} />
      </div>
      <div className="preset-info">
        <div className="preset-title">
          <code>animation=&quot;{title}&quot;</code>
          <button type="button" className="btn btn-ghost btn-sm" onClick={replay}>
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path d="M13 8a5 5 0 1 1-1.6-3.7M13 2.5v2.8h-2.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Replay
          </button>
        </div>
        <p>{body}</p>
      </div>
    </article>
  );
}

export function Presets() {
  return (
    <>
      <div className="presets">
        {PRESETS.map((p) => (
          <PresetCard key={p.id} {...p} />
        ))}
      </div>
      <div className="compare">
        <div className="compare-side">
          <span className="compare-tag">Typical</span>
          <Rating animation="none" precision={1} defaultValue={3} size="lg" aria-label="Typical rating" />
          <p>Whole stars only, an instant swap, and nothing to confirm that a choice was registered.</p>
        </div>
        <div className="compare-arrow" aria-hidden="true">
          →
        </div>
        <div className="compare-side compare-after">
          <span className="compare-tag">react-advanced-rating</span>
          <Rating
            animation="spring"
            precision={0.5}
            defaultValue={3.5}
            size="lg"
            tooltip
            labels={["Terrible", "Bad", "Okay", "Good", "Excellent"]}
            celebrate="max"
            aria-label="Enhanced rating"
          />
          <p>The half-star preview follows the pointer, a tooltip names the value, and a springy pop confirms the choice.</p>
        </div>
      </div>
    </>
  );
}

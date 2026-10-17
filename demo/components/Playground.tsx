import * as React from "react";
import { Rating, type AnimationPreset, type RatingTheme } from "react-advanced-rating";
import {
  DEFAULT_STATE,
  generateCode,
  toProps,
  type IconChoice,
  type PlaygroundState,
} from "../lib/playground";
import { CodeBlock, RangeField, Segmented, TextField, Toggle } from "./ui";

const THEMES: Array<{ value: RatingTheme; color: string }> = [
  { value: "gold", color: "#f5a524" },
  { value: "rose", color: "#f43f5e" },
  { value: "violet", color: "#8b5cf6" },
  { value: "emerald", color: "#10b981" },
  { value: "ocean", color: "#0ea5e9" },
  { value: "mono", color: "currentColor" },
  { value: "contrast", color: "#b45309" },
];

const ICONS: Array<{ value: IconChoice; label: React.ReactNode; title: string }> = [
  { value: "star", label: "★", title: "Star" },
  { value: "heart", label: "♥", title: "Heart" },
  { value: "circle", label: "●", title: "Circle" },
  { value: "bolt", label: "ϟ", title: "Bolt" },
  { value: "smiley", label: "☺", title: "Smiley" },
  { value: "number", label: "1–n", title: "Numbers" },
  { value: "emoji", label: "🔥", title: "Emoji" },
];

type Surface = "light" | "dark" | "grid";
interface LogEntry {
  id: number;
  text: string;
  kind: "change" | "hover";
}

export function Playground() {
  const [state, setState] = React.useState<PlaygroundState>(DEFAULT_STATE);
  const [surface, setSurface] = React.useState<Surface>("grid");
  const [hover, setHover] = React.useState<number | null>(null);
  const [log, setLog] = React.useState<LogEntry[]>([]);
  const logId = React.useRef(0);

  const set = (patch: Partial<PlaygroundState>) => setState((s) => normalize({ ...s, ...patch }));
  // Consecutive hover events collapse into one entry so commits stay visible.
  const push = (text: string, kind: LogEntry["kind"]) =>
    setLog((l) => {
      const rest = kind === "hover" && l[0]?.kind === "hover" ? l.slice(1) : l;
      return [{ id: ++logId.current, text, kind }, ...rest].slice(0, 5);
    });

  const props = toProps(state);
  const single = props.highlight === "single" || (state.icon === "smiley" && state.highlight === "auto");
  const step = single ? 1 : state.precision;
  const code = generateCode(state);

  return (
    <div className="playground">
      <div className="pg-main">
        <div className="stage" data-surface={surface}>
          <div className="stage-toolbar">
            <div className="stage-readout" aria-live="off">
              <span>
                value <b>{format(state.value)}</b>
              </span>
              <span>
                hover <b>{hover === null ? "—" : format(hover)}</b>
              </span>
            </div>
            <div className="stage-actions">
              <div className="surface-switch" role="group" aria-label="Preview surface">
                {(["grid", "light", "dark"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={surface === s}
                    onClick={() => setSurface(s)}
                    className="surface-btn"
                    data-surface={s}
                    title={`${s[0].toUpperCase()}${s.slice(1)} surface`}
                  >
                    <span className="sr-only">{s} surface</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setState(DEFAULT_STATE);
                  setLog([]);
                }}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="stage-canvas">
            <Rating
              {...props}
              key={state.icon === "smiley" ? "smiley" : "other"}
              value={state.value}
              onChange={(v) => {
                set({ value: v });
                push(`onChange(${format(v)})`, "change");
              }}
              onHoverChange={(v) => {
                setHover(v);
                push(`onHoverChange(${v === null ? "null" : format(v)})`, "hover");
              }}
            />
          </div>

          <div className="stage-footer">
            <p className="stage-hint">
              Hover or click · drag on touch · <kbd>←</kbd>
              <kbd>→</kbd> <kbd>Home</kbd> <kbd>End</kbd> <kbd>0–9</kbd> <kbd>⌫</kbd> when focused
            </p>
            <ol className="event-log" aria-label="Event log">
              {log.length === 0 ? <li className="event-empty">Events appear here</li> : null}
              {log.map((e) => (
                <li key={e.id} data-kind={e.kind}>
                  {e.text}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <CodeBlock
          code={code}
          title={
            <span className="code-tabs" role="group" aria-label="Code style">
              <button type="button" aria-pressed={state.controlled} onClick={() => set({ controlled: true })}>
                Controlled
              </button>
              <button type="button" aria-pressed={!state.controlled} onClick={() => set({ controlled: false })}>
                Uncontrolled
              </button>
            </span>
          }
        />
      </div>

      <aside className="panel" aria-label="Rating properties">
        <PanelGroup title="Value">
          <RangeField
            label="value"
            min={0}
            max={state.max}
            step={step}
            value={state.value}
            onChange={(v) => set({ value: v })}
            format={format}
          />
          <RangeField label="max" min={1} max={10} step={1} value={state.max} onChange={(v) => set({ max: v })} />
          <Segmented
            label="precision"
            value={state.precision}
            disabled={single}
            options={[
              { value: 1, label: "1" },
              { value: 0.5, label: "½" },
              { value: 0.25, label: "¼" },
              { value: 0.1, label: "0.1" },
            ]}
            onChange={(v) => set({ precision: v })}
          />
        </PanelGroup>

        <PanelGroup title="Icon">
          <Segmented label="icon" value={state.icon} options={ICONS} onChange={(v) => set({ icon: v })} />
          <Segmented
            label="highlight"
            value={state.highlight}
            options={[
              { value: "auto", label: "auto" },
              { value: "range", label: "range" },
              { value: "single", label: "single" },
            ]}
            onChange={(v) => set({ highlight: v })}
          />
          <Segmented
            label="emptyStyle"
            value={state.emptyStyle}
            options={[
              { value: "filled", label: "filled" },
              { value: "outline", label: "outline" },
            ]}
            onChange={(v) => set({ emptyStyle: v })}
          />
        </PanelGroup>

        <PanelGroup title="Appearance">
          <fieldset className="swatches">
            <legend className="field-label">theme</legend>
            <div className="swatch-row">
              {THEMES.map((t) => (
                <label key={t.value} className="swatch" title={t.value}>
                  <input
                    type="radio"
                    name="pg-theme"
                    checked={state.theme === t.value && !state.customColor && !state.colorScale}
                    onChange={() => set({ theme: t.value, customColor: null, colorScale: false })}
                  />
                  <span className="swatch-dot" style={{ background: t.color }} />
                  <span className="sr-only">{t.value}</span>
                </label>
              ))}
              <label className="swatch swatch-custom" title="Custom colour">
                <input
                  type="color"
                  value={state.customColor ?? "#ff5e3a"}
                  onChange={(e) => set({ customColor: e.target.value, colorScale: false })}
                />
                <span className="swatch-dot" style={{ background: state.customColor ?? undefined }} data-active={!!state.customColor || undefined} />
                <span className="sr-only">Custom colour</span>
              </label>
            </div>
          </fieldset>
          <Toggle
            label="Colour scale"
            hint="Colour follows the value"
            checked={state.colorScale}
            onChange={(v) => set({ colorScale: v, customColor: null })}
          />
          <RangeField label="size" min={16} max={64} step={2} value={state.size} onChange={(v) => set({ size: v })} format={(v) => `${v}px`} />
          <RangeField
            label="gap"
            min={0}
            max={24}
            step={1}
            value={state.gap ?? Math.round(state.size * 0.16)}
            onChange={(v) => set({ gap: v })}
            format={(v) => (state.gap === null ? `auto (${v}px)` : `${v}px`)}
          />
        </PanelGroup>

        <PanelGroup title="Motion">
          <Segmented<AnimationPreset>
            label="animation"
            value={state.animation}
            options={[
              { value: "none", label: "none" },
              { value: "subtle", label: "subtle" },
              { value: "spring", label: "spring" },
              { value: "playful", label: "playful" },
            ]}
            onChange={(v) => set({ animation: v })}
          />
          <Segmented
            label="celebrate"
            value={state.celebrate}
            options={[
              { value: "auto", label: "auto" },
              { value: "off", label: "off" },
              { value: "max", label: "max" },
              { value: "always", label: "always" },
            ]}
            onChange={(v) => set({ celebrate: v })}
          />
        </PanelGroup>

        <PanelGroup title="Behaviour">
          <Toggle label="readOnly" checked={state.readOnly} onChange={(v) => set({ readOnly: v })} />
          <Toggle label="disabled" checked={state.disabled} onChange={(v) => set({ disabled: v })} />
          <Toggle label="allowClear" hint="Click the value again to clear" checked={state.allowClear} onChange={(v) => set({ allowClear: v })} />
          <Segmented
            label="dir"
            value={state.dir}
            options={[
              { value: "ltr", label: "LTR" },
              { value: "rtl", label: "RTL" },
            ]}
            onChange={(v) => set({ dir: v })}
          />
        </PanelGroup>

        <PanelGroup title="Labels">
          <Toggle label="labels" hint="Words for each value" checked={state.useLabels} onChange={(v) => set({ useLabels: v })} />
          <Toggle label="showLabel" checked={state.showLabel} onChange={(v) => set({ showLabel: v })} />
          <Toggle label="tooltip" checked={state.tooltip} onChange={(v) => set({ tooltip: v })} />
          <TextField label="label" value={state.label} placeholder="e.g. Overall rating" onChange={(v) => set({ label: v })} />
          <TextField label="helperText" value={state.helperText} placeholder="e.g. Tap a star" onChange={(v) => set({ helperText: v })} />
        </PanelGroup>
      </aside>
    </div>
  );
}

function PanelGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="panel-group" open>
      <summary>{title}</summary>
      <div className="panel-body">{children}</div>
    </details>
  );
}

function format(v: number) {
  return String(Number(v.toFixed(2)));
}

/** Keeps the value valid when max/precision/icon change. */
function normalize(s: PlaygroundState): PlaygroundState {
  const single = s.highlight === "single" || (s.icon === "smiley" && s.highlight === "auto");
  const step = single ? 1 : s.precision;
  const value = Math.min(s.max, Math.round(s.value / step) * step);
  return { ...s, value: Number(value.toFixed(2)) };
}

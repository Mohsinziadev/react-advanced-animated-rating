import * as React from "react";
import { highlight } from "../lib/highlight";

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "failed">("idle");
  React.useEffect(() => {
    if (state === "idle") return;
    const t = setTimeout(() => setState("idle"), 1600);
    return () => clearTimeout(t);
  }, [state]);
  return (
    <button
      type="button"
      className={`btn btn-ghost btn-sm copy-btn ${className ?? ""}`}
      data-state={state}
      onClick={async () => setState((await copyText(text)) ? "copied" : "failed")}
    >
      <span className="copy-icon" aria-hidden="true">
        {state === "copied" ? (
          <svg viewBox="0 0 16 16" width="14" height="14">
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" width="14" height="14">
            <rect x="5" y="5" width="8.5" height="8.5" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10.5 3.2V3a1.5 1.5 0 0 0-1.5-1.5H4A1.5 1.5 0 0 0 2.5 3v5A1.5 1.5 0 0 0 4 9.5h.3" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        )}
      </span>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Press ⌘C" : label}</span>
    </button>
  );
}

export function CodeBlock({ code, title, className }: { code: string; title?: React.ReactNode; className?: string }) {
  return (
    <div className={`code ${className ?? ""}`}>
      <div className="code-head">
        <span className="code-title">{title ?? "TSX"}</span>
        <CopyButton text={code} />
      </div>
      <pre className="code-body" tabIndex={0}>
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}

interface SegmentedProps<T extends string | number> {
  label: string;
  value: T;
  options: ReadonlyArray<{ value: T; label: React.ReactNode; title?: string }>;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export function Segmented<T extends string | number>({ label, value, options, onChange, disabled }: SegmentedProps<T>) {
  const name = React.useId();
  return (
    <fieldset className="segmented" disabled={disabled}>
      <legend className="field-label">{label}</legend>
      <div className="segmented-track">
        {options.map((o) => (
          <label key={String(o.value)} className="segmented-option" title={o.title}>
            <input
              type="radio"
              name={name}
              value={String(o.value)}
              checked={o.value === value}
              onChange={() => onChange(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <label className="toggle" data-disabled={disabled || undefined}>
      <span className="toggle-text">
        <span>{label}</span>
        {hint ? <span className="toggle-hint">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-track" aria-hidden="true">
        <span className="toggle-thumb" />
      </span>
    </label>
  );
}

export function RangeField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = String,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const id = React.useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="range-field">
      <div className="range-head">
        <label htmlFor={id} className="field-label">
          {label}
        </label>
        <output htmlFor={id} className="range-value">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ "--pct": `${pct}%` } as React.CSSProperties}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const id = React.useId();
  return (
    <div className="text-field">
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <input id={id} type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function Section({
  id,
  eyebrow,
  title,
  lead,
  children,
}: {
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="section-head">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`}>{title}</h2>
        {lead ? <p className="lead">{lead}</p> : null}
      </div>
      {children}
    </section>
  );
}

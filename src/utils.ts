/** Number of decimal places needed to represent a step such as 0.5, 0.25 or 0.1. */
export function decimalsOf(step: number): number {
  if (!Number.isFinite(step)) return 0;
  const text = String(step);
  if (text.includes("e-")) return Number(text.split("e-")[1]) || 0;
  const dot = text.indexOf(".");
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Rounds `value` to the nearest multiple of `step`, removing float noise (0.1 + 0.2 → 0.3). */
export function roundToStep(value: number, step: number): number {
  if (!(step > 0)) return value;
  const rounded = Math.round(value / step) * step;
  return Number(rounded.toFixed(decimalsOf(step)));
}

/** Rounds `value` *up* to the next multiple of `step` (used for pointer positions). */
export function ceilToStep(value: number, step: number): number {
  if (!(step > 0)) return value;
  // Subtract a tiny epsilon so an exact multiple doesn't get bumped up by float error.
  const raised = Math.ceil(value / step - 1e-9) * step;
  return Number(raised.toFixed(decimalsOf(step)));
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Normalises the `max` prop to a positive integer. */
export function normalizeMax(max: unknown): number {
  const n = Math.floor(Number(max));
  return Number.isFinite(n) && n >= 1 ? Math.min(n, 100) : 5;
}

/** Normalises `precision` to a step in (0, 1]. Anything invalid falls back to 1. */
export function normalizePrecision(precision: unknown): number {
  const n = Number(precision);
  return Number.isFinite(n) && n > 0 && n <= 1 ? n : 1;
}

/**
 * Sanitises an incoming value: non-finite → 0, clamped to [0, max],
 * optionally snapped to `step`.
 */
export function sanitizeValue(value: unknown, max: number, step?: number): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  const clamped = Math.min(n, max);
  return step ? roundToStep(clamped, step) : clamped;
}

/** How full (0–1) the icon at `index` is for a given display value. */
export function fillFor(index: number, displayValue: number, highlight: "range" | "single"): number {
  if (highlight === "single") {
    return displayValue > 0 && Math.ceil(displayValue) - 1 === index ? 1 : 0;
  }
  return clamp(displayValue - index, 0, 1);
}

/** Picks a colour from a palette for the current value (palette is spread evenly across 1..max). */
export function pickColor(
  color: string | readonly string[] | ((value: number, max: number) => string) | undefined,
  value: number,
  max: number,
): string | undefined {
  if (color == null) return undefined;
  if (typeof color === "function") return color(value, max);
  if (typeof color === "string") return color;
  if (color.length === 0) return undefined;
  if (value <= 0) return color[0];
  const ratio = (Math.ceil(value) - 1) / Math.max(1, max - 1);
  return color[Math.round(ratio * (color.length - 1))];
}

/** Picks the label for the current value from a labels array indexed by whole value (1-based). */
export function pickLabel(labels: readonly string[] | undefined, value: number): string | undefined {
  if (!labels || value <= 0) return undefined;
  return labels[Math.ceil(value) - 1];
}

export function formatValue(value: number, step: number): string {
  // Show up to the step's decimals but drop trailing zeros: 4 → "4", 3.5 → "3.5".
  return String(Number(value.toFixed(Math.max(decimalsOf(step), 0))));
}

export const SIZE_PRESETS = { xs: 16, sm: 20, md: 28, lg: 36, xl: 48 } as const;
export type SizePreset = keyof typeof SIZE_PRESETS;

export function toCssLength(size: number | string | undefined): string | undefined {
  if (size == null) return undefined;
  if (typeof size === "number") return `${size}px`;
  if (size in SIZE_PRESETS) return `${SIZE_PRESETS[size as SizePreset]}px`;
  return size;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

const warned = new Set<string>();
export function devWarn(key: string, message: string): void {
  if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "production") return;
  if (warned.has(key)) return;
  warned.add(key);
  console.warn(`[react-advanced-rating] ${message}`);
}

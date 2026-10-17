import type { AnimationPreset, RatingProps, RatingTheme } from "react-advanced-rating";

export type IconChoice = "star" | "heart" | "circle" | "bolt" | "smiley" | "number" | "emoji";

export interface PlaygroundState {
  controlled: boolean;
  value: number;
  max: number;
  precision: number;
  icon: IconChoice;
  theme: RatingTheme;
  customColor: string | null;
  colorScale: boolean;
  emptyStyle: "filled" | "outline";
  size: number;
  gap: number | null;
  animation: AnimationPreset;
  celebrate: "auto" | "off" | "max" | "always";
  readOnly: boolean;
  disabled: boolean;
  allowClear: boolean;
  highlight: "auto" | "range" | "single";
  dir: "ltr" | "rtl";
  showLabel: boolean;
  tooltip: boolean;
  useLabels: boolean;
  label: string;
  helperText: string;
}

export const DEFAULT_STATE: PlaygroundState = {
  controlled: true,
  value: 3.5,
  max: 5,
  precision: 0.5,
  icon: "star",
  theme: "gold",
  customColor: null,
  colorScale: false,
  emptyStyle: "filled",
  size: 40,
  gap: null,
  animation: "spring",
  celebrate: "auto",
  readOnly: false,
  disabled: false,
  allowClear: true,
  highlight: "auto",
  dir: "ltr",
  showLabel: true,
  tooltip: false,
  useLabels: true,
  label: "",
  helperText: "",
};

export const COLOR_SCALE = ["#e5484d", "#f76b15", "#f5b400", "#7cbf3a", "#30a46c"];

const LABELS_10 = [
  "Awful",
  "Very poor",
  "Poor",
  "Below average",
  "Average",
  "Above average",
  "Good",
  "Very good",
  "Excellent",
  "Outstanding",
];
const LABEL_SETS: Record<number, string[]> = {
  1: ["Love it"],
  2: ["Not for me", "Love it"],
  3: ["Bad", "Okay", "Great"],
  4: ["Poor", "Fair", "Good", "Great"],
  5: ["Terrible", "Bad", "Okay", "Good", "Excellent"],
};

/** A sensible label set for any scale length. */
export function labelsFor(max: number): string[] {
  if (LABEL_SETS[max]) return LABEL_SETS[max];
  return Array.from({ length: max }, (_, i) => LABELS_10[Math.round((i / (max - 1)) * 9)]);
}

const SIZE_NAMES: Record<number, string> = { 16: "xs", 20: "sm", 28: "md", 36: "lg", 48: "xl" };

/**
 * The single source of truth for the playground: both the live preview and the
 * generated code are derived from these props, so they cannot drift apart.
 */
export function toProps(state: PlaygroundState): Partial<RatingProps> {
  const props: Partial<RatingProps> = {};
  const singleByDefault = state.icon === "smiley";
  const highlight = state.highlight === "auto" ? (singleByDefault ? "single" : "range") : state.highlight;

  if (state.max !== 5) props.max = state.max;
  if (state.precision !== 1 && highlight !== "single") props.precision = state.precision;
  if (state.icon === "emoji") props.icon = "🔥";
  else if (state.icon !== "star") props.icon = state.icon;
  if (state.highlight !== "auto" && highlight !== (singleByDefault ? "single" : "range")) props.highlight = highlight;

  if (SIZE_NAMES[state.size]) {
    if (state.size !== 28) props.size = SIZE_NAMES[state.size] as RatingProps["size"];
  } else props.size = state.size;
  if (state.gap !== null) props.gap = state.gap;

  if (state.colorScale) props.color = COLOR_SCALE;
  else if (state.customColor) props.color = state.customColor;
  if (state.theme !== "gold") props.theme = state.theme;
  if (state.emptyStyle !== "filled") props.emptyStyle = state.emptyStyle;

  if (state.animation !== "spring") props.animation = state.animation;
  const celebrateDefault = state.animation === "playful" ? "max" : "off";
  const celebrate = state.celebrate === "auto" ? celebrateDefault : state.celebrate;
  if (celebrate !== celebrateDefault) props.celebrate = celebrate === "always" ? true : celebrate === "max" ? "max" : false;

  if (state.readOnly) props.readOnly = true;
  if (state.disabled) props.disabled = true;
  if (!state.allowClear) props.allowClear = false;
  if (state.dir === "rtl") props.dir = "rtl";

  if (state.label.trim()) props.label = state.label.trim();
  if (state.helperText.trim()) props.helperText = state.helperText.trim();
  if (state.useLabels) props.labels = labelsFor(state.max);
  if (state.showLabel) props.showLabel = true;
  if (state.tooltip) props.tooltip = true;

  return props;
}

function serialize(value: unknown): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) {
    const inner = value.map((v) => JSON.stringify(v)).join(", ");
    return `{[${inner}]}`;
  }
  return `{${JSON.stringify(value)}}`;
}

function attr(name: string, value: unknown): string {
  if (value === true) return name;
  if (typeof value === "string") return `${name}=${serialize(value)}`;
  return `${name}=${serialize(value)}`;
}

export function generateCode(state: PlaygroundState): string {
  const props = toProps(state);
  const lines: string[] = [];
  const value = state.value;

  if (state.controlled) lines.push(`value={value}`, `onChange={setValue}`);
  else if (value > 0) lines.push(`defaultValue={${value}}`);

  for (const [key, v] of Object.entries(props)) {
    if (v === undefined) continue;
    const rendered = attr(key, v);
    // Wrap long arrays on their own line for readability
    lines.push(rendered);
  }

  const jsx =
    lines.length === 0
      ? "<Rating />"
      : `<Rating\n${lines.map((l) => `      ${l}`).join("\n")}\n    />`;

  const imports = [
    state.controlled ? `import { useState } from "react";` : null,
    `import { Rating } from "react-advanced-rating";`,
    `import "react-advanced-rating/styles.css";`,
  ].filter(Boolean);

  const body = state.controlled
    ? `  const [value, setValue] = useState(${value});\n\n  return (\n    ${jsx}\n  );`
    : `  return (\n    ${jsx}\n  );`;

  return `${imports.join("\n")}\n\nexport function ProductRating() {\n${body}\n}\n`;
}

import * as React from "react";
import {
  ceilToStep,
  clamp,
  fillFor,
  formatValue,
  normalizeMax,
  normalizePrecision,
  pickLabel,
  roundToStep,
  sanitizeValue,
} from "./utils";

export type RatingHighlight = "range" | "single";
export type CommitSource = "pointer" | "keyboard" | "api";

export interface LabelTextContext {
  max: number;
  /** The entry of `labels` for this value, if any. */
  label?: string;
  readOnly: boolean;
}

export interface UseRatingOptions {
  /** Controlled value. Use `0` for "no rating". */
  value?: number;
  /** Initial value when uncontrolled. @default 0 */
  defaultValue?: number;
  /** Called with the new value whenever the user commits a rating (0 when cleared). */
  onChange?: (value: number) => void;
  /** Called while hovering/scrubbing with the previewed value, and `null` when the preview ends. */
  onHoverChange?: (value: number | null) => void;
  /** Number of items in the scale. @default 5 */
  max?: number;
  /**
   * Step between selectable values, e.g. `0.5` for half stars or `0.1` for tenths.
   * Read-only ratings render the exact value unless a precision is given.
   * @default 1
   */
  precision?: number;
  readOnly?: boolean;
  disabled?: boolean;
  /** Clicking the current value (or pressing Backspace/Delete/0) clears the rating. @default true */
  allowClear?: boolean;
  /** `range` fills every item up to the value; `single` highlights only the selected item. @default "range" */
  highlight?: RatingHighlight;
  /** Text direction. When omitted it is read from the rendered element (inherits `dir`). */
  dir?: "ltr" | "rtl";
  /** Per-value labels (index 0 → value 1), used for screen readers, tooltips and visible labels. */
  labels?: readonly string[];
  /** Builds the text announced by screen readers. Override for i18n. */
  getLabelText?: (value: number, context: LabelTextContext) => string;
  /** Internal hook for side effects such as animations. */
  onCommit?: (value: number, previous: number, source: CommitSource) => void;
}

export interface RatingItemState {
  index: number;
  /** The value this item represents (index + 1). */
  value: number;
  /** 0–1 fill amount (fractional for partial items). */
  fill: number;
  isFilled: boolean;
  isPartial: boolean;
  /** The item that contains the current display value. */
  isActive: boolean;
  /** True while the item is part of a hover/scrub preview. */
  isPreview: boolean;
}

export function defaultGetLabelText(value: number, { max, label, readOnly }: LabelTextContext): string {
  const amount = `${formatValue(value, 0.01)} out of ${max}`;
  if (readOnly) return `Rated ${amount}${label ? `, ${label}` : ""}`;
  if (value === 0) return "No rating selected";
  return `${amount}${label ? `, ${label}` : ""}`;
}

const ITEM_SELECTOR = "[data-rar-item]";

export function useRating(options: UseRatingOptions = {}) {
  const {
    value: valueProp,
    defaultValue = 0,
    onChange,
    onHoverChange,
    readOnly = false,
    disabled = false,
    allowClear = true,
    highlight = "range",
    dir,
    labels,
    getLabelText = defaultGetLabelText,
    onCommit,
  } = options;

  const max = normalizeMax(options.max ?? 5);
  const step = highlight === "single" ? 1 : normalizePrecision(options.precision ?? 1);
  // Read-only displays keep exact fractions (e.g. an average of 4.37) unless a precision was requested.
  const snap = !readOnly || options.precision !== undefined;
  const interactive = !readOnly && !disabled;

  const isControlled = valueProp !== undefined;
  const [internalValue, setInternalValue] = React.useState(() => sanitizeValue(defaultValue, max, step));
  const value = sanitizeValue(isControlled ? valueProp : internalValue, max, snap ? step : undefined);

  const [hoverState, setHoverState] = React.useState<number | null>(null);
  // A control that stops being interactive mid-hover shouldn't keep showing a preview.
  const hoverValue = interactive ? hoverState : null;
  const hoverRef = React.useRef<number | null>(null);
  const controlRef = React.useRef<HTMLElement | null>(null);
  const drag = React.useRef<{ id: number; x: number; active: boolean } | null>(null);
  const suppressClickUntil = React.useRef(0);
  // After a click we hide the hover preview until the pointer moves to a different value,
  // otherwise clearing a rating would keep showing the hovered stars.
  const lockedHover = React.useRef<number | null>(null);

  const setHover = (next: number | null) => {
    if (hoverRef.current === next) return;
    hoverRef.current = next;
    setHoverState(next);
    onHoverChange?.(next);
  };

  const commit = (next: number, source: CommitSource) => {
    const clean = sanitizeValue(next, max, step);
    if (clean === value) return;
    if (!isControlled) setInternalValue(clean);
    onChange?.(clean);
    onCommit?.(clean, value, source);
  };

  const isRtl = (): boolean => {
    if (dir) return dir === "rtl";
    const el = controlRef.current;
    return !!el && typeof getComputedStyle === "function" && getComputedStyle(el).direction === "rtl";
  };

  const valueInItem = (index: number, rect: DOMRect, clientX: number, rtl: boolean): number => {
    if (highlight === "single" || !(rect.width > 0)) return index + 1;
    const fraction = clamp(rtl ? (rect.right - clientX) / rect.width : (clientX - rect.left) / rect.width, 0, 1);
    return clamp(index + clamp(ceilToStep(fraction, step), step, 1), step, max);
  };

  const valueFromPointer = (clientX: number, target: EventTarget | null): number | null => {
    const control = controlRef.current;
    if (!control) return null;
    const rtl = isRtl();
    const hit = target instanceof Element ? target.closest<HTMLElement>(ITEM_SELECTOR) : null;
    if (hit && control.contains(hit) && !drag.current?.active) {
      return valueInItem(Number(hit.dataset.rarItem), hit.getBoundingClientRect(), clientX, rtl);
    }
    // Pointer is captured (scrubbing) or sitting in a gap: find the item by position.
    const items = control.querySelectorAll<HTMLElement>(ITEM_SELECTOR);
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect();
      const before = rtl ? clientX > rect.right : clientX < rect.left;
      if (before) return i === 0 ? step : i;
      if (clientX >= rect.left && clientX <= rect.right) return valueInItem(i, rect, clientX, rtl);
    }
    return items.length ? max : null;
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!interactive) return;
    const d = drag.current;
    if (event.pointerType !== "mouse") {
      if (!d || d.id !== event.pointerId) return;
      if (!d.active) {
        if (Math.abs(event.clientX - d.x) < 6) return;
        d.active = true;
        try {
          (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
        } catch {
          /* capture is an enhancement only */
        }
      }
    }
    const next = valueFromPointer(event.clientX, event.target);
    if (next === null) return;
    if (lockedHover.current !== null) {
      if (next === lockedHover.current) return;
      lockedHover.current = null;
    }
    setHover(next);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!interactive || event.pointerType === "mouse" || !event.isPrimary) return;
    drag.current = { id: event.pointerId, x: event.clientX, active: false };
  };

  const endDrag = (event: React.PointerEvent, commitValue: boolean) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    if (d.active) {
      suppressClickUntil.current = event.timeStamp + 500;
      const next = commitValue ? valueFromPointer(event.clientX, null) : null;
      setHover(null);
      if (next !== null) commit(next, "pointer");
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    if (!interactive || event.timeStamp < suppressClickUntil.current) return;
    const next = valueFromPointer(event.clientX, event.target);
    if (next === null) return;
    const target = allowClear && next === value ? 0 : next;
    lockedHover.current = next;
    setHover(null);
    commit(target, "pointer");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!interactive) return;
    const rtl = isRtl();
    const lower = allowClear || value === 0 ? 0 : step;
    let next: number | null = null;
    switch (event.key) {
      case "ArrowUp":
        next = value + step;
        break;
      case "ArrowDown":
        next = value - step;
        break;
      case "ArrowRight":
        next = value + (rtl ? -step : step);
        break;
      case "ArrowLeft":
        next = value + (rtl ? step : -step);
        break;
      case "PageUp":
        next = value + 1;
        break;
      case "PageDown":
        next = value - 1;
        break;
      case "Home":
        next = lower;
        break;
      case "End":
        next = max;
        break;
      case "Backspace":
      case "Delete":
        if (allowClear) next = 0;
        break;
      default:
        if (/^[0-9]$/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
          const digit = Number(event.key);
          if (digit === 0 ? allowClear : digit <= max) next = digit;
        }
    }
    if (next === null) return;
    event.preventDefault();
    lockedHover.current = null;
    setHover(null);
    commit(clamp(roundToStep(next, step), lower, max), "keyboard");
  };

  const displayValue = hoverValue ?? value;
  const label = pickLabel(labels, displayValue);
  const valueText = getLabelText(value, { max, label: pickLabel(labels, value), readOnly });

  const getItemState = (index: number): RatingItemState => {
    const fill = fillFor(index, displayValue, highlight);
    return {
      index,
      value: index + 1,
      fill,
      isFilled: fill >= 1,
      isPartial: fill > 0 && fill < 1,
      isActive: displayValue > 0 && Math.ceil(displayValue) - 1 === index,
      isPreview: hoverValue !== null && fill > 0,
    };
  };

  /** Props for the element that wraps the items. Spread these onto it. */
  const getControlProps = () => {
    const shared = {
      ref: (node: HTMLElement | null) => {
        controlRef.current = node;
      },
      onPointerMove: handlePointerMove,
      onPointerDown: handlePointerDown,
      onPointerUp: (e: React.PointerEvent) => endDrag(e, true),
      onPointerCancel: (e: React.PointerEvent) => endDrag(e, false),
      onPointerLeave: () => {
        lockedHover.current = null;
        if (!drag.current?.active) setHover(null);
      },
      onClick: handleClick,
      onKeyDown: handleKeyDown,
    };
    if (readOnly) {
      return { ...shared, role: "img" as const, "aria-label": valueText };
    }
    return {
      ...shared,
      role: "slider" as const,
      tabIndex: disabled ? -1 : 0,
      "aria-valuemin": 0,
      "aria-valuemax": max,
      "aria-valuenow": value,
      "aria-valuetext": valueText,
      "aria-disabled": disabled || undefined,
    };
  };

  /** Props for each item. Items must be direct or nested children of the control element. */
  const getItemProps = (index: number) => ({
    "data-rar-item": index,
    "aria-hidden": true as const,
  });

  return {
    value,
    hoverValue,
    displayValue,
    isHovering: hoverValue !== null,
    max,
    step,
    interactive,
    /** Label (from `labels`) for the value currently shown, including hover previews. */
    label,
    /** The text exposed to assistive technology for the committed value. */
    valueText,
    items: Array.from({ length: max }, (_, i) => i),
    getItemState,
    getControlProps,
    getItemProps,
    /** Imperatively set the value (respects controlled mode by calling onChange). */
    setValue: (next: number) => commit(next, "api"),
    clear: () => commit(0, "api"),
    controlRef,
  };
}

export type UseRatingReturn = ReturnType<typeof useRating>;

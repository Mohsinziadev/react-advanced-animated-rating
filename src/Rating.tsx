import * as React from "react";
import { BoltIcon, CircleIcon, FaceIcon, HeartIcon, StarIcon, moodFor } from "./icons";
import { burst, playCommit, type AnimationPreset } from "./motion";
import { useRating, type CommitSource, type RatingItemState, type UseRatingOptions } from "./useRating";
import { cx, devWarn, formatValue, pickColor, toCssLength, type SizePreset } from "./utils";

export type BuiltInIcon = "star" | "heart" | "circle" | "bolt" | "smiley" | "number";

export interface IconRenderState extends RatingItemState {
  max: number;
  /** `true` when rendering the filled layer, `false` for the empty layer. */
  filled: boolean;
}

/**
 * A built-in icon name, any React node (an SVG, an emoji string, an image), or a
 * render function that receives the item state.
 */
export type RatingIcon = BuiltInIcon | React.ReactNode | ((state: IconRenderState) => React.ReactNode);

export type RatingTheme = "gold" | "rose" | "violet" | "emerald" | "ocean" | "mono" | "contrast";

export type RatingColor = string | readonly string[] | ((value: number, max: number) => string);

export interface RatingProps
  extends Omit<UseRatingOptions, "onCommit">,
    Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "color" | "dir"> {
  /** Icon for the filled layer. @default "star" */
  icon?: RatingIcon;
  /** Icon for the empty layer. Defaults to the same shape as `icon`. */
  emptyIcon?: RatingIcon;
  /** Render empty icons as a solid shape (`filled`) or as an outline. @default "filled" */
  emptyStyle?: "filled" | "outline";
  /** Icon size: a preset, a number of pixels or any CSS length. @default "md" */
  size?: SizePreset | number | string;
  /** Space between icons (pixels or any CSS length). */
  gap?: number | string;
  /**
   * Active colour. Pass an array to create a colour scale across the range
   * (e.g. red → green) or a function `(value, max) => color`.
   */
  color?: RatingColor;
  /** Colour of empty icons. */
  inactiveColor?: string;
  /** Built-in colour theme. Any colour prop overrides the theme. @default "gold" */
  theme?: RatingTheme;
  /** Motion personality. Users with reduced-motion enabled always get minimal motion. @default "spring" */
  animation?: AnimationPreset;
  /**
   * Celebrate a selection with a particle burst: `true` for every rating, `"max"` for the
   * top score only, or a number for "this value or higher".
   * @default "max" for the playful preset, otherwise false
   */
  celebrate?: boolean | "max" | number;
  /** Visible label for the control. Also used as its accessible name. */
  label?: React.ReactNode;
  /** Helper text shown under the control and linked with aria-describedby. */
  helperText?: React.ReactNode;
  /** Marks the control invalid. Pass a node to show it as the error message. */
  error?: boolean | React.ReactNode;
  /**
   * Show the current label (from `labels`) or value next to the icons. Pass a function
   * to format it yourself.
   */
  showLabel?: boolean | ((value: number, label: string | undefined) => React.ReactNode);
  /** Show a tooltip with the label/value above the hovered item. */
  tooltip?: boolean;
  /** Form field name. A hidden input carrying the value is rendered when set. */
  name?: string;
  /** Associates the hidden input with a form by id. */
  form?: string;
  /** Block native form submission while no rating is selected. */
  required?: boolean;
  /** Message shown when a `required` rating is missing on submit. @default "Please select a rating." */
  requiredMessage?: React.ReactNode;
  /** Class added to every item. */
  itemClassName?: string;
  /** Class added to the element with role="slider"/"img". */
  controlClassName?: string;
  /** Id for the element with role="slider"/"img". */
  id?: string;

  /** @deprecated since 3.0 — use `value` (controlled) or `defaultValue`. */
  rating?: number;
  /** @deprecated since 3.0 — use `readOnly={false}` (ratings are editable by default). */
  editable?: boolean;
  /** @deprecated since 3.0 — use `animation` ("none" to disable). */
  enableAnimation?: boolean;
  /** @deprecated since 3.0 — use `color`. */
  starColor?: string;
  /** @deprecated since 3.0 — use `itemClassName`. */
  backgroundClass?: string;
}

const SMILEY_SCALE = ["#e5484d", "#f76b15", "#f5b400", "#7cbf3a", "#30a46c"] as const;
const BUILT_IN = new Set<string>(["star", "heart", "circle", "bolt", "smiley", "number"]);

function renderIcon(icon: RatingIcon, state: IconRenderState): React.ReactNode {
  if (typeof icon === "function") return icon(state);
  if (typeof icon === "string" && BUILT_IN.has(icon)) {
    switch (icon as BuiltInIcon) {
      case "heart":
        return <HeartIcon />;
      case "circle":
        return <CircleIcon />;
      case "bolt":
        return <BoltIcon />;
      case "smiley":
        return <FaceIcon mood={moodFor(state.index, state.max)} />;
      case "number":
        return <span className="rar-number">{state.value}</span>;
      default:
        return <StarIcon />;
    }
  }
  if (typeof icon === "string" || typeof icon === "number") {
    return <span className="rar-glyph">{icon}</span>;
  }
  return icon as React.ReactNode;
}

function shouldCelebrate(celebrate: RatingProps["celebrate"], value: number, max: number): boolean {
  if (!celebrate || value <= 0) return false;
  if (celebrate === true) return true;
  if (celebrate === "max") return value >= max;
  return value >= celebrate;
}

function useLegacyValue(rating: number | undefined, onChange: ((v: number) => void) | undefined) {
  // 2.x treated `rating` as an initial value that re-syncs whenever the prop changes,
  // while still updating locally on click. Reproduce that exactly.
  const [local, setLocal] = React.useState(rating ?? 0);
  const [prevRating, setPrevRating] = React.useState(rating);
  if (rating !== prevRating) {
    setPrevRating(rating);
    setLocal(rating ?? 0);
  }
  const handleChange = React.useCallback(
    (v: number) => {
      setLocal(v);
      onChange?.(v);
    },
    [onChange],
  );
  return [local, handleChange] as const;
}

export const Rating = /* @__PURE__ */ React.forwardRef<HTMLDivElement, RatingProps>(function Rating(props, ref) {
  const {
    // value & behaviour
    value: valueProp,
    defaultValue,
    onChange,
    onHoverChange,
    max,
    precision,
    readOnly: readOnlyProp,
    disabled = false,
    allowClear,
    highlight: highlightProp,
    dir,
    labels,
    getLabelText,
    // presentation
    icon = "star",
    emptyIcon,
    emptyStyle = "filled",
    size = "md",
    gap,
    color,
    inactiveColor,
    theme = "gold",
    animation: animationProp,
    celebrate: celebrateProp,
    label,
    helperText,
    error,
    showLabel = false,
    tooltip = false,
    name,
    form,
    required = false,
    requiredMessage = "Please select a rating.",
    itemClassName,
    controlClassName,
    id,
    className,
    style,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    // legacy 2.x props
    rating,
    editable,
    enableAnimation,
    starColor,
    backgroundClass,
    ...rest
  } = props;

  const isLegacy = rating !== undefined && valueProp === undefined;
  const [legacyValue, legacyOnChange] = useLegacyValue(rating, onChange);

  // 2.x was read-only unless `editable` was passed, so keep that default for legacy usage.
  const readOnly = readOnlyProp ?? (editable !== undefined ? !editable : isLegacy);
  const animation: AnimationPreset = animationProp ?? (enableAnimation === false ? "none" : "spring");
  const celebrate = celebrateProp ?? (animation === "playful" ? "max" : false);
  const highlight = highlightProp ?? (icon === "smiley" ? "single" : "range");

  const reactId = React.useId();
  const labelId = `${reactId}-label`;
  const messageId = `${reactId}-message`;
  const controlNode = React.useRef<HTMLElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [missingRequired, setMissingRequired] = React.useState(false);

  const onCommit = (next: number, _prev: number, source: CommitSource) => {
    if (next > 0) setMissingRequired(false);
    // Programmatic changes (form reset, setValue) and "none" stay still.
    if (source === "api" || animation === "none") return;
    const index = Math.ceil(next) - 1;
    playCommit(controlNode.current, index, animation, highlight);
    if (shouldCelebrate(celebrate, next, rating_.max)) {
      const anchor = controlNode.current?.querySelectorAll<HTMLElement>("[data-rar-item]")[index] ?? null;
      burst(anchor, animation, activeColorFor(next));
    }
  };

  const rating_ = useRating({
    value: isLegacy ? legacyValue : valueProp,
    defaultValue,
    onChange: isLegacy ? legacyOnChange : onChange,
    onHoverChange,
    max,
    precision,
    readOnly,
    disabled,
    allowClear,
    highlight,
    dir,
    labels,
    getLabelText,
    onCommit,
  });

  const resolvedColor = color ?? starColor ?? (icon === "smiley" ? SMILEY_SCALE : undefined);
  function activeColorFor(v: number) {
    return pickColor(resolvedColor, v, rating_.max);
  }
  const activeColor = activeColorFor(rating_.displayValue);

  // After a value change, newly filled icons cascade forwards (or drain backwards) from the
  // previous value. Outside that window, e.g. when a hover preview ends, fills snap back.
  const [cascade, setCascade] = React.useState<{ dir: "up" | "down"; from: number } | null>(null);
  const [prevValue, setPrevValue] = React.useState(rating_.value);
  if (prevValue !== rating_.value) {
    const up = rating_.value > prevValue;
    setPrevValue(rating_.value);
    setCascade({ dir: up ? "up" : "down", from: up ? Math.floor(prevValue) : Math.ceil(prevValue) });
  }
  React.useEffect(() => {
    if (!cascade) return;
    const timer = setTimeout(() => setCascade(null), 900);
    return () => clearTimeout(timer);
  }, [cascade]);

  // Uncontrolled ratings follow native form resets.
  const { setValue } = rating_;
  const resetTo = defaultValue ?? 0;
  const isControlled = valueProp !== undefined || isLegacy;
  React.useEffect(() => {
    const formEl = inputRef.current?.form;
    if (!formEl || isControlled) return;
    const onReset = () => {
      setMissingRequired(false);
      setValue(resetTo);
    };
    formEl.addEventListener("reset", onReset);
    return () => formEl.removeEventListener("reset", onReset);
  }, [isControlled, resetTo, setValue]);

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof getComputedStyle !== "function") return;
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV === "test") return;
    if (getComputedStyle(el).getPropertyValue("--rar-stylesheet").trim() === "") {
      devWarn(
        "css",
        'Styles not found. Add `import "react-advanced-rating/styles.css";` once in your app for layout and animations.',
      );
    }
  }, []);

  const setRootRef = (node: HTMLDivElement | null) => {
    rootRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const controlProps = rating_.getControlProps();
  const { ref: hookControlRef, ...controlRest } = controlProps;
  const setControlRef = (node: HTMLElement | null) => {
    controlNode.current = node;
    hookControlRef(node);
  };

  const invalid = !!error || missingRequired;
  const message =
    error && error !== true ? error : missingRequired ? requiredMessage : helperText;
  const describedBy = cx(ariaDescribedBy, message != null && message !== false ? messageId : undefined) || undefined;
  const hasVisibleLabel = label != null && label !== false;
  const labelledBy = ariaLabelledBy ?? (hasVisibleLabel && !ariaLabel ? labelId : undefined);

  // Read-only ratings use role="img", whose accessible name must contain the value.
  const namePrefix = ariaLabel ?? (typeof label === "string" ? label : undefined);
  const accessibleProps = readOnly
    ? { "aria-label": namePrefix ? `${namePrefix}, ${rating_.valueText}` : rating_.valueText }
    : { "aria-label": ariaLabel, "aria-labelledby": labelledBy, "aria-invalid": invalid || undefined };

  const cssVars: Record<string, string | undefined> = {
    "--rar-size": toCssLength(size),
    "--rar-gap": toCssLength(gap),
    "--rar-active-color": activeColor,
    "--rar-inactive-color": inactiveColor,
  };
  const rootStyle = { ...(cssVars as React.CSSProperties), ...style };

  const display = rating_.displayValue;
  const shownLabel =
    typeof showLabel === "function"
      ? showLabel(display, rating_.label)
      : showLabel
        ? (rating_.label ?? (display > 0 ? `${formatValue(display, 0.01)} / ${rating_.max}` : " "))
        : null;

  return (
    <div
      {...rest}
      ref={setRootRef}
      className={cx("rar", className)}
      style={rootStyle}
      dir={dir}
      data-theme={theme}
      data-animation={animation}
      data-empty-style={emptyStyle}
      data-readonly={readOnly || undefined}
      data-disabled={disabled || undefined}
      data-invalid={invalid || undefined}
    >
      {hasVisibleLabel ? (
        <span id={labelId} className="rar-label">
          {label}
        </span>
      ) : null}
      <div className="rar-row">
        <div
          {...controlRest}
          {...accessibleProps}
          id={id}
          ref={setControlRef}
          aria-describedby={describedBy}
          className={cx("rar-control", controlClassName)}
          data-hovering={rating_.isHovering || undefined}
          data-cascade={cascade?.dir}
          data-highlight={highlight}
          style={cascade ? ({ "--rar-from": cascade.from } as React.CSSProperties) : undefined}
        >
          {rating_.items.map((index) => {
            const state = rating_.getItemState(index);
            const iconState = { ...state, max: rating_.max };
            return (
              <span
                key={index}
                {...rating_.getItemProps(index)}
                className={cx("rar-item", icon === "number" && "rar-item--number", itemClassName, backgroundClass)}
                data-state={state.isFilled ? "full" : state.isPartial ? "partial" : "empty"}
                data-active={state.isActive || undefined}
                data-preview={state.isPreview || undefined}
                style={{ "--rar-fill": state.fill, "--rar-i": index, "--rar-ri": rating_.max - 1 - index } as React.CSSProperties}
              >
                <span className="rar-motion">
                  <span className="rar-icon rar-icon-empty">
                    {renderIcon(emptyIcon ?? icon, { ...iconState, filled: false })}
                  </span>
                  <span className="rar-icon rar-icon-fill">{renderIcon(icon, { ...iconState, filled: true })}</span>
                </span>
                {tooltip && rating_.isHovering && state.isActive ? (
                  <span className="rar-tooltip">
                    {rating_.label ?? `${formatValue(display, 0.01)} / ${rating_.max}`}
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
        {shownLabel != null ? (
          <span className="rar-value" aria-hidden="true">
            {shownLabel}
          </span>
        ) : null}
      </div>
      {message != null && message !== false ? (
        <span id={messageId} className="rar-message" aria-live={invalid ? "polite" : undefined}>
          {message}
        </span>
      ) : null}
      {required ? (
        <input
          ref={inputRef}
          className="rar-input"
          type="text"
          tabIndex={-1}
          aria-hidden="true"
          name={name}
          form={form}
          required
          value={rating_.value > 0 ? String(rating_.value) : ""}
          onChange={() => undefined}
          onInvalid={(event) => {
            event.preventDefault();
            setMissingRequired(true);
            controlNode.current?.focus();
          }}
        />
      ) : name ? (
        <input
          ref={inputRef}
          type="hidden"
          name={name}
          form={form}
          value={rating_.value > 0 ? String(rating_.value) : ""}
        />
      ) : null}
    </div>
  );
});


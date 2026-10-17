import * as React from "react";
import { ThumbDownIcon, ThumbUpIcon } from "./icons";
import { burst, playCommit, playNudge, type AnimationPreset } from "./motion";
import { cx, toCssLength, type SizePreset } from "./utils";

export type ThumbsValue = "up" | "down" | null;

export interface ThumbsRatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "color"> {
  value?: ThumbsValue;
  defaultValue?: ThumbsValue;
  /** Called with the new value; pressing the selected thumb again clears it (null). */
  onChange?: (value: ThumbsValue) => void;
  readOnly?: boolean;
  disabled?: boolean;
  /** Accessible names / visible captions for each button. */
  labels?: { up?: string; down?: string };
  /** Show the labels as visible text next to the icons. @default false */
  showLabels?: boolean;
  /** Optional counts shown next to each button (e.g. "12"). */
  counts?: { up?: number; down?: number };
  /** Number formatting for counts. @default compact Intl formatting */
  formatCount?: (count: number) => string;
  size?: SizePreset | number | string;
  animation?: AnimationPreset;
  /** Particle burst when "up" is selected. @default true */
  celebrate?: boolean;
  /** Accessible name for the group, e.g. "Was this answer helpful?" */
  "aria-label"?: string;
  /** Form field name; submits "up", "down" or "". */
  name?: string;
}

const defaultFormat = (n: number) => {
  try {
    return new Intl.NumberFormat(undefined, { notation: "compact" }).format(n);
  } catch {
    return String(n);
  }
};

export const ThumbsRating = /* @__PURE__ */ React.forwardRef<HTMLDivElement, ThumbsRatingProps>(function ThumbsRating(
  {
    value: valueProp,
    defaultValue = null,
    onChange,
    readOnly = false,
    disabled = false,
    labels,
    showLabels = false,
    counts,
    formatCount = defaultFormat,
    size = "md",
    animation = "spring",
    celebrate = true,
    name,
    className,
    style,
    ...rest
  },
  ref,
) {
  const [internal, setInternal] = React.useState<ThumbsValue>(defaultValue);
  const value = valueProp !== undefined ? valueProp : internal;
  const buttons = React.useRef<Record<"up" | "down", HTMLButtonElement | null>>({ up: null, down: null });
  const upLabel = labels?.up ?? "Helpful";
  const downLabel = labels?.down ?? "Not helpful";

  const select = (choice: "up" | "down") => {
    const button = buttons.current[choice];
    if (readOnly) {
      playNudge(button);
      return;
    }
    const next = value === choice ? null : choice;
    if (valueProp === undefined) setInternal(next);
    onChange?.(next);
    if (next && button) {
      playCommit(button, 0, animation, "single");
      if (celebrate && next === "up") burst(button.querySelector<HTMLElement>("[data-rar-item]"), animation);
    }
  };

  const renderButton = (choice: "up" | "down") => {
    const pressed = value === choice;
    const text = choice === "up" ? upLabel : downLabel;
    const count = counts?.[choice];
    return (
      <button
        type="button"
        ref={(node) => {
          buttons.current[choice] = node;
        }}
        className="rar-thumb"
        data-choice={choice}
        data-pressed={pressed || undefined}
        aria-pressed={pressed}
        aria-label={showLabels ? undefined : count != null ? `${text} (${count})` : text}
        aria-readonly={readOnly || undefined}
        disabled={disabled}
        onClick={() => select(choice)}
      >
        <span className="rar-item" data-rar-item={0} data-state={pressed ? "full" : "empty"} aria-hidden="true">
          <span className="rar-motion">
            <span className="rar-icon rar-icon-empty">{choice === "up" ? <ThumbUpIcon /> : <ThumbDownIcon />}</span>
            <span className="rar-icon rar-icon-fill">{choice === "up" ? <ThumbUpIcon /> : <ThumbDownIcon />}</span>
          </span>
        </span>
        {showLabels ? <span className="rar-thumb-label">{text}</span> : null}
        {count != null ? (
          <span className="rar-thumb-count" aria-hidden={showLabels ? undefined : true}>
            {formatCount(count)}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <div
      {...rest}
      ref={ref}
      role="group"
      className={cx("rar rar-thumbs", className)}
      data-animation={animation}
      data-disabled={disabled || undefined}
      data-readonly={readOnly || undefined}
      style={{ "--rar-size": toCssLength(size), ...style } as React.CSSProperties}
    >
      {renderButton("up")}
      {renderButton("down")}
      {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
    </div>
  );
});


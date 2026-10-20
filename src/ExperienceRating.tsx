import * as React from "react";
import { Rating, type RatingProps } from "./Rating";
import { cx, normalizeMax, toCssLength } from "./utils";

/** 0 = no rating yet, 1 = worst … 5 = best. */
export type MascotMood = 0 | 1 | 2 | 3 | 4 | 5;

export interface ExperienceMascotProps extends React.SVGProps<SVGSVGElement> {
  /** 0 = waiting for a rating, 1 = very unhappy … 5 = delighted. @default 0 */
  mood?: MascotMood;
  /** Accessible title. The mascot is decorative (aria-hidden) unless a title is given. */
  title?: string;
}

/** Maps a value on any scale to one of the mascot's five moods (0 when there is no value). */
export function moodForValue(value: number, max = 5): MascotMood {
  if (!(value > 0)) return 0;
  return Math.min(5, Math.max(1, Math.ceil((value / normalizeMax(max)) * 5 - 1e-9))) as MascotMood;
}

const INK = "var(--rar-xp-ink, #1d1d1f)";

function Face({ mood }: { mood: MascotMood }) {
  const happy = mood >= 4;
  return (
    <g className="rar-xp-face" fill={INK} stroke={INK} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      {happy ? (
        <path d="M46 52q4-6 8 0M66 52q4-6 8 0" fill="none" />
      ) : (
        <g className="rar-xp-eyes" stroke="none">
          <ellipse cx="51" cy={mood === 1 ? 52 : 51} rx="2.6" ry={mood === 1 ? 2.8 : 3.6} />
          <ellipse cx="69" cy={mood === 1 ? 52 : 51} rx="2.6" ry={mood === 1 ? 2.8 : 3.6} />
        </g>
      )}
      {mood === 1 ? <path d="M44 46l9-3M76 46l-9-3" fill="none" /> : null}
      {mood === 0 ? <path d="M54 66q6 3 12 0" fill="none" /> : null}
      {mood === 1 ? <path d="M50 70q10-8 20 0" fill="none" /> : null}
      {mood === 2 ? <path d="M51 67h18" fill="none" /> : null}
      {mood === 3 ? <path d="M50 64q10 9 20 0" fill="none" /> : null}
      {happy ? <path d="M47 61h26q-1 14-13 14t-13-14z" /> : null}
      {mood === 5 ? <path d="M53 70.5q7-4.5 14 0q-3 4.5-7 4.5t-7-4.5z" fill="#ff7a8a" stroke="none" /> : null}
      {mood >= 3 ? (
        <g className="rar-xp-cheeks" fill="var(--rar-xp-cheek, #fff)" stroke="none" opacity="0.85">
          <ellipse cx="41" cy="61" rx="4" ry="2.6" />
          <ellipse cx="79" cy="61" rx="4" ry="2.6" />
        </g>
      ) : null}
      {mood === 1 ? (
        <path className="rar-xp-sweat" d="M83 40q4 6 0 8q-4-2 0-8z" fill="#7cc4f2" stroke="none" />
      ) : null}
    </g>
  );
}

function Limb({ className, x, y, children }: { className: string; x: number; y: number; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={className}>{children}</g>
    </g>
  );
}

/**
 * An animated character whose pose and expression follow a rating: hand-on-head with steam
 * for the lowest score, a shrug in the middle, and a jump for joy at the top.
 */
export function ExperienceMascot({ mood = 0, title, className, ...props }: ExperienceMascotProps) {
  const glove = "var(--rar-xp-glove, #fff)";
  const arm = (
    <>
      <path d="M0 0q-3 14 0 27" fill="none" />
      <circle cx="0" cy="31" r="5.2" fill={glove} />
    </>
  );
  return (
    <svg
      viewBox="0 0 120 132"
      fill="none"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      className={cx("rar-xp-mascot", className)}
      data-mood={mood}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <ellipse className="rar-xp-shadow" cx="60" cy="124" rx="22" ry="3.6" fill="currentColor" opacity="0.12" />

      {mood === 1 ? (
        <g className="rar-xp-steam" fill={glove} stroke="currentColor" strokeWidth="1.6">
          <path d="M14 26a5 5 0 0 1 6-6a6 6 0 0 1 11 1a4.5 4.5 0 0 1 0 9h-15a4.5 4.5 0 0 1-2-4z" />
          <path d="M90 20a4 4 0 0 1 5-5a5 5 0 0 1 9 1a3.8 3.8 0 0 1 0 7.6h-12a3.8 3.8 0 0 1-2-3.6z" />
        </g>
      ) : null}
      {mood === 2 ? (
        <g className="rar-xp-dots" fill="currentColor" opacity="0.28">
          <circle cx="8" cy="96" r="3" />
          <circle cx="17" cy="96" r="3" />
          <circle cx="103" cy="96" r="3" />
          <circle cx="112" cy="96" r="3" />
        </g>
      ) : null}
      {mood >= 4 ? (
        <g className="rar-xp-rays" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.5">
          <path d="M28 18l5 5M44 8l2 7M60 4v7M76 8l-2 7M92 18l-5 5M4 92h14M8 100h10M102 96h14" />
        </g>
      ) : null}
      {mood === 5 ? (
        <g className="rar-xp-sparkles" fill="var(--rar-active-color, #f5a524)">
          <path d="M14 46l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" />
          <path d="M106 50l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z" />
          <path d="M98 108l1.3 3.2 3.2 1.3-3.2 1.3-1.3 3.2-1.3-3.2-3.2-1.3 3.2-1.3z" />
        </g>
      ) : null}

      <g className="rar-xp-figure">
        <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <Limb className="rar-xp-leg rar-xp-leg--l" x={52} y={82}>
            <path d="M0 0v26" />
            <rect x="-8" y="25" width="12" height="7" rx="3.5" fill={glove} />
          </Limb>
          <Limb className="rar-xp-leg rar-xp-leg--r" x={68} y={82}>
            <path d="M0 0v26" />
            <rect x="-4" y="25" width="12" height="7" rx="3.5" fill={glove} />
          </Limb>
          <Limb className="rar-xp-arm rar-xp-arm--l" x={35} y={62}>
            {arm}
          </Limb>
          <Limb className="rar-xp-arm rar-xp-arm--r" x={85} y={62}>
            {arm}
          </Limb>
          <circle className="rar-xp-head" cx="60" cy="56" r="28" fill="var(--rar-xp-skin, #f5c443)" />
        </g>
        {/* Keyed so each new expression pops in. */}
        <Face key={mood} mood={mood} />
      </g>
    </svg>
  );
}

const DEFAULT_LABELS = ["Terrible", "Bad", "Meh", "Good", "Excellent"];

const CloseIcon = () => (
  <svg viewBox="0 0 20 20" width="100%" height="100%" aria-hidden="true" focusable="false">
    <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

export interface ExperienceRatingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue" | "title" | "color"> {
  value?: number;
  defaultValue?: number;
  /** Called on commit; receives 0 when cleared. */
  onChange?: (value: number) => void;
  /** Live preview value while hovering or scrubbing (null when the preview ends). */
  onHoverChange?: (value: number | null) => void;
  /** @default 5 */
  max?: number;
  /** @default 1 */
  precision?: number;
  /** Heading of the card. @default "Rate your experience" */
  title?: React.ReactNode;
  /** One word per whole value, shown next to the title and read by screen readers. */
  labels?: readonly string[];
  /** Show the current label in brackets after the title. @default true */
  showMoodLabel?: boolean;
  /** Renders a close button that calls this. */
  onClose?: () => void;
  /** Accessible name of the close button. @default "Close" */
  closeLabel?: string;
  /** Show the animated character. @default true */
  mascot?: boolean;
  /** Card chrome (background, border, shadow) or none. @default "card" */
  variant?: "card" | "plain";
  /** Overall scale: a preset, or a star size in pixels / any CSS length. @default "md" */
  size?: "sm" | "md" | "lg" | number | string;
  readOnly?: boolean;
  disabled?: boolean;
  /** Form field name. A hidden input carrying the value is rendered when set. */
  name?: string;
  required?: boolean;
  animation?: RatingProps["animation"];
  /** @default "max" */
  celebrate?: RatingProps["celebrate"];
  /** Any other prop for the inner `Rating` (theme, color, icon, tooltip…). */
  ratingProps?: Omit<
    RatingProps,
    "value" | "defaultValue" | "onChange" | "onHoverChange" | "max" | "precision" | "labels" | "size"
  >;
}

const CARD_SIZES = ["sm", "md", "lg"];

export const ExperienceRating = /* @__PURE__ */ React.forwardRef<HTMLDivElement, ExperienceRatingProps>(
  function ExperienceRating(
    {
      value: valueProp,
      defaultValue,
      onChange,
      onHoverChange,
      max = 5,
      precision,
      title = "Rate your experience",
      labels = DEFAULT_LABELS,
      showMoodLabel = true,
      onClose,
      closeLabel = "Close",
      mascot = true,
      variant = "card",
      size = "md",
      readOnly,
      disabled,
      name,
      required,
      animation,
      celebrate = "max",
      ratingProps,
      className,
      style,
      children,
      ...rest
    },
    ref,
  ) {
    // Uncontrolled ratings keep their own value; mirror it here so the mascot can follow.
    const [committed, setCommitted] = React.useState(defaultValue ?? 0);
    const [hover, setHover] = React.useState<number | null>(null);
    const value = valueProp ?? committed;
    const shown = hover ?? value;
    const mood = moodForValue(shown, max);
    const moodLabel = shown > 0 ? labels[Math.ceil(shown) - 1] : undefined;
    const titleId = `${React.useId()}-title`;

    const preset = CARD_SIZES.includes(String(size)) ? String(size) : undefined;
    const starSize = preset ? "var(--rar-xp-star)" : toCssLength(size);

    return (
      <div
        {...rest}
        ref={ref}
        className={cx("rar-xp", className)}
        data-variant={variant}
        data-size={preset}
        data-mood={mood}
        data-disabled={disabled || undefined}
        style={{ ...(preset ? null : { "--rar-xp-star": starSize }), ...style } as React.CSSProperties}
      >
        <div className="rar-xp-head">
          <span id={titleId} className="rar-xp-title">
            {title}
            {showMoodLabel && moodLabel ? (
              <span key={moodLabel} className="rar-xp-mood" aria-hidden="true">
                ({moodLabel})
              </span>
            ) : null}
          </span>
          {onClose ? (
            <button type="button" className="rar-xp-close" aria-label={closeLabel} onClick={onClose}>
              <CloseIcon />
            </button>
          ) : null}
        </div>
        <div className="rar-xp-body">
          {mascot ? <ExperienceMascot mood={mood} /> : null}
          <Rating
            aria-labelledby={title != null && title !== false ? titleId : undefined}
            emptyStyle="outline"
            animation={animation}
            celebrate={celebrate}
            readOnly={readOnly}
            disabled={disabled}
            name={name}
            required={required}
            {...ratingProps}
            value={valueProp}
            defaultValue={defaultValue}
            max={max}
            precision={precision}
            labels={labels}
            size={starSize}
            onChange={(next) => {
              setCommitted(next);
              onChange?.(next);
            }}
            onHoverChange={(next) => {
              setHover(next);
              onHoverChange?.(next);
            }}
            className={cx("rar-xp-stars", ratingProps?.className)}
          />
        </div>
        {children}
      </div>
    );
  },
);

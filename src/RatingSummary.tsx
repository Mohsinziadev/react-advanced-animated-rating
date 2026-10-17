import * as React from "react";
import { StarIcon } from "./icons";
import { Rating, type RatingColor, type RatingTheme } from "./Rating";
import { cx, normalizeMax } from "./utils";

/** Counts per score: an object keyed by score (`{ 5: 120, 4: 30 }`) or an array where index 0 is score 1. */
export type RatingDistribution = Readonly<Record<number, number>> | readonly number[];

export interface RatingStats {
  /** Weighted average (0 when there are no ratings), rounded to 2 decimals. */
  average: number;
  total: number;
  /** counts[0] is the number of 1-score ratings. */
  counts: number[];
  /** Whole-number percentages that always add up to 100 (or all 0). */
  percentages: number[];
}

/** Computes average, totals and percentages for a rating distribution. */
export function computeRatingStats(distribution: RatingDistribution, max = 5): RatingStats {
  const size = normalizeMax(max);
  const counts = Array.from({ length: size }, (_, i) => {
    const raw = Array.isArray(distribution)
      ? (distribution as readonly number[])[i]
      : (distribution as Record<number, number>)[i + 1];
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  });
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return { average: 0, total: 0, counts, percentages: counts.map(() => 0) };

  const sum = counts.reduce((acc, count, i) => acc + count * (i + 1), 0);
  const average = Math.round((sum / total) * 100) / 100;

  // Largest-remainder rounding so the displayed percentages total exactly 100.
  const exact = counts.map((c) => (c / total) * 100);
  const percentages = exact.map(Math.floor);
  let remaining = 100 - percentages.reduce((a, b) => a + b, 0);
  const order = exact.map((v, i) => ({ i, r: v - Math.floor(v) })).sort((a, b) => b.r - a.r);
  for (let k = 0; remaining > 0 && k < order.length; k++, remaining--) percentages[order[k].i] += 1;

  return { average, total, counts, percentages };
}

export interface RatingSummaryProps extends Omit<React.HTMLAttributes<HTMLElement>, "onSelect" | "color" | "title"> {
  distribution: RatingDistribution;
  max?: number;
  /** Override the computed average (e.g. a server-side Bayesian average). */
  average?: number;
  /** Override the computed total. */
  total?: number;
  /** Heading shown above the summary. */
  title?: React.ReactNode;
  /** Makes rows interactive filters. Called with the score, or null when the active filter is pressed again. */
  onSelect?: (score: number | null) => void;
  /** The currently selected filter score. */
  selected?: number | null;
  color?: RatingColor;
  theme?: RatingTheme;
  /** Hide the bars and show only the score block. */
  compact?: boolean;
  /** Locale for number formatting. Defaults to the user's locale. */
  locale?: string;
  /** Text for the total line. @default (n) => `${n} reviews` */
  formatTotal?: (total: number, formatted: string) => React.ReactNode;
  /** Accessible description for each row. */
  getRowLabel?: (score: number, count: number, percent: number) => string;
}

const defaultRowLabel = (score: number, count: number, percent: number) =>
  `${score} ${score === 1 ? "star" : "stars"}: ${count} ${count === 1 ? "review" : "reviews"}, ${percent}%`;

export const RatingSummary = /* @__PURE__ */ React.forwardRef<HTMLElement, RatingSummaryProps>(function RatingSummary(
  {
    distribution,
    max = 5,
    average: averageProp,
    total: totalProp,
    title,
    onSelect,
    selected = null,
    color,
    theme = "gold",
    compact = false,
    locale,
    formatTotal = (n, formatted) => `${formatted} ${n === 1 ? "review" : "reviews"}`,
    getRowLabel = defaultRowLabel,
    className,
    style,
    ...rest
  },
  ref,
) {
  const stats = React.useMemo(() => computeRatingStats(distribution, max), [distribution, max]);
  const average = averageProp ?? stats.average;
  const total = totalProp ?? stats.total;
  const nf = React.useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const avgFormat = React.useMemo(
    () => new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
    [locale],
  );
  const scores = Array.from({ length: stats.counts.length }, (_, i) => stats.counts.length - i);

  return (
    <section
      {...rest}
      ref={ref}
      className={cx("rar-summary", className)}
      data-theme={theme}
      style={typeof color === "string" ? ({ "--rar-active-color": color, ...style } as React.CSSProperties) : style}
    >
      {title ? <div className="rar-summary-title">{title}</div> : null}
      <div className="rar-summary-score">
        <span className="rar-summary-average" aria-hidden="true">
          {avgFormat.format(average)}
        </span>
        <div className="rar-summary-meta">
          <Rating readOnly value={average} max={stats.counts.length} size="sm" color={color} theme={theme} />
          <span className="rar-summary-total">{formatTotal(total, nf.format(total))}</span>
        </div>
      </div>
      {compact ? null : (
        <ul className="rar-summary-bars">
          {scores.map((score) => {
            const count = stats.counts[score - 1];
            const percent = stats.percentages[score - 1];
            const isSelected = selected === score;
            const content = (
              <>
                <span className="rar-summary-score-label" aria-hidden="true">
                  {score}
                  <StarIcon className="rar-summary-star" />
                </span>
                <span className="rar-summary-track" aria-hidden="true">
                  <span className="rar-summary-fill" style={{ "--rar-pct": percent / 100 } as React.CSSProperties} />
                </span>
                <span className="rar-summary-percent" aria-hidden="true">
                  {percent}%
                </span>
                <span className="rar-sr-only">{getRowLabel(score, count, percent)}</span>
              </>
            );
            return (
              <li key={score} className="rar-summary-row" data-selected={isSelected || undefined}>
                {onSelect ? (
                  <button
                    type="button"
                    className="rar-summary-button"
                    aria-pressed={isSelected}
                    disabled={count === 0 && !isSelected}
                    onClick={() => onSelect(isSelected ? null : score)}
                  >
                    {content}
                  </button>
                ) : (
                  <div className="rar-summary-button">{content}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
});


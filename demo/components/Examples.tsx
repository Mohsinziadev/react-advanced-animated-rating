import * as React from "react";
import {
  Rating,
  RatingSummary,
  ThumbsRating,
  computeRatingStats,
  useRating,
  type ThumbsValue,
} from "react-advanced-rating";
import { CodeBlock } from "./ui";

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

function Example({
  title,
  tag,
  children,
  code,
  wide,
}: {
  title: string;
  tag: string;
  children: React.ReactNode;
  code: string;
  wide?: boolean;
}) {
  const [showCode, setShowCode] = React.useState(false);
  const id = React.useId();
  return (
    <article className={`example ${wide ? "example-wide" : ""}`} aria-labelledby={`${id}-t`}>
      <header className="example-head">
        <div>
          <span className="example-tag">{tag}</span>
          <h3 id={`${id}-t`}>{title}</h3>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-expanded={showCode}
          aria-controls={`${id}-code`}
          onClick={() => setShowCode((s) => !s)}
        >
          {showCode ? "Hide code" : "View code"}
        </button>
      </header>
      <div className="example-body">{children}</div>
      <div id={`${id}-code`} className="example-code" hidden={!showCode}>
        {showCode ? <CodeBlock code={code} /> : null}
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Product card                                                      */
/* ------------------------------------------------------------------ */

function ProductCard() {
  return (
    <div className="product">
      <div className="product-art" aria-hidden="true">
        <span className="product-blob" />
      </div>
      <div className="product-info">
        <p className="product-kicker">Sample product</p>
        <p className="product-name">Trail Daypack 22L</p>
        <div className="product-rating">
          <Rating readOnly value={4.6} size="sm" aria-label="Customer rating" />
          <span className="product-score">4.6</span>
          <span className="product-count">(1,284)</span>
        </div>
        <p className="product-price">$89.00</p>
      </div>
    </div>
  );
}

const productCode = `<Rating readOnly value={4.6} size="sm" aria-label="Customer rating" />
{/* Read-only ratings render exact fractions (4.6 → 60% of the 5th star)
    and are exposed to screen readers as "Customer rating, Rated 4.6 out of 5". */}`;

/* ------------------------------------------------------------------ */
/* 2. Review form (validation + native form submission)                */
/* ------------------------------------------------------------------ */

function ReviewForm() {
  const [submitted, setSubmitted] = React.useState<{ score: string; text: string } | null>(null);
  if (submitted) {
    return (
      <div className="form-success" role="status">
        <Rating readOnly value={Number(submitted.score)} size="sm" />
        <p>
          <b>Thanks for your review!</b> The form submitted <code>score={submitted.score}</code>
          {submitted.text ? " with your comment." : "."}
        </p>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSubmitted(null)}>
          Write another
        </button>
      </div>
    );
  }
  return (
    <form
      className="review-form"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        setSubmitted({ score: String(data.get("score")), text: String(data.get("review") ?? "") });
      }}
    >
      <Rating
        name="score"
        required
        label="Overall rating"
        labels={["Terrible", "Bad", "Okay", "Good", "Excellent"]}
        showLabel
        size="lg"
        helperText="Required — pick 1 to 5 stars"
        requiredMessage="Please choose a rating before submitting."
      />
      <label className="textarea-field">
        <span className="field-label">Your review (optional)</span>
        <textarea name="review" rows={3} placeholder="What stood out?" />
      </label>
      <div className="form-actions">
        <button type="reset" className="btn btn-ghost">
          Reset
        </button>
        <button type="submit" className="btn btn-primary">
          Submit review
        </button>
      </div>
    </form>
  );
}

const formCode = `<form onSubmit={handleSubmit}>
  <Rating
    name="score"            // submitted with the form
    required                // blocks submit, focuses the control, shows a message
    label="Overall rating"
    labels={["Terrible", "Bad", "Okay", "Good", "Excellent"]}
    showLabel
    helperText="Required — pick 1 to 5 stars"
    requiredMessage="Please choose a rating before submitting."
  />
  <button type="reset">Reset</button>   {/* uncontrolled ratings reset too */}
  <button type="submit">Submit review</button>
</form>`;

/* ------------------------------------------------------------------ */
/* 3. Smiley feedback                                                  */
/* ------------------------------------------------------------------ */

const MOODS = ["Very unhappy", "Unhappy", "Neutral", "Happy", "Delighted"];

function SmileyFeedback() {
  const [value, setValue] = React.useState(0);
  return (
    <div className="feedback">
      <p className="feedback-q" id="checkout-q">
        How was your checkout experience?
      </p>
      <Rating
        icon="smiley"
        size="xl"
        value={value}
        onChange={setValue}
        labels={MOODS}
        tooltip
        aria-labelledby="checkout-q"
        animation="playful"
      />
      <p className="feedback-note" data-visible={value > 0 || undefined} aria-live="polite">
        {value > 0 ? (value >= 4 ? "Glad to hear it — thanks!" : "Thanks. We'll use this to improve.") : " "}
      </p>
    </div>
  );
}

const smileyCode = `<Rating
  icon="smiley"          // single-highlight + red→green colour scale by default
  size="xl"
  value={value}
  onChange={setValue}
  labels={["Very unhappy", "Unhappy", "Neutral", "Happy", "Delighted"]}
  tooltip
  animation="playful"    // celebrates the top score
/>`;

/* ------------------------------------------------------------------ */
/* 4. Thumbs                                                           */
/* ------------------------------------------------------------------ */

function HelpfulWidget() {
  const [value, setValue] = React.useState<ThumbsValue>(null);
  const base = { up: 128, down: 9 };
  return (
    <div className="helpful">
      <p id="helpful-q" className="feedback-q">
        Was this article helpful?
      </p>
      <ThumbsRating
        aria-labelledby="helpful-q"
        value={value}
        onChange={setValue}
        counts={{ up: base.up + (value === "up" ? 1 : 0), down: base.down + (value === "down" ? 1 : 0) }}
        showLabels
        labels={{ up: "Yes", down: "No" }}
      />
    </div>
  );
}

const thumbsCode = `<ThumbsRating
  aria-label="Was this article helpful?"
  value={value}                  // "up" | "down" | null
  onChange={setValue}            // pressing the active thumb clears it
  counts={{ up: 129, down: 9 }}
  showLabels
  labels={{ up: "Yes", down: "No" }}
/>`;

/* ------------------------------------------------------------------ */
/* 5. Survey scale 1–10                                                */
/* ------------------------------------------------------------------ */

function SurveyScale() {
  const [value, setValue] = React.useState(0);
  return (
    <div className="survey">
      <p id="survey-q" className="feedback-q">
        How likely are you to recommend us to a friend?
      </p>
      <Rating
        icon="number"
        max={10}
        highlight="single"
        value={value}
        onChange={setValue}
        color={(v, max) => (v <= max * 0.6 ? "#e5484d" : v <= max * 0.8 ? "#f5b400" : "#30a46c")}
        aria-labelledby="survey-q"
        getLabelText={(v, { max }) => (v ? `${v} of ${max}` : "No answer")}
        animation="subtle"
        className="survey-scale"
      />
      <div className="survey-ends" aria-hidden="true">
        <span>Not likely</span>
        <span>Very likely</span>
      </div>
    </div>
  );
}

const surveyCode = `<Rating
  icon="number"
  max={10}
  highlight="single"
  value={value}
  onChange={setValue}
  color={(v, max) => (v <= max * 0.6 ? "#e5484d" : v <= max * 0.8 ? "#f5b400" : "#30a46c")}
  getLabelText={(v, { max }) => (v ? \`\${v} of \${max}\` : "No answer")}
  animation="subtle"
/>`;

/* ------------------------------------------------------------------ */
/* 6. Dashboard summary + filter                                       */
/* ------------------------------------------------------------------ */

const REVIEWS = [
  { id: 1, who: "Sam K.", score: 5, text: "Exactly as described. Fast delivery." },
  { id: 2, who: "Priya R.", score: 4, text: "Great quality, strap could be softer." },
  { id: 3, who: "Jonas W.", score: 5, text: "Third one I've bought. Love it." },
  { id: 4, who: "Lee M.", score: 2, text: "Zip broke after a month." },
  { id: 5, who: "Ana G.", score: 3, text: "Fine for the price." },
  { id: 6, who: "Omar T.", score: 5, text: "Fits a 16\" laptop with room to spare." },
  { id: 7, who: "Chen L.", score: 1, text: "Arrived damaged; refund was quick." },
  { id: 8, who: "Maya B.", score: 4, text: "Comfortable on long walks." },
];
const DISTRIBUTION = { 5: 812, 4: 301, 3: 96, 2: 41, 1: 34 };

function Dashboard() {
  const [filter, setFilter] = React.useState<number | null>(null);
  const stats = computeRatingStats(DISTRIBUTION);
  const shown = filter ? REVIEWS.filter((r) => r.score === filter) : REVIEWS;
  return (
    <div className="dashboard">
      <RatingSummary
        title="Customer reviews"
        distribution={DISTRIBUTION}
        onSelect={setFilter}
        selected={filter}
      />
      <div className="review-list">
        <div className="review-list-head">
          <span>
            {filter ? `${filter}-star reviews` : "All reviews"} · <b>{stats.total.toLocaleString()}</b> total
          </span>
          {filter ? (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilter(null)}>
              Clear filter
            </button>
          ) : null}
        </div>
        <ul aria-live="polite">
          {shown.map((r) => (
            <li key={r.id} className="review">
              <Rating readOnly value={r.score} size="xs" />
              <p>{r.text}</p>
              <span className="review-who">{r.who}</span>
            </li>
          ))}
          {shown.length === 0 ? <li className="review review-empty">No sample reviews for this score.</li> : null}
        </ul>
      </div>
    </div>
  );
}

const dashboardCode = `import { RatingSummary, computeRatingStats } from "react-advanced-rating";

const distribution = { 5: 812, 4: 301, 3: 96, 2: 41, 1: 34 };
const { average, total, percentages } = computeRatingStats(distribution); // 4.41, 1284, percentages sum to 100

<RatingSummary
  title="Customer reviews"
  distribution={distribution}
  onSelect={setFilter}   // rows become filter buttons (aria-pressed)
  selected={filter}
/>`;

/* ------------------------------------------------------------------ */
/* 7. RTL + i18n                                                       */
/* ------------------------------------------------------------------ */

function RtlExample() {
  const [value, setValue] = React.useState(3.5);
  const digits = new Intl.NumberFormat("ar-EG");
  return (
    <div dir="rtl" lang="ar" className="rtl-example">
      <Rating
        label="قيّم تجربتك"
        precision={0.5}
        value={value}
        onChange={setValue}
        theme="violet"
        showLabel={(v) => `${digits.format(v)} / ${digits.format(5)}`}
        getLabelText={(v, { max }) => `${digits.format(v)} من ${digits.format(max)}`}
        size="lg"
      />
    </div>
  );
}

const rtlCode = `<div dir="rtl" lang="ar">
  <Rating
    label="قيّم تجربتك"
    precision={0.5}               // fills from the right; ← increases
    showLabel={(v) => \`\${fmt(v)} / \${fmt(5)}\`}
    getLabelText={(v, { max }) => \`\${fmt(v)} من \${fmt(max)}\`}
  />
</div>`;

/* ------------------------------------------------------------------ */
/* 8. Custom icons                                                     */
/* ------------------------------------------------------------------ */

const Cup = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M4 8h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zm12 1.5h1.5a2.5 2.5 0 0 1 0 5H16v-1.8h1.5a.7.7 0 0 0 0-1.4H16zM3 20h14v1.5H3zM8 2.5c.9.9.9 2.1 0 3M11.5 2.5c.9.9.9 2.1 0 3" />
  </svg>
);

function CustomIcons() {
  return (
    <div className="custom-icons">
      <div className="custom-row">
        <span className="custom-label">heart · rose</span>
        <Rating icon="heart" theme="rose" defaultValue={4} />
      </div>
      <div className="custom-row">
        <span className="custom-label">emoji</span>
        <Rating icon="🔥" defaultValue={3} animation="playful" />
      </div>
      <div className="custom-row">
        <span className="custom-label">your SVG</span>
        <Rating icon={<Cup />} color="#a16207" defaultValue={2.5} precision={0.5} />
      </div>
      <div className="custom-row">
        <span className="custom-label">render fn</span>
        <Rating
          max={4}
          defaultValue={2}
          gap={4}
          icon={({ value, filled }) => <span className={`tier ${filled ? "tier-on" : ""}`}>{["S", "M", "L", "XL"][value - 1]}</span>}
          animation="subtle"
          getLabelText={(v) => (v ? `Size ${["S", "M", "L", "XL"][v - 1]}` : "No size")}
        />
      </div>
    </div>
  );
}

const customCode = `<Rating icon="heart" theme="rose" />
<Rating icon="🔥" animation="playful" />           // any emoji or text
<Rating icon={<CupIcon />} precision={0.5} />      // any SVG using currentColor
<Rating
  max={4}
  icon={({ value, filled }) => <Tier on={filled}>{SIZES[value - 1]}</Tier>}
  getLabelText={(v) => \`Size \${SIZES[v - 1]}\`}
/>`;

/* ------------------------------------------------------------------ */
/* 9. Headless                                                         */
/* ------------------------------------------------------------------ */

function SpiceMeter() {
  const rating = useRating({
    max: 4,
    defaultValue: 2,
    labels: ["Mild", "Medium", "Hot", "Extreme"],
  });
  return (
    <div className="spice">
      <div className="spice-head">
        <span id="spice-label">Spice level</span>
        <b>{rating.label ?? "None"}</b>
      </div>
      <div {...rating.getControlProps()} aria-labelledby="spice-label" className="spice-track">
        {rating.items.map((i) => {
          const s = rating.getItemState(i);
          return (
            <span
              key={i}
              {...rating.getItemProps(i)}
              className="spice-seg"
              data-on={s.isFilled || undefined}
              data-preview={s.isPreview || undefined}
              style={{ "--i": i } as React.CSSProperties}
            >
              🌶
            </span>
          );
        })}
      </div>
    </div>
  );
}

const headlessCode = `import { useRating } from "react-advanced-rating";

function SpiceMeter() {
  const rating = useRating({ max: 4, defaultValue: 2, labels: ["Mild", "Medium", "Hot", "Extreme"] });
  return (
    // role="slider", aria-*, pointer + keyboard handlers all come from the hook
    <div {...rating.getControlProps()} aria-label="Spice level" className="track">
      {rating.items.map((i) => (
        <span key={i} {...rating.getItemProps(i)} data-on={rating.getItemState(i).isFilled}>🌶</span>
      ))}
    </div>
  );
}`;

export function Examples() {
  return (
    <div className="examples">
      <Example tag="E-commerce" title="Product card" code={productCode}>
        <ProductCard />
      </Example>
      <Example tag="Forms" title="Review form with validation" code={formCode}>
        <ReviewForm />
      </Example>
      <Example tag="Feedback" title="Smiley satisfaction" code={smileyCode}>
        <SmileyFeedback />
      </Example>
      <Example tag="Docs & support" title="Was this helpful?" code={thumbsCode}>
        <HelpfulWidget />
      </Example>
      <Example tag="Surveys" title="1–10 likelihood scale" code={surveyCode} wide>
        <SurveyScale />
      </Example>
      <Example tag="Dashboards" title="Review summary with filters" code={dashboardCode} wide>
        <Dashboard />
      </Example>
      <Example tag="i18n" title="Right-to-left & localised" code={rtlCode}>
        <RtlExample />
      </Example>
      <Example tag="Customisation" title="Any icon you like" code={customCode}>
        <CustomIcons />
      </Example>
      <Example tag="Headless" title="Build your own with useRating" code={headlessCode} wide>
        <SpiceMeter />
      </Example>
    </div>
  );
}

import * as React from "react";
import { ExperienceMascot, ExperienceRating, type MascotMood } from "react-advanced-rating";
import { CodeBlock } from "./ui";

const MOODS: Array<{ mood: MascotMood; label: string }> = [
  { mood: 0, label: "Waiting" },
  { mood: 1, label: "Terrible" },
  { mood: 2, label: "Bad" },
  { mood: 3, label: "Meh" },
  { mood: 4, label: "Good" },
  { mood: 5, label: "Excellent" },
];

const CODE = `import { ExperienceRating } from "react-advanced-rating";
import "react-advanced-rating/styles.css";

<ExperienceRating
  value={value}
  onChange={setValue}          // the mascot follows hover and the committed value
  onClose={() => setOpen(false)}
  // title="Rate your experience"
  // labels={["Terrible", "Bad", "Meh", "Good", "Excellent"]}
  // size="sm" | "md" | "lg"
/>`;

const PROPS: Array<[string, string, string, string]> = [
  ["value / defaultValue / onChange", "number", "0", "Same as Rating: controlled or uncontrolled."],
  ["title", "ReactNode", '"Rate your experience"', "Card heading; also the stars' accessible name."],
  ["labels", "string[]", "Terrible … Excellent", "One word per value, shown in brackets after the title."],
  ["onClose / closeLabel", "() => void / string", '"Close"', "Renders a close button."],
  ["size", '"sm" | "md" | "lg" | number | CSS length', '"md"', "Scales stars, mascot and text together."],
  ["variant", '"card" | "plain"', '"card"', "With or without the card background and shadow."],
  ["mascot", "boolean", "true", "Show the animated character."],
  ["ratingProps", "RatingProps", "", "Anything else for the inner Rating: theme, color, tooltip…"],
];

function DemoCard({
  size,
  defaultValue,
  className,
}: {
  size: "sm" | "md" | "lg" | number;
  defaultValue: number;
  className: string;
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <div className={`xp-slot ${className}`}>
      {open ? (
        <ExperienceRating size={size} defaultValue={defaultValue} onClose={() => setOpen(false)} />
      ) : (
        <button type="button" className="btn btn-ghost btn-sm xp-reopen" onClick={() => setOpen(true)}>
          Show the card again
        </button>
      )}
    </div>
  );
}

export function Experience() {
  return (
    <div className="xp">
      <div className="xp-stage">
        <DemoCard size="sm" defaultValue={1} className="xp-side" />
        <DemoCard size={40} defaultValue={4} className="xp-main" />
        <DemoCard size="sm" defaultValue={2} className="xp-side" />
      </div>

      <ul className="xp-moods" aria-label="Mascot moods">
        {MOODS.map(({ mood, label }) => (
          <li key={mood}>
            <ExperienceMascot mood={mood} />
            <span>
              <code>{mood}</code> {label}
            </span>
          </li>
        ))}
      </ul>

      <div className="xp-docs">
        <CodeBlock code={CODE} title="Feedback.tsx" />
        <div className="table-wrap">
          <table className="props">
            <thead>
              <tr>
                <th scope="col">Prop</th>
                <th scope="col">Type</th>
                <th scope="col">Default</th>
                <th scope="col">Description</th>
              </tr>
            </thead>
            <tbody>
              {PROPS.map(([name, type, def, desc]) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>
                    <code className="type">{type}</code>
                  </td>
                  <td>{def ? <code>{def}</code> : <span className="muted">-</span>}</td>
                  <td>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

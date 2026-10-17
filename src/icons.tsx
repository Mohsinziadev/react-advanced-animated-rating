import * as React from "react";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Accessible title. Icons are decorative (aria-hidden) unless a title is given. */
  title?: string;
}

function createIcon(displayName: string, children: React.ReactNode, viewBox = "0 0 24 24") {
  const Icon = ({ title, ...props }: IconProps) => (
    <svg
      viewBox={viewBox}
      width="100%"
      height="100%"
      fill="currentColor"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const StarIcon = /* @__PURE__ */ createIcon(
  "StarIcon",
  <path d="M12 2.6c.4 0 .77.23.94.6l2.42 4.9 5.41.79c.86.12 1.2 1.18.58 1.79l-3.92 3.82.93 5.39c.15.85-.75 1.5-1.52 1.1L12 18.43l-4.84 2.55c-.77.4-1.67-.25-1.52-1.1l.93-5.39-3.92-3.82c-.62-.61-.28-1.67.58-1.79l5.41-.79 2.42-4.9c.17-.37.54-.6.94-.6z" />,
);

export const HeartIcon = /* @__PURE__ */ createIcon(
  "HeartIcon",
  <path d="M12 20.7c-.27 0-.53-.09-.75-.26C6.06 16.4 2.5 13.2 2.5 8.9 2.5 6 4.74 3.75 7.55 3.75c1.7 0 3.3.83 4.45 2.2 1.15-1.37 2.75-2.2 4.45-2.2 2.81 0 5.05 2.25 5.05 5.15 0 4.3-3.56 7.5-8.75 11.54-.22.17-.48.26-.75.26z" />,
);

export const CircleIcon = /* @__PURE__ */ createIcon("CircleIcon", <circle cx="12" cy="12" r="9" />);

export const BoltIcon = /* @__PURE__ */ createIcon(
  "BoltIcon",
  <path d="M13.6 2.3c.5-.6 1.45-.13 1.3.64L13.7 9.5h5.06c.72 0 1.1.85.62 1.39l-8.98 10.33c-.5.58-1.44.12-1.3-.63l1.2-6.59H5.24c-.72 0-1.1-.86-.61-1.4z" />,
);

export const ThumbUpIcon = /* @__PURE__ */ createIcon(
  "ThumbUpIcon",
  <path d="M7.5 10.2v10.3H4.25c-.69 0-1.25-.56-1.25-1.25v-7.8c0-.69.56-1.25 1.25-1.25zm2 10.3V9.86l3.62-6.4c.3-.53.9-.82 1.5-.7 1.17.22 1.93 1.37 1.66 2.53L15.6 9h4.15c1.6 0 2.78 1.5 2.4 3.06l-1.67 6.8a2.25 2.25 0 0 1-2.19 1.71z" />,
);

export const ThumbDownIcon = /* @__PURE__ */ createIcon(
  "ThumbDownIcon",
  <path d="M16.5 13.8V3.5h3.25c.69 0 1.25.56 1.25 1.25v7.8c0 .69-.56 1.25-1.25 1.25zm-2-10.3v10.64l-3.62 6.4c-.3.53-.9.82-1.5.7-1.17-.22-1.93-1.37-1.66-2.53L8.4 15H4.25c-1.6 0-2.78-1.5-2.4-3.06l1.67-6.8A2.25 2.25 0 0 1 5.71 3.5z" />,
);

/** Five moods from very dissatisfied (0) to very satisfied (4). */
const FACE_MOUTHS = [
  "M8 17c1.1-1.5 2.45-2.25 4-2.25S14.9 15.5 16 17",
  "M8.5 16.25c.95-.9 2.1-1.35 3.5-1.35s2.55.45 3.5 1.35",
  "M8.5 15.5h7",
  "M8.5 14.5c.95.95 2.1 1.4 3.5 1.4s2.55-.45 3.5-1.4",
  "M7.75 13.75h8.5c-.35 2.4-2.1 4-4.25 4s-3.9-1.6-4.25-4z",
];

export interface FaceIconProps extends IconProps {
  /** 0 = very dissatisfied … 4 = very satisfied */
  mood?: 0 | 1 | 2 | 3 | 4;
}

export const FaceIcon = ({ mood = 2, title, ...props }: FaceIconProps) => {
  const detail = "var(--rar-face-detail, #fff)";
  return (
    <svg
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      fill="currentColor"
      focusable="false"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="10" />
      {mood === 0 ? (
        <g stroke={detail} strokeWidth="1.5" strokeLinecap="round" fill="none">
          <path d="M7.25 8.6l2.5 1.1M16.75 8.6l-2.5 1.1" />
        </g>
      ) : null}
      <circle cx="9" cy="10.6" r="1.25" fill={detail} />
      <circle cx="15" cy="10.6" r="1.25" fill={detail} />
      <path
        d={FACE_MOUTHS[mood]}
        stroke={detail}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={mood === 4 ? detail : "none"}
      />
    </svg>
  );
};

/** Maps item index to one of the five moods, spreading them evenly for any max. */
export function moodFor(index: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (max <= 1) return 4;
  return Math.round((index / (max - 1)) * 4) as 0 | 1 | 2 | 3 | 4;
}

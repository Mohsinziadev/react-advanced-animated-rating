export { Rating } from "./Rating";
export type { RatingProps, RatingIcon, BuiltInIcon, IconRenderState, RatingTheme, RatingColor } from "./Rating";

export { useRating, defaultGetLabelText } from "./useRating";
export type {
  UseRatingOptions,
  UseRatingReturn,
  RatingItemState,
  RatingHighlight,
  LabelTextContext,
  CommitSource,
} from "./useRating";

export { ThumbsRating } from "./ThumbsRating";
export type { ThumbsRatingProps, ThumbsValue } from "./ThumbsRating";

export { RatingSummary, computeRatingStats } from "./RatingSummary";
export type { RatingSummaryProps, RatingDistribution, RatingStats } from "./RatingSummary";

export { ExperienceRating, ExperienceMascot, moodForValue } from "./ExperienceRating";
export type { ExperienceRatingProps, ExperienceMascotProps, MascotMood } from "./ExperienceRating";

export {
  StarIcon,
  HeartIcon,
  CircleIcon,
  BoltIcon,
  FaceIcon,
  ThumbUpIcon,
  ThumbDownIcon,
} from "./icons";
export type { IconProps, FaceIconProps } from "./icons";

export type { AnimationPreset } from "./motion";
export type { SizePreset } from "./utils";

// 2.x exported `Rating` as a named export only; a default export is added for convenience.
export { Rating as default } from "./Rating";

import { intervalToDuration } from "date-fns";

/** ms in human readable format */
export const formatTime = (ms: number) => {
  ms = Math.round(ms / 1000) * 1000;
  const {
    hours = 0,
    minutes = 0,
    seconds = 0,
  } = intervalToDuration({ start: 0, end: ms });
  return [`${hours}h`, `${minutes}m`, `${seconds}s`]
    .slice([hours, minutes, seconds].findIndex((x) => x > 0))
    .filter(Boolean)
    .join(" ");
};

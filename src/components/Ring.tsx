import type { ComponentProps } from "react";

type Props = {
  progress: number;
} & ComponentProps<"svg">;

export default function Ring({ progress, ...props }: Props) {
  return (
    <svg viewBox="-50 -50 100 100" fill="none" strokeWidth="20" {...props}>
      <circle r="50" className="stroke-gray-300" />
      <circle
        r="50"
        className="stroke-slate-700"
        pathLength="1"
        strokeDasharray={[progress, 1].join(" ")}
        transform="rotate(-90)"
      />
    </svg>
  );
}

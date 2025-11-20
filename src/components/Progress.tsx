import type { ComponentProps } from "react";

type Props = {
  progress: number;
} & ComponentProps<"svg">;

const width = 50;
const height = 10;

export default function Progress({ progress, ...props }: Props) {
  return (
    <svg viewBox={[0, 0, width, height].join(" ")} {...props}>
      <rect
        width={width}
        height={height}
        className="fill-gray-300"
        rx={height / 2}
      />
      <rect
        className="fill-indigo-500"
        width={progress * width}
        height={height}
        rx={height / 2}
      />
    </svg>
  );
}

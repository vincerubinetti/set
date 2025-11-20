import type { ComponentProps } from "react";
import clsx from "clsx";

type Props = {
  progress: number;
} & ComponentProps<"div">;

export default function Progress({ progress, className, ...props }: Props) {
  return (
    <div
      className={clsx("overflow-hidden rounded-full bg-slate-300", className)}
      {...props}
    >
      <div
        className="h-full bg-indigo-500"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

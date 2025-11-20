import type { ComponentProps, ReactNode } from "react";
import { clsx } from "clsx";

type Props = {
  label: ReactNode;
  value: ReactNode;
} & ComponentProps<"div">;

export default function Detail({ label, value, className, ...props }: Props) {
  return (
    <div
      className={clsx("flex items-center justify-center gap-2", className)}
      {...props}
    >
      <span className="text-slate-500">{label}</span>
      <span>{typeof value === "number" ? value.toLocaleString() : value}</span>
    </div>
  );
}

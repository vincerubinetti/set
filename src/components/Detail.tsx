import type { ComponentProps, ReactNode } from "react";

type Props = {
  label: ReactNode;
  value: ReactNode;
} & ComponentProps<"div">;

export default function Detail({ label, value, ...props }: Props) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-1 p-1 leading-none tabular-nums"
      {...props}
    >
      <span className="flex items-center gap-1 text-slate-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}

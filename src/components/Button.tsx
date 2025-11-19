import type { ComponentProps } from "react";

type Props = ComponentProps<"button">;

export default function Button(props: Props) {
  return (
    <button
      className="flex min-h-14 min-w-14 flex-col items-center justify-center gap-1 rounded-lg leading-none text-indigo-500 transition-all hover:bg-indigo-100"
      {...props}
    />
  );
}

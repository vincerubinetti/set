import type { ComponentProps } from "react";

type Props = ComponentProps<"button">;

export default function Button(props: Props) {
  return (
    <button
      className="flex flex-col items-center justify-center gap-1 rounded p-2 leading-none text-indigo-500 transition-all hover:bg-indigo-100"
      {...props}
    />
  );
}

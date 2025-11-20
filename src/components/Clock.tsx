import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type {
  ComponentPropsWithoutRef,
  Dispatch,
  Ref,
  SetStateAction,
} from "react";
import clsx from "clsx";
import { now } from "lodash";
import { useStorage } from "@/util/hooks";
import { formatTime } from "@/util/string";

export type ClockRef = {
  setTime: Dispatch<SetStateAction<number>>;
};

type Props = {
  ref: Ref<ClockRef>;
  won: boolean;
} & ComponentPropsWithoutRef<"span">;

export default function Clock({ ref, won, className, ...props }: Props) {
  /** current time */
  const [time, _setTime] = useStorage("time", 0);

  /** timestamp at last time set */
  const mark = useRef(now());

  /** set time wrapper */
  const setTime = useCallback(
    (value: number | ((prev: number) => number)) => {
      const newTime = typeof value === "function" ? value(time) : value;
      _setTime(newTime);
      mark.current = now();
    },
    [time, _setTime],
  );

  /** expose set time */
  useImperativeHandle(ref, () => ({ setTime }), [setTime]);

  useEffect(() => {
    if (won) return;
    /** tick clock one sec */
    const tick = () => {
      const time = now();
      /** loosely correct for drift */
      const delta = time - mark.current;
      setTime((prev) => prev + delta);
    };

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [won, setTime]);

  return (
    <span className={clsx("tabular-nums", className)} {...props}>
      {formatTime(time)}
    </span>
  );
}

import { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import type {
  ComponentPropsWithoutRef,
  Dispatch,
  Ref,
  SetStateAction,
} from "react";
import { useWindowsFocus } from "@reactuses/core";
import clsx from "clsx";
import { now } from "lodash";
import { useStorage } from "@/util/hooks";
import { formatTime } from "@/util/string";

export type ClockRef = {
  set: Dispatch<SetStateAction<number>>;
};

type Props = {
  ref: Ref<ClockRef>;
  won: boolean;
} & ComponentPropsWithoutRef<"span">;

export default function Clock({ ref, won, className, ...props }: Props) {
  /** current time */
  const [time, setTime] = useStorage("time", 0);

  /** timestamp at last time set */
  const mark = useRef(now());

  /** is window active */
  const active = useWindowsFocus();

  /** set time wrapper */
  const set = useCallback(
    (value: SetStateAction<number>) => {
      setTime(value);
      mark.current = now();
    },
    [setTime],
  );

  /** expose set time */
  useImperativeHandle(ref, () => ({ set }), [set]);

  useEffect(() => {
    if (won) return;
    /** tick clock one sec */
    const tick = () => {
      const time = now();
      /** loosely correct for drift */
      const delta = time - mark.current;
      if (active) setTime((prev) => prev + delta);
      mark.current = now();
    };

    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [active, won, setTime]);

  return (
    <span className={clsx("tabular-nums", className)} {...props}>
      {formatTime(time)}
    </span>
  );
}

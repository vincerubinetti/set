import { useEffect, useState } from "react";
import { useInterval } from "@reactuses/core";
import { now } from "lodash";

export const useStorage = <Type>(key: string, defaultValue: Type) => {
  const [value, setValue] = useState<Type>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
};

export const useNow = (enabled = true) => {
  const [time, setTime] = useState(0);
  useInterval(() => setTime(now()), enabled ? 50 : null);
  return time;
};

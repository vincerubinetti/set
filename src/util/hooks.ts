import { useEffect, useState } from "react";

/** simple useState with localStorage */
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

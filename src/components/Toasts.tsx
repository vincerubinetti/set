import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import { uniqueId } from "lodash";
import { motionProps } from "@/App";
import { sleep } from "@/util/misc";

const toastsAtom = atom<{ id: string; content: ReactNode }[]>([]);

export const toast = async (content: ReactNode) => {
  const id = uniqueId();
  getDefaultStore().set(toastsAtom, (prev) => [...prev, { id, content }]);
  await sleep(2000);
  getDefaultStore().set(toastsAtom, (prev) =>
    prev.filter((toast) => toast.id !== id),
  );
};

export default function Toasts() {
  const toasts = useAtomValue(toastsAtom);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col gap-2 p-2">
      <AnimatePresence mode="popLayout">
        {[...toasts].reverse().map(({ id, content }) => (
          <motion.div
            key={id}
            {...motionProps()}
            className="flex items-center justify-end gap-2 p-2"
          >
            {content}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { atom, getDefaultStore, useAtomValue } from "jotai";
import { uniqueId } from "lodash";
import { motionProps } from "@/App";
import { sleep } from "@/util/misc";

/** global toasts */
const toastAtom = atom<{ id: string; content: ReactNode }>();

/** create toast */
export const toast = async (content: ReactNode) => {
  const id = uniqueId();
  /** create */
  getDefaultStore().set(toastAtom, { id, content });
  await sleep(2000);
  /** delete */
  remove(id);
};

/** delete toast */
const remove = (id: string) =>
  getDefaultStore().set(toastAtom, (prev) =>
    prev?.id === id ? undefined : prev,
  );

export default function Toasts() {
  const toast = useAtomValue(toastAtom);

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center gap-2 p-2">
      <AnimatePresence mode="popLayout">
        {toast && (
          <motion.div
            key={toast.id}
            {...motionProps()}
            className="flex items-center gap-2 p-2"
          >
            {toast.content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

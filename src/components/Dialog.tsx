import type { ReactElement, ReactNode } from "react";
import { Dialog as _Dialog } from "@base-ui-components/react/dialog";

type Props = {
  trigger: ReactElement<Record<string, unknown>>;
  content: ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
};

export default function Dialog({ trigger, content, onOpen, onClose }: Props) {
  return (
    <_Dialog.Root onOpenChange={(open) => (open ? onOpen?.() : onClose?.())}>
      <_Dialog.Trigger render={trigger} />
      <_Dialog.Portal>
        <_Dialog.Backdrop className="fixed inset-0 z-10 bg-black/50" />
        <_Dialog.Popup
          initialFocus={false}
          className="pointer-events-none fixed inset-0 z-20 grid place-items-center p-10"
        >
          <div className="pointer-events-auto max-h-full min-h-0 max-w-full overflow-auto rounded bg-white">
            {content}
          </div>
        </_Dialog.Popup>
      </_Dialog.Portal>
    </_Dialog.Root>
  );
}

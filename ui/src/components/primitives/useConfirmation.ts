import { useCallback, useState } from "react";

export type ConfirmationRequest = {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
};

/**
 * One pending "are you sure?" question, answered in the page. Replaces
 * window.confirm, which VS Code webviews block (their iframe sandbox has no
 * allow-modals, so it returns false without showing anything).
 */
export function useConfirmation() {
  const [pending, setPending] = useState<ConfirmationRequest | null>(null);

  const ask = useCallback((request: ConfirmationRequest) => {
    setPending(request);
  }, []);

  const cancel = useCallback(() => setPending(null), []);

  const confirm = useCallback(() => {
    setPending(null);
    pending?.onConfirm();
  }, [pending]);

  return { pending, ask, cancel, confirm };
}

export type Confirmation = ReturnType<typeof useConfirmation>;

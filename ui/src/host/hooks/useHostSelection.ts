import { useEffect, type Dispatch, type SetStateAction } from "react";
import {
  appendToComposer,
  formatSelectionPrompt,
} from "../domain/format-selection-prompt";
import { getHostBridge } from "../host-bridge";

/**
 * "Doty: Ask about selection": the editor posts the selection and it is
 * appended to the composer. Also tells the host the webview is listening.
 */
export function useHostSelection(
  setInput: Dispatch<SetStateAction<string>>,
): void {
  useEffect(() => {
    const host = getHostBridge();
    const unsubscribe = host.onMessage((message) => {
      setInput((current) =>
        appendToComposer(current, formatSelectionPrompt(message)),
      );
    });
    host.notifyReady();
    return unsubscribe;
  }, [setInput]);
}

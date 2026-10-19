import { useEffect, type Dispatch, type SetStateAction } from "react";
import {
  appendToComposer,
  formatSelectionPrompt,
} from "../domain/format-selection-prompt";
import { getHostBridge } from "../host-bridge";

/**
 * "Doty: Ask about selection": the editor posts the selection and it is
 * appended to the composer. Also tells the host the webview is listening.
 * Other listeners (useHostCommands) live in child components, so their
 * effects subscribe before this one sends "ready".
 */
export function useHostSelection(
  setInput: Dispatch<SetStateAction<string>>,
): void {
  useEffect(() => {
    const host = getHostBridge();
    const unsubscribe = host.onMessage((message) => {
      if (message.type !== "insertSelection") return;
      setInput((current) =>
        appendToComposer(current, formatSelectionPrompt(message)),
      );
    });
    host.notifyReady();
    return unsubscribe;
  }, [setInput]);
}

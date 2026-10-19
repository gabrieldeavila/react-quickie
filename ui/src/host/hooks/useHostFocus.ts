import { useEffect } from "react";
import { getHostBridge } from "../host-bridge";

/**
 * Reports focus entering and leaving the webview, so the editor's ⌘/Ctrl+N
 * keybinding only applies while the chat has focus.
 */
export function useHostFocus(): void {
  useEffect(() => {
    const bridge = getHostBridge();
    const onFocus = () => bridge.setFocused(true);
    const onBlur = () => bridge.setFocused(false);

    bridge.setFocused(document.hasFocus());
    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);
}

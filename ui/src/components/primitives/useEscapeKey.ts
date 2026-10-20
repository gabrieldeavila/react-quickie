import { useEffect, useRef } from "react";

/**
 * Calls `onEscape` for an unhandled Escape anywhere on the page while
 * mounted, wherever focus is. preventDefault marks it as used, so the
 * page-wide "Escape stops the response" shortcut skips it.
 */
export function useEscapeKey(onEscape: () => void): void {
  const latest = useRef(onEscape);

  useEffect(() => {
    latest.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      event.preventDefault();
      latest.current();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
}

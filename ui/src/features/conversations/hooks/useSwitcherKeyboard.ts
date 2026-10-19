import { useCallback, type KeyboardEvent, type RefObject } from "react";
import {
  nextSwitcherFocus,
  SEARCH_POSITION,
} from "../domain/next-switcher-focus";

const SEARCH_SELECTOR = ".chat-conversation-switcher__search";
const ROW_SELECTOR = ".chat-conversation-item";
const ROW_OPEN_SELECTOR = ".chat-conversation-item__open";

function currentPosition(panel: HTMLElement, rows: HTMLElement[]): number {
  const active = document.activeElement;
  if (!active || active === panel.querySelector(SEARCH_SELECTOR))
    return SEARCH_POSITION;
  // Focus on a row's delete button counts as that row.
  const row = active.closest(ROW_SELECTOR);
  return rows.findIndex((candidate) => candidate === row);
}

/** Arrow keys, Home and End move focus between the search box and the conversation rows. */
export function useSwitcherKeyboard(
  panelRef: RefObject<HTMLDivElement | null>,
) {
  return useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const panel = panelRef.current;
      if (!panel) return;
      const rows = Array.from(panel.querySelectorAll<HTMLElement>(ROW_SELECTOR));
      const next = nextSwitcherFocus(
        event.key,
        currentPosition(panel, rows),
        rows.length,
      );
      if (next === null) return;

      event.preventDefault();
      const target =
        next === SEARCH_POSITION
          ? panel.querySelector<HTMLElement>(SEARCH_SELECTOR)
          : rows[next]?.querySelector<HTMLElement>(ROW_OPEN_SELECTOR);
      target?.focus();
    },
    [panelRef],
  );
}

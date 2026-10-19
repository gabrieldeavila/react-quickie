/** Focus position inside the conversation panel: the search box, or a row index. */
export const SEARCH_POSITION = -1;

/**
 * Where an arrow/Home/End key moves focus in the conversation panel, or null
 * when the key isn't for navigation. ArrowUp from the first row goes back to
 * the search box. Home/End only jump between rows, so they still move the
 * caret while typing in the search box.
 */
export function nextSwitcherFocus(
  key: string,
  current: number,
  rowCount: number,
): number | null {
  if (rowCount === 0) return null;
  const lastRow = rowCount - 1;

  switch (key) {
    case "ArrowDown":
      return Math.min(current + 1, lastRow);
    case "ArrowUp":
      return current === SEARCH_POSITION ? null : current - 1;
    case "Home":
      return current === SEARCH_POSITION ? null : 0;
    case "End":
      return current === SEARCH_POSITION ? null : lastRow;
    default:
      return null;
  }
}

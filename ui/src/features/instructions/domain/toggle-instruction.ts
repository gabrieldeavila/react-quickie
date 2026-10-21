/** Most instructions one request may carry (the API ignores the rest). */
export const MAX_SELECTED_INSTRUCTIONS = 8;

/** Adds or removes `id`; adding past the limit leaves the selection as it is. */
export function toggleInstruction(selected: string[], id: string): string[] {
  if (selected.includes(id)) return selected.filter((item) => item !== id);
  if (selected.length >= MAX_SELECTED_INSTRUCTIONS) return selected;
  return [...selected, id];
}

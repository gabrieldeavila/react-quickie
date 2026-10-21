export const SLASH_MENU_ID = "slash-command-menu";

/** DOM id of an option, for the textarea's aria-activedescendant. */
export function slashOptionId(key: string): string {
  return `slash-option-${key.replace(/[^A-Za-z0-9_-]/g, "-")}`;
}

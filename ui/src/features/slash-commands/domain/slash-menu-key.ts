export type SlashMenuAction = "next" | "previous" | "run" | "close";

type Keys = {
  key: string;
  shiftKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  /** Mid IME composition: Enter confirms the composed text, not the menu. */
  isComposing: boolean;
};

/** What a key does while the command menu is open; null leaves it to the textarea. */
export function slashMenuKey(keys: Keys): SlashMenuAction | null {
  if (keys.isComposing || keys.altKey || keys.ctrlKey || keys.metaKey) {
    return null;
  }
  switch (keys.key) {
    case "ArrowDown":
      return "next";
    case "ArrowUp":
      return "previous";
    case "Enter":
      return keys.shiftKey ? null : "run";
    case "Tab":
      return keys.shiftKey ? null : "run";
    case "Escape":
      return "close";
    default:
      return null;
  }
}

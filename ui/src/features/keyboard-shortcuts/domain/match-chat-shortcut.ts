export type ChatShortcut = "newChat" | "stopResponse";

export type ShortcutKeys = {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  /** Already handled, e.g. an Escape that closed a popover. */
  defaultPrevented: boolean;
  /** Mid IME composition: the keys belong to the text being typed. */
  isComposing: boolean;
};

export type ShortcutContext = {
  isMac: boolean;
  isResponding: boolean;
  /** VSCode binds ⌘/Ctrl+N itself (it gets every key the webview sees), so the page must not. */
  editorOwnsNewChat: boolean;
};

function hasNoModifiers(keys: ShortcutKeys): boolean {
  return !keys.metaKey && !keys.ctrlKey && !keys.altKey && !keys.shiftKey;
}

function isPrimaryModifierOnly(keys: ShortcutKeys, isMac: boolean): boolean {
  const primary = isMac ? keys.metaKey && !keys.ctrlKey : keys.ctrlKey && !keys.metaKey;
  return primary && !keys.altKey && !keys.shiftKey;
}

/** ⌘N (Ctrl+N off macOS) starts a new chat; Escape stops the response being generated. */
export function matchChatShortcut(
  keys: ShortcutKeys,
  context: ShortcutContext,
): ChatShortcut | null {
  if (keys.defaultPrevented || keys.isComposing) return null;

  if (keys.key === "Escape" && hasNoModifiers(keys))
    return context.isResponding ? "stopResponse" : null;

  if (
    keys.key.toLowerCase() === "n" &&
    isPrimaryModifierOnly(keys, context.isMac) &&
    !context.editorOwnsNewChat
  )
    return "newChat";

  return null;
}

/** True on Apple platforms, where ⌘ is the primary modifier. */
export function isMacPlatform(userAgent: string): boolean {
  return /Mac|iPhone|iPad|iPod/.test(userAgent);
}

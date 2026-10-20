const KEY_PREFIX = "doty:last-instructions:";

/** The selection new conversations in `root` start with. */
export function readLastInstructions(root: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem(KEY_PREFIX + root) ?? "[]",
    );
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function writeLastInstructions(root: string, ids: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_PREFIX + root, JSON.stringify(ids));
}

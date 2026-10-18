const LAST_USED_MODEL_KEY = "doty:last-used-model";

/** The model new conversations start with. */
export function readLastUsedModel(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LAST_USED_MODEL_KEY);
}

export function writeLastUsedModel(ref: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LAST_USED_MODEL_KEY, ref);
}

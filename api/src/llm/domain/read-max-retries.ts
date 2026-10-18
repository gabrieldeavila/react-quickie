/** The AI SDK's own default. */
export const DEFAULT_MAX_RETRIES = 2;
/** Each retry backs off exponentially, so more than this only makes the user wait. */
const MAX_ALLOWED_RETRIES = 10;

/** `DOTY_MAX_RETRIES` → retries per model call; `0` disables them. */
export function readMaxRetries(value: string | undefined): number {
  if (value === undefined || value.trim() === '') return DEFAULT_MAX_RETRIES;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0
    ? Math.min(parsed, MAX_ALLOWED_RETRIES)
    : DEFAULT_MAX_RETRIES;
}

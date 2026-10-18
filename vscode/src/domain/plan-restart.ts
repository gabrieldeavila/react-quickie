export const MAX_RESTART_ATTEMPTS = 5;
/** A process that stayed up this long counts as healthy again. */
export const STABLE_UPTIME_MS = 60_000;
const BASE_DELAY_MS = 1_000;
const MAX_DELAY_MS = 30_000;

export type RestartPlan = { attempt: number; delayMs: number };

/**
 * After an unexpected exit: when to restart (exponential backoff), or null
 * to give up after too many crashes in a row.
 */
export function planRestart(previousAttempts: number, uptimeMs: number): RestartPlan | null {
  const attempts = uptimeMs >= STABLE_UPTIME_MS ? 0 : previousAttempts;
  if (attempts >= MAX_RESTART_ATTEMPTS) return null;

  return {
    attempt: attempts + 1,
    delayMs: Math.min(BASE_DELAY_MS * 2 ** attempts, MAX_DELAY_MS),
  };
}

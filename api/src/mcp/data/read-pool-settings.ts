export type PoolSettings = {
  connectTimeoutMs: number;
  idleTimeoutMs: number;
  /** A failed server is tried again on the next request after this long. */
  retryAfterMs: number;
};

const DEFAULTS: PoolSettings = {
  connectTimeoutMs: 10_000,
  idleTimeoutMs: 10 * 60_000,
  retryAfterMs: 60_000,
};

function readMs(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function readPoolSettings(
  env: Record<string, string | undefined>,
): PoolSettings {
  return {
    connectTimeoutMs: readMs(
      env.DOTY_MCP_CONNECT_TIMEOUT_MS,
      DEFAULTS.connectTimeoutMs,
    ),
    idleTimeoutMs: readMs(env.DOTY_MCP_IDLE_TIMEOUT_MS, DEFAULTS.idleTimeoutMs),
    retryAfterMs: DEFAULTS.retryAfterMs,
  };
}

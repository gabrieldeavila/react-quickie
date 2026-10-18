const POLL_INTERVAL_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isHealthy(apiUrl: string, token: string): Promise<boolean> {
  try {
    const response = await fetch(`${apiUrl}/`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(2_000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/** Polls `GET /` until it answers, the timeout passes or `isAlive` says no. */
export async function waitForHealth(
  apiUrl: string,
  token: string,
  options: { timeoutMs: number; isAlive: () => boolean },
): Promise<boolean> {
  const deadline = Date.now() + options.timeoutMs;

  while (Date.now() < deadline && options.isAlive()) {
    if (await isHealthy(apiUrl, token)) return true;
    await delay(POLL_INTERVAL_MS);
  }
  return false;
}

export const OAUTH_CALLBACK_PATH = '/mcp/oauth/callback';

type Env = Record<string, string | undefined>;

function readPort(value: string | undefined): number | undefined {
  const port = Number(value?.trim());
  return Number.isInteger(port) && port > 0 && port < 65536 ? port : undefined;
}

/**
 * The port of the dedicated sign-in listener: `DOTY_OAUTH_CALLBACK_PORT`
 * when it differs from the API's own port (the VS Code API runs on a random
 * port, so providers that need an exact redirect URI get a fixed one).
 * Undefined → the API's own route receives the callback.
 */
export function resolveCallbackListenerPort(env: Env): number | undefined {
  if (env.DOTY_OAUTH_CALLBACK_URL?.trim()) return undefined;
  const port = readPort(env.DOTY_OAUTH_CALLBACK_PORT);
  return port !== undefined && port !== readPort(env.PORT ?? '3000')
    ? port
    : undefined;
}

/**
 * Where the provider sends the browser back after sign-in, on the loopback
 * address: the dedicated listener's port, else the API's. The
 * `DOTY_OAUTH_CALLBACK_URL` override wins (e.g. Docker with another port).
 */
export function resolveOAuthCallbackUrl(env: Env): string {
  const override = env.DOTY_OAUTH_CALLBACK_URL?.trim();
  if (override) return override;
  const port = resolveCallbackListenerPort(env) ?? env.PORT ?? 3000;
  return `http://127.0.0.1:${port}${OAUTH_CALLBACK_PATH}`;
}

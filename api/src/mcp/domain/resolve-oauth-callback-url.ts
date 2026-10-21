export const OAUTH_CALLBACK_PATH = '/mcp/oauth/callback';

/**
 * Where the provider sends the browser back after sign-in: this API on the
 * loopback address. `DOTY_OAUTH_CALLBACK_URL` overrides it (e.g. Docker with
 * a different published port).
 */
export function resolveOAuthCallbackUrl(
  env: Record<string, string | undefined>,
): string {
  const override = env.DOTY_OAUTH_CALLBACK_URL?.trim();
  if (override) return override;
  return `http://127.0.0.1:${env.PORT ?? 3000}${OAUTH_CALLBACK_PATH}`;
}

/** Parameters the OAuth flow itself sets; config can't change them. */
const RESERVED = new Set([
  'client_id',
  'redirect_uri',
  'response_type',
  'state',
  'code_challenge',
  'code_challenge_method',
  'resource',
  'scope',
]);

/**
 * Adds a server's extra sign-in parameters (`oauth.authorizationParams`) to
 * the authorization URL, e.g. `access_type=offline` so Google issues a
 * refresh token. The flow's own parameters are never replaced.
 */
export function applyAuthorizationParams(
  url: URL,
  params: Record<string, string> | undefined,
): URL {
  if (!params) return url;
  const next = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (!RESERVED.has(key)) next.searchParams.set(key, value);
  }
  return next;
}

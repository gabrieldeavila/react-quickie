export type CorsOrigin = string | RegExp;

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://localhost:4173'];
const VSCODE_WEBVIEW_ORIGIN = /^vscode-webview:\/\/[a-z0-9-]+$/i;

function parseOriginList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * `DOTY_ALLOWED_ORIGINS` (comma-separated) replaces the dev defaults;
 * `UI_URL` is always added. The VSCode webview origin is only allowed when
 * `DOTY_AUTH_TOKEN` is set, so the token still guards every request.
 */
export function resolveCorsOrigins(
  env: Record<string, string | undefined>,
): CorsOrigin[] {
  const configured = parseOriginList(env.DOTY_ALLOWED_ORIGINS);
  const origins: CorsOrigin[] = configured.length
    ? configured
    : [...DEFAULT_ORIGINS];

  const uiUrl = env.UI_URL?.trim();
  if (uiUrl && !origins.includes(uiUrl)) origins.push(uiUrl);

  if (env.DOTY_AUTH_TOKEN) origins.push(VSCODE_WEBVIEW_ORIGIN);

  return origins;
}

import { buildCsp } from './build-csp';

export type WebviewConfig = {
  apiUrl: string;
  token: string;
  roots: string[];
  host: 'vscode';
};

export type WebviewHtmlInput = {
  /** `ui/dist/index.html`, built with `base: './'`. */
  indexHtml: string;
  /** Webview URI of `ui/dist/`, used as `<base>` for the relative asset URLs. */
  baseUri: string;
  cspSource: string;
  nonce: string;
  config: WebviewConfig;
};

/** JSON safe to inline in a `<script>` (no `</script>` breakout). */
function toInlineJson(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/[\u2028\u2029]/g, (char) => (char === '\u2028' ? '\\u2028' : '\\u2029'));
}

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

/**
 * Turns the built UI page into the webview page: `<base>` so assets load
 * from the extension, a CSP, the injected runtime config, and a nonce on
 * every script.
 */
export function buildWebviewHtml(input: WebviewHtmlInput): string {
  const { nonce, config } = input;
  const baseHref = input.baseUri.endsWith('/') ? input.baseUri : `${input.baseUri}/`;
  const csp = buildCsp({ cspSource: input.cspSource, nonce, apiUrl: config.apiUrl });

  const head = [
    `<base href="${escapeAttribute(baseHref)}">`,
    `<meta http-equiv="Content-Security-Policy" content="${escapeAttribute(csp)}">`,
    `<script nonce="${nonce}">window.__DOTY_CONFIG__ = ${toInlineJson(config)};</script>`,
  ].join('\n    ');

  return input.indexHtml
    .replace(/<head>/i, `<head>\n    ${head}`)
    .replace(/<script(?![^>]*\bnonce=)/gi, `<script nonce="${nonce}"`);
}

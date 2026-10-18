export type CspInput = {
  /** `webview.cspSource`: the origin of the extension's local resources. */
  cspSource: string;
  nonce: string;
  apiUrl: string;
};

/** Only local UI assets, our nonce'd scripts, and calls to the local API. */
export function buildCsp({ cspSource, nonce, apiUrl }: CspInput): string {
  return [
    "default-src 'none'",
    `img-src ${cspSource} data: blob:`,
    `font-src ${cspSource}`,
    `style-src ${cspSource} 'unsafe-inline'`,
    `script-src 'nonce-${nonce}'`,
    `connect-src ${apiUrl}`,
  ].join('; ');
}

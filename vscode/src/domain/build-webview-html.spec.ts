import { describe, expect, it } from 'vitest';
import { buildCsp } from './build-csp';
import { buildWebviewHtml, type WebviewHtmlInput } from './build-webview-html';

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <script type="module" crossorigin src="./assets/index-abc.js"></script>
    <link rel="stylesheet" href="./assets/index-abc.css">
  </head>
  <body><div id="root"></div></body>
</html>`;

const input: WebviewHtmlInput = {
  indexHtml,
  baseUri: 'https://file+.vscode-resource.vscode-cdn.net/ext/dist/ui',
  cspSource: 'https://*.vscode-cdn.net',
  nonce: 'n0nce',
  config: {
    apiUrl: 'http://127.0.0.1:51234',
    token: 'tok',
    roots: ['/work/a'],
    host: 'vscode',
  },
};

describe('buildWebviewHtml', () => {
  const html = buildWebviewHtml(input);

  it('adds a <base> pointing at the UI folder', () => {
    expect(html).toContain(
      '<base href="https://file+.vscode-resource.vscode-cdn.net/ext/dist/ui/">',
    );
  });

  it('injects the runtime config before the app script', () => {
    const configAt = html.indexOf('window.__DOTY_CONFIG__');
    expect(configAt).toBeGreaterThan(-1);
    expect(configAt).toBeLessThan(html.indexOf('index-abc.js'));
    expect(html).toContain('"apiUrl":"http://127.0.0.1:51234"');
  });

  it('puts the nonce on every script', () => {
    const scripts = html.match(/<script\b[^>]*>/g) ?? [];
    expect(scripts).toHaveLength(2);
    for (const tag of scripts) expect(tag).toContain('nonce="n0nce"');
  });

  it('escapes config values that could close the script tag', () => {
    const unsafe = buildWebviewHtml({
      ...input,
      config: { ...input.config, roots: ['/work/</script><script>x'] },
    });
    expect(unsafe).not.toContain('</script><script>x');
  });
});

describe('buildCsp', () => {
  it('only allows local assets, nonce scripts and the API', () => {
    expect(buildCsp({ cspSource: 'vscode-src', nonce: 'n', apiUrl: 'http://127.0.0.1:1' })).toBe(
      "default-src 'none'; img-src vscode-src data: blob:; font-src vscode-src; " +
        "style-src vscode-src 'unsafe-inline'; script-src 'nonce-n'; " +
        'connect-src http://127.0.0.1:1',
    );
  });
});

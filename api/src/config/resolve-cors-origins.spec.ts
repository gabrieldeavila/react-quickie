import { resolveCorsOrigins } from './resolve-cors-origins';

describe('resolveCorsOrigins', () => {
  it('keeps the dev origins plus UI_URL by default', () => {
    expect(resolveCorsOrigins({ UI_URL: 'http://doty.local' })).toEqual([
      'http://localhost:5173',
      'http://localhost:4173',
      'http://doty.local',
    ]);
  });

  it('replaces the defaults with DOTY_ALLOWED_ORIGINS', () => {
    expect(
      resolveCorsOrigins({
        DOTY_ALLOWED_ORIGINS: ' https://a.dev, ,https://b.dev',
      }),
    ).toEqual(['https://a.dev', 'https://b.dev']);
  });

  it('does not duplicate UI_URL', () => {
    expect(
      resolveCorsOrigins({
        DOTY_ALLOWED_ORIGINS: 'https://a.dev',
        UI_URL: 'https://a.dev',
      }),
    ).toEqual(['https://a.dev']);
  });

  it('allows vscode-webview origins only when a token is set', () => {
    const isWebview = (origin: unknown) =>
      origin instanceof RegExp && origin.test('vscode-webview://1a2b3c');

    expect(resolveCorsOrigins({}).some(isWebview)).toBe(false);
    expect(resolveCorsOrigins({ DOTY_AUTH_TOKEN: 't' }).some(isWebview)).toBe(
      true,
    );
  });
});

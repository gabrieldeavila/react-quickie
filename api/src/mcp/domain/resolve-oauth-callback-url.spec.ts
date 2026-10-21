import { resolveOAuthCallbackUrl } from './resolve-oauth-callback-url';

describe('resolveOAuthCallbackUrl', () => {
  it('points at this API on the loopback address', () => {
    expect(resolveOAuthCallbackUrl({ PORT: '51234' })).toBe(
      'http://127.0.0.1:51234/mcp/oauth/callback',
    );
    expect(resolveOAuthCallbackUrl({})).toBe(
      'http://127.0.0.1:3000/mcp/oauth/callback',
    );
  });

  it('can be overridden', () => {
    expect(
      resolveOAuthCallbackUrl({
        PORT: '3000',
        DOTY_OAUTH_CALLBACK_URL: 'http://localhost:4000/mcp/oauth/callback',
      }),
    ).toBe('http://localhost:4000/mcp/oauth/callback');
  });
});

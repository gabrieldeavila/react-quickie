import {
  resolveCallbackListenerPort,
  resolveOAuthCallbackUrl,
} from './resolve-oauth-callback-url';

describe('resolveOAuthCallbackUrl', () => {
  it('points at this API on the loopback address', () => {
    expect(resolveOAuthCallbackUrl({ PORT: '51234' })).toBe(
      'http://127.0.0.1:51234/mcp/oauth/callback',
    );
    expect(resolveOAuthCallbackUrl({})).toBe(
      'http://127.0.0.1:3000/mcp/oauth/callback',
    );
  });

  it('uses the fixed callback port when one is set', () => {
    expect(
      resolveOAuthCallbackUrl({
        PORT: '51234',
        DOTY_OAUTH_CALLBACK_PORT: '41736',
      }),
    ).toBe('http://127.0.0.1:41736/mcp/oauth/callback');
  });

  it('can be overridden', () => {
    expect(
      resolveOAuthCallbackUrl({
        PORT: '3000',
        DOTY_OAUTH_CALLBACK_PORT: '41736',
        DOTY_OAUTH_CALLBACK_URL: 'http://localhost:4000/mcp/oauth/callback',
      }),
    ).toBe('http://localhost:4000/mcp/oauth/callback');
  });
});

describe('resolveCallbackListenerPort', () => {
  it('needs a listener only for a valid port other than the API one', () => {
    expect(
      resolveCallbackListenerPort({
        PORT: '51234',
        DOTY_OAUTH_CALLBACK_PORT: '41736',
      }),
    ).toBe(41736);
    expect(
      resolveCallbackListenerPort({
        PORT: '3000',
        DOTY_OAUTH_CALLBACK_PORT: '3000',
      }),
    ).toBeUndefined();
    expect(
      resolveCallbackListenerPort({ DOTY_OAUTH_CALLBACK_PORT: 'abc' }),
    ).toBeUndefined();
    expect(resolveCallbackListenerPort({ PORT: '3000' })).toBeUndefined();
  });

  it('is off when the callback URL is overridden', () => {
    expect(
      resolveCallbackListenerPort({
        DOTY_OAUTH_CALLBACK_PORT: '41736',
        DOTY_OAUTH_CALLBACK_URL: 'http://localhost:4000/cb',
      }),
    ).toBeUndefined();
  });
});

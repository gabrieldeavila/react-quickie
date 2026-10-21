import { resolveOAuthClientInformation } from './resolve-oauth-client-information';

const redirect = 'http://127.0.0.1:3000/mcp/oauth/callback';
const registered = {
  clientInformation: { client_id: 'dyn' },
  clientRedirectUrl: redirect,
};

describe('resolveOAuthClientInformation', () => {
  it('uses the pre-registered client from the config', () => {
    expect(
      resolveOAuthClientInformation(
        { clientId: 'google-id', clientSecret: 'secret' },
        registered,
        redirect,
      ),
    ).toEqual({ client_id: 'google-id', client_secret: 'secret' });
    expect(
      resolveOAuthClientInformation({ clientId: 'public' }, {}, redirect),
    ).toEqual({ client_id: 'public' });
  });

  it('reuses a registered client for the same redirect URL', () => {
    expect(
      resolveOAuthClientInformation(undefined, registered, redirect),
    ).toEqual({ client_id: 'dyn' });
  });

  it('registers again when the redirect URL changed', () => {
    expect(
      resolveOAuthClientInformation(
        undefined,
        registered,
        'http://127.0.0.1:51234/mcp/oauth/callback',
      ),
    ).toBeUndefined();
  });
});

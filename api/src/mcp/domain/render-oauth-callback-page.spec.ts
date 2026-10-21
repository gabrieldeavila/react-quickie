import { renderOAuthCallbackPage } from './render-oauth-callback-page';

describe('renderOAuthCallbackPage', () => {
  it('confirms the sign-in with the server name', () => {
    const html = renderOAuthCallbackPage({ ok: true, serverName: 'drive' });
    expect(html).toContain('Signed in');
    expect(html).toContain('<strong>drive</strong>');
  });

  it('escapes what comes from the provider', () => {
    const html = renderOAuthCallbackPage({
      ok: false,
      message: '<script>alert(1)</script>',
    });
    expect(html).toContain('Sign-in failed');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});

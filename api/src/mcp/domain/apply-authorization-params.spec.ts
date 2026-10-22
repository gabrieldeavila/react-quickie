import { applyAuthorizationParams } from './apply-authorization-params';

const base = new URL(
  'https://accounts.google.com/o/oauth2/v2/auth?client_id=c&state=s&scope=a',
);

describe('applyAuthorizationParams', () => {
  it('adds extra parameters', () => {
    const url = applyAuthorizationParams(base, {
      access_type: 'offline',
      prompt: 'consent',
    });
    expect(url.searchParams.get('access_type')).toBe('offline');
    expect(url.searchParams.get('prompt')).toBe('consent');
    expect(url.searchParams.get('client_id')).toBe('c');
  });

  it("never replaces the flow's own parameters", () => {
    const url = applyAuthorizationParams(base, {
      state: 'forged',
      redirect_uri: 'https://evil.example.com',
      client_id: 'other',
      scope: 'everything',
    });
    expect(url.searchParams.get('state')).toBe('s');
    expect(url.searchParams.get('client_id')).toBe('c');
    expect(url.searchParams.get('scope')).toBe('a');
    expect(url.searchParams.has('redirect_uri')).toBe(false);
  });

  it('returns the URL unchanged without parameters', () => {
    expect(applyAuthorizationParams(base, undefined)).toBe(base);
  });
});

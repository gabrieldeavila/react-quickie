import { findSignInUrl, readSignInUrl } from './sign-in-url';

describe('readSignInUrl', () => {
  it('accepts https anywhere and http on this machine only', () => {
    expect(
      readSignInUrl('https://accounts.google.com/o/oauth2/auth'),
    ).toBeDefined();
    expect(readSignInUrl('http://localhost:8000/auth')).toBeDefined();
    expect(readSignInUrl('http://127.0.0.1:8000/auth')).toBeDefined();
    expect(readSignInUrl('http://evil.example.com/login')).toBeUndefined();
    expect(readSignInUrl('javascript:alert(1)')).toBeUndefined();
    expect(readSignInUrl('file:///etc/passwd')).toBeUndefined();
    expect(readSignInUrl(42)).toBeUndefined();
  });
});

describe('findSignInUrl', () => {
  it('finds the login link a server printed', () => {
    expect(
      findSignInUrl(
        'Please visit https://accounts.google.com/o/oauth2/auth?client_id=x&scope=y to authorize.',
      ),
    ).toBe('https://accounts.google.com/o/oauth2/auth?client_id=x&scope=y');
    expect(findSignInUrl('Open http://localhost:8000/auth/start')).toBe(
      'http://localhost:8000/auth/start',
    );
    expect(
      findSignInUrl('Login: https://example.com/oauth/authorize?state=1).'),
    ).toBe('https://example.com/oauth/authorize?state=1');
  });

  it('ignores ordinary links and plain text', () => {
    expect(
      findSignInUrl('Docs at https://example.com/docs/getting-started'),
    ).toBeUndefined();
    expect(findSignInUrl('Listening on http://localhost:3000')).toBeUndefined();
    expect(findSignInUrl('authorization failed')).toBeUndefined();
  });

  it('never returns a non-local http link', () => {
    expect(
      findSignInUrl('visit http://phish.example.com/login'),
    ).toBeUndefined();
  });
});

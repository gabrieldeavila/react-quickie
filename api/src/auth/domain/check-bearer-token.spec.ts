import { isAuthorized, readBearerToken } from './check-bearer-token';

describe('readBearerToken', () => {
  it('reads the token after "Bearer "', () => {
    expect(readBearerToken('Bearer abc123')).toBe('abc123');
  });

  it('returns null for missing, empty or non-bearer headers', () => {
    expect(readBearerToken(undefined)).toBeNull();
    expect(readBearerToken('Bearer ')).toBeNull();
    expect(readBearerToken('Basic abc123')).toBeNull();
  });
});

describe('isAuthorized', () => {
  it('allows every request when no token is configured', () => {
    expect(isAuthorized(undefined, undefined)).toBe(true);
    expect(isAuthorized('', 'Bearer whatever')).toBe(true);
  });

  it('accepts the configured token', () => {
    expect(isAuthorized('secret', 'Bearer secret')).toBe(true);
  });

  it('rejects a missing, wrong or prefix-matching token', () => {
    expect(isAuthorized('secret', undefined)).toBe(false);
    expect(isAuthorized('secret', 'Bearer nope')).toBe(false);
    expect(isAuthorized('secret', 'Bearer secre')).toBe(false);
    expect(isAuthorized('secret', 'Bearer secret2')).toBe(false);
  });
});

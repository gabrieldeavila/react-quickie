import {
  SIGN_IN_REQUEST_TTL_MS,
  SignInRequestRegistry,
} from './sign-in-request-registry';

const ids = () => {
  let next = 0;
  return () => `r${(next += 1)}`;
};

const base = {
  root: '/repo',
  serverName: 'drive',
  source: 'server-output' as const,
  url: 'https://accounts.example.com/auth',
};

describe('SignInRequestRegistry', () => {
  it('keeps one request per server, source and URL', () => {
    const registry = new SignInRequestRegistry(ids());
    const first = registry.add(base, 0);
    expect(registry.add(base, 10)).toBe(first);
    registry.add({ ...base, source: 'oauth', url: undefined }, 10);

    expect(registry.list('/repo', 10)).toHaveLength(2);
    expect(registry.list('/other', 10)).toEqual([]);
    expect(registry.has('/repo', 'drive')).toBe(true);
  });

  it("replaces a server's printed link with its newer one", () => {
    const registry = new SignInRequestRegistry(ids());
    registry.add(base, 0);
    const newer = registry.add(
      { ...base, url: 'https://accounts.example.com/auth?state=2' },
      10,
    );

    expect(registry.list('/repo', 10)).toEqual([newer]);
  });

  it('clears a server by source and removes by id', () => {
    const registry = new SignInRequestRegistry(ids());
    const output = registry.add(base, 0);
    const oauth = registry.add({ ...base, source: 'oauth', url: undefined }, 0);
    registry.add({ ...base, source: 'elicitation' }, 0);

    expect(
      registry.clearServer('/repo', 'drive', ['oauth', 'server-output']),
    ).toEqual([output, oauth]);
    expect(registry.list('/repo', 0).map((item) => item.source)).toEqual([
      'elicitation',
    ]);
    const [left] = registry.list('/repo', 0);
    expect(registry.remove(left.id)).toBe(left);
    expect(registry.has('/repo', 'drive')).toBe(false);
  });

  it('drops requests nobody answered', () => {
    const registry = new SignInRequestRegistry(ids());
    registry.add(base, 0);
    expect(registry.list('/repo', SIGN_IN_REQUEST_TTL_MS)).toEqual([]);
  });
});

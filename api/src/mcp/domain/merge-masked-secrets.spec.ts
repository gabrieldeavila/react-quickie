import { SECRET_MASK } from './mask-mcp-secrets';
import { McpConfigEditError } from './mcp-config-text';
import { mergeMaskedSecrets } from './merge-masked-secrets';

const stored = {
  command: 'server',
  env: { TOKEN: 'ghp_secret', REGION: 'eu' },
};

describe('mergeMaskedSecrets', () => {
  it('keeps the stored value for an unchanged (masked) secret', () => {
    expect(
      mergeMaskedSecrets(
        {
          command: 'server',
          args: ['--v2'],
          env: { TOKEN: SECRET_MASK, REGION: 'us' },
        },
        stored,
      ),
    ).toEqual({
      command: 'server',
      args: ['--v2'],
      env: { TOKEN: 'ghp_secret', REGION: 'us' },
    });
  });

  it('uses a new value when the user typed one, and drops removed keys', () => {
    expect(
      mergeMaskedSecrets(
        { command: 'server', env: { TOKEN: 'ghp_new' } },
        stored,
      ),
    ).toEqual({ command: 'server', env: { TOKEN: 'ghp_new' } });
  });

  it('works for headers too', () => {
    expect(
      mergeMaskedSecrets(
        { type: 'http', url: 'https://x', headers: { Key: SECRET_MASK } },
        { type: 'http', url: 'https://x', headers: { Key: 'k-1' } },
      ),
    ).toEqual({ type: 'http', url: 'https://x', headers: { Key: 'k-1' } });
  });

  it('refuses a mask with nothing stored behind it', () => {
    expect(() =>
      mergeMaskedSecrets({ command: 's', env: { NEW: SECRET_MASK } }, stored),
    ).toThrow(McpConfigEditError);
    expect(() =>
      mergeMaskedSecrets(
        { command: 's', env: { TOKEN: SECRET_MASK } },
        undefined,
      ),
    ).toThrow(/type the value again/);
  });

  it('keeps the stored oauth client secret when it comes back masked', () => {
    const storedHttp = {
      type: 'http',
      url: 'https://x',
      oauth: { clientId: 'id', clientSecret: 'real' },
    };

    expect(
      mergeMaskedSecrets(
        {
          ...storedHttp,
          oauth: { clientId: 'id2', clientSecret: SECRET_MASK },
        },
        storedHttp,
      ),
    ).toEqual({
      ...storedHttp,
      oauth: { clientId: 'id2', clientSecret: 'real' },
    });
    expect(() =>
      mergeMaskedSecrets(
        { ...storedHttp, oauth: { clientSecret: SECRET_MASK } },
        undefined,
      ),
    ).toThrow(/oauth.clientSecret/);
  });
});

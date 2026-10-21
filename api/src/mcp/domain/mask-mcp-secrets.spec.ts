import { maskMcpSecrets, SECRET_MASK } from './mask-mcp-secrets';

describe('maskMcpSecrets', () => {
  it('masks literal env and header values and keeps ${VAR} references', () => {
    expect(
      maskMcpSecrets({
        type: 'http',
        url: 'https://x',
        headers: {
          Authorization: 'Bearer ${GITHUB_TOKEN}',
          'X-Api-Key': 'sk-live-123',
        },
        env: { TOKEN: 'ghp_abc', EMPTY: '', HOME_DIR: '${HOME}' },
      }),
    ).toEqual({
      type: 'http',
      url: 'https://x',
      headers: {
        Authorization: 'Bearer ${GITHUB_TOKEN}',
        'X-Api-Key': SECRET_MASK,
      },
      env: { TOKEN: SECRET_MASK, EMPTY: '', HOME_DIR: '${HOME}' },
    });
  });

  it('masks a literal oauth client secret and keeps a ${VAR} one', () => {
    const entry = (clientSecret: string) => ({
      type: 'http',
      url: 'https://x',
      oauth: { clientId: 'id', clientSecret },
    });

    expect(maskMcpSecrets(entry('s3cret'))).toEqual(entry(SECRET_MASK));
    expect(maskMcpSecrets(entry('${SECRET}'))).toEqual(entry('${SECRET}'));
  });

  it('leaves command, args and other fields alone', () => {
    const entry = { command: 'npx', args: ['-y', 'secretless'] };

    expect(maskMcpSecrets(entry)).toEqual(entry);
  });

  it('passes anything that is not an object through', () => {
    expect(maskMcpSecrets('nope')).toBe('nope');
    expect(maskMcpSecrets(null)).toBeNull();
  });
});

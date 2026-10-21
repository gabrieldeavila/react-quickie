import { mcpOAuthKey } from './mcp-oauth-key';

const server = { name: 'drive', url: 'https://mcp.example.com' };

describe('mcpOAuthKey', () => {
  it('shares global servers across projects', () => {
    expect(mcpOAuthKey({ ...server, source: 'global', root: '/a' })).toBe(
      mcpOAuthKey({ ...server, source: 'global', root: '/b' }),
    );
  });

  it('keeps project servers per project', () => {
    expect(mcpOAuthKey({ ...server, source: 'project', root: '/a' })).not.toBe(
      mcpOAuthKey({ ...server, source: 'project', root: '/b' }),
    );
  });

  it('changes with the server URL', () => {
    expect(mcpOAuthKey({ ...server, source: 'global', root: '/a' })).not.toBe(
      mcpOAuthKey({
        ...server,
        url: 'https://other.example.com',
        source: 'global',
        root: '/a',
      }),
    );
  });
});

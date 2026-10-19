import { parseMcpConfig } from './parse-mcp-config';

const env = { GITHUB_TOKEN: 'ghp_123', DATABASE_URL: 'postgres://db' };
const parse = (value: unknown, source: 'global' | 'project' = 'global') =>
  parseMcpConfig(JSON.stringify(value), { source, env });

describe('parseMcpConfig', () => {
  it('parses stdio and http servers and interpolates ${VAR}', () => {
    const result = parse({
      mcpServers: {
        github: {
          type: 'http',
          url: 'https://api.githubcopilot.com/mcp/',
          headers: { Authorization: 'Bearer ${GITHUB_TOKEN}' },
          approval: 'ask',
        },
        postgres: {
          command: 'npx',
          args: ['-y', 'server-postgres', '${DATABASE_URL}'],
          approval: 'never',
          enabledTools: ['query'],
        },
      },
    });

    expect(result.error).toBeUndefined();
    expect(result.servers).toEqual([
      {
        name: 'github',
        source: 'global',
        config: {
          type: 'http',
          url: 'https://api.githubcopilot.com/mcp/',
          headers: { Authorization: 'Bearer ghp_123' },
          approval: 'ask',
        },
      },
      {
        name: 'postgres',
        source: 'global',
        config: {
          command: 'npx',
          args: ['-y', 'server-postgres', 'postgres://db'],
          approval: 'never',
          enabledTools: ['query'],
        },
      },
    ]);
  });

  it('accepts a per-tool approval map', () => {
    const [server] = parse({
      mcpServers: { fs: { command: 'fs-mcp', approval: { read: 'never' } } },
    }).servers;
    expect(server.config).toMatchObject({ approval: { read: 'never' } });
  });

  it('marks a server with missing env vars as an error instead of sending blanks', () => {
    const [server] = parse({
      mcpServers: {
        github: {
          type: 'http',
          url: 'https://x.dev/${MISSING_HOST}',
          headers: { Authorization: 'Bearer ${NOPE}' },
        },
      },
    }).servers;

    expect(server.config).toBeUndefined();
    expect(server.error).toBe(
      'Missing environment variables: MISSING_HOST, NOPE',
    );
  });

  it('allows the url to come from an env var', () => {
    const [server] = parseMcpConfig(
      JSON.stringify({
        mcpServers: { remote: { type: 'http', url: '${MCP_URL}' } },
      }),
      { source: 'global', env: { MCP_URL: 'https://mcp.dev' } },
    ).servers;
    expect(server.config).toEqual({ type: 'http', url: 'https://mcp.dev' });
  });

  it('rejects a url that is not a URL after interpolation', () => {
    const [server] = parse({
      mcpServers: { remote: { type: 'http', url: 'not a url' } },
    }).servers;
    expect(server.error).toContain('Invalid URL');
  });

  it('errors only the invalid server and keeps the others', () => {
    const { servers } = parse(
      {
        mcpServers: {
          broken: { args: ['no command'] },
          badApproval: { command: 'x', approval: 'always' },
          ok: { command: 'ok-mcp' },
        },
      },
      'project',
    );

    expect(servers.map((s) => [s.name, s.source, !!s.config])).toEqual([
      ['broken', 'project', false],
      ['badApproval', 'project', false],
      ['ok', 'project', true],
    ]);
  });

  it('reports a file-level error for bad JSON or a missing mcpServers object', () => {
    expect(parseMcpConfig('{', { source: 'global', env }).error).toBe(
      'Invalid JSON.',
    );
    expect(parse({ servers: {} }).error).toContain('mcpServers');
    expect(parse([]).error).toContain('mcpServers');
  });
});

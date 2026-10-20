import { McpConfigEditError } from './mcp-config-text';
import { upsertMcpServer } from './upsert-mcp-server';

const file = JSON.stringify({
  $schema: 'https://example.com/mcp.json',
  mcpServers: { db: { command: 'db-mcp', args: ['--ro'] } },
});

describe('upsertMcpServer', () => {
  it('adds a server and keeps the others and unknown keys', () => {
    const text = upsertMcpServer(file, 'github', {
      type: 'http',
      url: 'https://api.example.com/mcp',
      headers: { Authorization: 'Bearer ${GITHUB_TOKEN}' },
    });

    expect(JSON.parse(text)).toEqual({
      $schema: 'https://example.com/mcp.json',
      mcpServers: {
        db: { command: 'db-mcp', args: ['--ro'] },
        github: {
          type: 'http',
          url: 'https://api.example.com/mcp',
          headers: { Authorization: 'Bearer ${GITHUB_TOKEN}' },
        },
      },
    });
    expect(text.endsWith('}\n')).toBe(true);
  });

  it('replaces an existing server and keeps fields Doty does not know', () => {
    const text = upsertMcpServer(file, 'db', {
      command: 'db-mcp',
      timeout: 30,
    });

    expect(JSON.parse(text).mcpServers.db).toEqual({
      command: 'db-mcp',
      timeout: 30,
    });
  });

  it('creates the file content when there is none', () => {
    expect(JSON.parse(upsertMcpServer(null, 'a', { command: 'a' }))).toEqual({
      mcpServers: { a: { command: 'a' } },
    });
  });

  it('rejects an invalid server or name', () => {
    expect(() => upsertMcpServer(file, 'x', { args: [] })).toThrow(
      McpConfigEditError,
    );
    expect(() => upsertMcpServer(file, 'x', { type: 'http' })).toThrow(
      /Invalid server/,
    );
    expect(() => upsertMcpServer(file, 'bad name', { command: 'a' })).toThrow(
      /Server names/,
    );
  });
});

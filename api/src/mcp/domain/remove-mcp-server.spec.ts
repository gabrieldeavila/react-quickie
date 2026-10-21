import { removeMcpServer } from './remove-mcp-server';

describe('removeMcpServer', () => {
  const file = JSON.stringify({
    other: true,
    mcpServers: { a: { command: 'a' }, b: { command: 'b' } },
  });

  it('removes only that server', () => {
    expect(JSON.parse(removeMcpServer(file, 'a'))).toEqual({
      other: true,
      mcpServers: { b: { command: 'b' } },
    });
  });

  it('throws not-found for an unknown server or a missing file', () => {
    expect(() => removeMcpServer(file, 'zzz')).toThrow(/not found/);
    expect(() => removeMcpServer(null, 'a')).toThrow(/not found/);
  });
});

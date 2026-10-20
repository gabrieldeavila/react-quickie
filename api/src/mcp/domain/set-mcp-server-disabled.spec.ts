import { setMcpServerDisabled } from './set-mcp-server-disabled';

describe('setMcpServerDisabled', () => {
  const file = JSON.stringify({
    mcpServers: { a: { command: 'a', args: ['x'] }, b: { command: 'b' } },
  });

  it('disables a server and enables it again by removing the key', () => {
    const disabled = setMcpServerDisabled(file, 'a', true);
    expect(JSON.parse(disabled).mcpServers.a).toEqual({
      command: 'a',
      args: ['x'],
      disabled: true,
    });

    const enabled = setMcpServerDisabled(disabled, 'a', false);
    expect(JSON.parse(enabled).mcpServers).toEqual({
      a: { command: 'a', args: ['x'] },
      b: { command: 'b' },
    });
  });

  it('throws not-found for an unknown server', () => {
    expect(() => setMcpServerDisabled(file, 'zzz', true)).toThrow(/not found/);
  });
});

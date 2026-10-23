import { allowMcpTool } from './allow-mcp-tool';

describe('allowMcpTool', () => {
  it('allows the whole server', () => {
    expect(allowMcpTool({ a: 'ask' }, 'a', true)).toBe('never');
  });

  it('adds one tool to a per-tool map', () => {
    expect(allowMcpTool({ a: 'never', b: 'ask' }, 'b', false)).toEqual({
      a: 'never',
      b: 'never',
    });
  });

  it('starts a map when the server asks for everything', () => {
    expect(allowMcpTool(undefined, 'a', false)).toEqual({ a: 'never' });
    expect(allowMcpTool('ask', 'a', false)).toEqual({ a: 'never' });
  });

  it('keeps a server that already never asks', () => {
    expect(allowMcpTool('never', 'a', false)).toBe('never');
  });
});

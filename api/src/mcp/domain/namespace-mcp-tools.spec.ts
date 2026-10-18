import { tool, type Tool } from 'ai';
import { z } from 'zod/v4';
import { namespaceMcpTools } from './namespace-mcp-tools';

const fakeTool = (description: string): Tool =>
  tool({ description, inputSchema: z.object({}) });

const tools = (...names: string[]) =>
  Object.fromEntries(names.map((name) => [name, fakeTool(name)]));

describe('namespaceMcpTools', () => {
  it('renames every tool and records where it came from', () => {
    const result = namespaceMcpTools([
      { server: 'github', tools: tools('search', 'create_issue') },
      { server: 'db', tools: tools('query') },
    ]);

    expect(Object.keys(result.tools)).toEqual([
      'mcp__github__search',
      'mcp__github__create_issue',
      'mcp__db__query',
    ]);
    expect(result.tools.mcp__db__query.description).toBe('query');
    expect(result.entries).toContainEqual({
      name: 'mcp__db__query',
      server: 'db',
      tool: 'query',
    });
  });

  it('keeps only enabledTools when set', () => {
    const result = namespaceMcpTools([
      { server: 'db', tools: tools('query', 'drop'), enabledTools: ['query'] },
    ]);
    expect(Object.keys(result.tools)).toEqual(['mcp__db__query']);
  });

  it('removes disabledTools, also on top of enabledTools', () => {
    const result = namespaceMcpTools([
      {
        server: 'fs',
        tools: tools('read', 'write', 'delete'),
        enabledTools: ['read', 'write'],
        disabledTools: ['write'],
      },
    ]);
    expect(result.entries.map((e) => e.tool)).toEqual(['read']);
  });

  it('keeps colliding names unique across servers', () => {
    const result = namespaceMcpTools([
      { server: 'my.docs', tools: tools('get') },
      { server: 'my_docs', tools: tools('get') },
    ]);
    expect(Object.keys(result.tools)).toHaveLength(2);
    expect(new Set(result.entries.map((e) => e.server))).toEqual(
      new Set(['my.docs', 'my_docs']),
    );
  });
});

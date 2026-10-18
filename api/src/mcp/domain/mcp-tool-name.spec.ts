import {
  assignMcpToolNames,
  buildMcpToolName,
  MAX_TOOL_NAME_LENGTH,
} from './mcp-tool-name';

const VALID_NAME = /^[A-Za-z0-9_-]{1,64}$/;

describe('buildMcpToolName', () => {
  it('prefixes with mcp__<server>__', () => {
    expect(buildMcpToolName({ server: 'github', tool: 'search_issues' })).toBe(
      'mcp__github__search_issues',
    );
  });

  it('replaces characters providers reject', () => {
    expect(buildMcpToolName({ server: 'my.server', tool: 'get file/v2' })).toBe(
      'mcp__my_server__get_file_v2',
    );
  });

  it('cuts names to the 64-char provider limit', () => {
    const name = buildMcpToolName({ server: 's', tool: 'x'.repeat(100) });
    expect(name).toHaveLength(MAX_TOOL_NAME_LENGTH);
    expect(name).toMatch(VALID_NAME);
  });
});

describe('assignMcpToolNames', () => {
  it('leaves names alone when they are unique', () => {
    expect(
      assignMcpToolNames([
        { server: 'a', tool: 'one' },
        { server: 'b', tool: 'one' },
      ]),
    ).toEqual(['mcp__a__one', 'mcp__b__one']);
  });

  it('adds a hash suffix when sanitizing makes two names equal', () => {
    const names = assignMcpToolNames([
      { server: 'docs', tool: 'get.page' },
      { server: 'docs', tool: 'get_page' },
      { server: 'docs', tool: 'list' },
    ]);

    expect(new Set(names).size).toBe(3);
    expect(names[0]).toMatch(/^mcp__docs__get_page_[0-9a-f]{6}$/);
    expect(names[1]).toMatch(/^mcp__docs__get_page_[0-9a-f]{6}$/);
    expect(names[2]).toBe('mcp__docs__list');
  });

  it('adds a hash suffix when truncation makes two names equal', () => {
    const prefix = 'y'.repeat(80);
    const names = assignMcpToolNames([
      { server: 's', tool: `${prefix}_a` },
      { server: 's', tool: `${prefix}_b` },
    ]);

    expect(names[0]).not.toBe(names[1]);
    for (const name of names) {
      expect(name).toHaveLength(MAX_TOOL_NAME_LENGTH);
      expect(name).toMatch(VALID_NAME);
    }
  });

  it('keeps the suffix stable across calls and input order', () => {
    const a = { server: 'x.y', tool: 't' };
    const b = { server: 'x_y', tool: 't' };
    const first = assignMcpToolNames([a, b]);
    const second = assignMcpToolNames([b, a]);
    expect(second).toEqual([first[1], first[0]]);
  });
});

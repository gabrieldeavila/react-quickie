import {
  assertServerName,
  McpConfigEditError,
  readConfigDocument,
  writeConfigDocument,
} from './mcp-config-text';

describe('readConfigDocument', () => {
  it('starts an empty document for a missing or blank file', () => {
    expect(readConfigDocument(null)).toEqual({ mcpServers: {} });
    expect(readConfigDocument('  \n')).toEqual({ mcpServers: {} });
  });

  it('keeps unknown top-level keys', () => {
    expect(
      readConfigDocument('{"$schema":"x","mcpServers":{"a":{"command":"a"}}}'),
    ).toEqual({ $schema: 'x', mcpServers: { a: { command: 'a' } } });
  });

  it('adds mcpServers when the object has none', () => {
    expect(readConfigDocument('{"other":1}')).toEqual({
      other: 1,
      mcpServers: {},
    });
  });

  it.each(['{bad', '[]', '{"mcpServers":[]}'])(
    'refuses to edit a broken file: %s',
    (text) => {
      expect(() => readConfigDocument(text)).toThrow(McpConfigEditError);
    },
  );
});

describe('writeConfigDocument', () => {
  it('writes 2-space JSON with a trailing newline', () => {
    expect(writeConfigDocument({ mcpServers: { a: { command: 'a' } } })).toBe(
      '{\n  "mcpServers": {\n    "a": {\n      "command": "a"\n    }\n  }\n}\n',
    );
  });
});

describe('assertServerName', () => {
  it('accepts simple names and rejects the rest', () => {
    expect(() => assertServerName('github')).not.toThrow();
    expect(() => assertServerName('my_server.v2-beta')).not.toThrow();
    for (const name of ['', '-x', 'a b', 'a/b', 'x'.repeat(65)]) {
      expect(() => assertServerName(name)).toThrow(McpConfigEditError);
    }
  });
});

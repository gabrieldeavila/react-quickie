import { mergeMcpConfigs } from './merge-mcp-configs';
import type { ParsedMcpServer } from './mcp-server.types';

const server = (
  name: string,
  source: 'global' | 'project',
  command = `${name}-${source}`,
): ParsedMcpServer => ({ name, source, config: { command } });

describe('mergeMcpConfigs', () => {
  it('lets a project server override a global one with the same name', () => {
    const merged = mergeMcpConfigs(
      [server('github', 'global'), server('docs', 'global')],
      [server('github', 'project'), server('db', 'project')],
    );

    expect(merged.map((s) => [s.name, s.source])).toEqual([
      ['github', 'project'],
      ['docs', 'global'],
      ['db', 'project'],
    ]);
  });

  it('overrides even when the project entry is invalid (it shows as an error)', () => {
    const merged = mergeMcpConfigs(
      [server('github', 'global')],
      [{ name: 'github', source: 'project', error: 'bad' }],
    );
    expect(merged).toEqual([
      { name: 'github', source: 'project', error: 'bad' },
    ]);
  });

  it('keeps global servers as they are when there is no project config', () => {
    const global = [server('a', 'global')];
    expect(mergeMcpConfigs(global, [])).toEqual(global);
  });
});

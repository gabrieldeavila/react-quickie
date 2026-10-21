import { describe, expect, it } from 'vitest';
import { resolveMcpConfigPath } from './resolve-mcp-config-path';

describe('resolveMcpConfigPath', () => {
  it('uses the data dir for the global file', () => {
    expect(resolveMcpConfigPath('global', undefined, '/data', [])).toBe('/data/mcp.json');
  });

  it('uses <root>/.doty for a project inside the workspace', () => {
    expect(resolveMcpConfigPath('project', '/w/app', '/data', ['/w'])).toBe(
      '/w/app/.doty/mcp.json',
    );
  });

  it('refuses a project root outside every workspace folder', () => {
    expect(resolveMcpConfigPath('project', '/etc', '/data', ['/w'])).toBeNull();
    expect(resolveMcpConfigPath('project', undefined, '/data', ['/w'])).toBeNull();
  });
});

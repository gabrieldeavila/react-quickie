import { resolveAgentTools } from './resolve-agent-tools';
import { matchesToolGlob } from './tool-glob';

const pool = [
  'read_file',
  'list_folders',
  'edit_file',
  'run_bash_command',
  'run_subagent',
  'mcp__github__get_issue',
  'mcp__github__create_issue',
  'mcp__postgres__query',
];

describe('matchesToolGlob', () => {
  it('matches literal names exactly', () => {
    expect(matchesToolGlob('read_file', 'read_file')).toBe(true);
    expect(matchesToolGlob('read_file', 'read_file_x')).toBe(false);
  });

  it('treats * as any run of characters and the rest literally', () => {
    expect(matchesToolGlob('mcp__github__*', 'mcp__github__get_issue')).toBe(
      true,
    );
    expect(matchesToolGlob('mcp__github__*', 'mcp__gitlab__x')).toBe(false);
    expect(matchesToolGlob('mcp__*__query', 'mcp__postgres__query')).toBe(true);
    expect(matchesToolGlob('read.file', 'read_file')).toBe(false);
  });
});

describe('resolveAgentTools', () => {
  it('keeps the tools the allowlist names, in pool order', () => {
    expect(
      resolveAgentTools(pool, {
        tools: ['list_folders', 'read_file', 'not_a_tool'],
        writes: false,
      }),
    ).toEqual(['read_file', 'list_folders']);
  });

  it('expands globs', () => {
    expect(
      resolveAgentTools(pool, { tools: ['mcp__github__*'], writes: false }),
    ).toEqual(['mcp__github__get_issue', 'mcp__github__create_issue']);
  });

  it('never gives run_subagent, even to * (no recursion)', () => {
    expect(
      resolveAgentTools(pool, { tools: ['*'], writes: true }),
    ).not.toContain('run_subagent');
  });

  it('drops write tools from read-only agents even when listed', () => {
    expect(
      resolveAgentTools(pool, {
        tools: ['read_file', 'edit_file', 'run_bash_command'],
        writes: false,
      }),
    ).toEqual(['read_file']);
  });

  it('gives write tools to writes: true agents', () => {
    expect(
      resolveAgentTools(pool, {
        tools: ['read_file', 'edit_file', 'run_bash_command'],
        writes: true,
      }),
    ).toEqual(['read_file', 'edit_file', 'run_bash_command']);
  });
});

import { validateRuleRequest } from './validate-rule-request';

describe('validateRuleRequest', () => {
  it('accepts a project tool rule', () => {
    expect(
      validateRuleRequest({ scope: 'project', tool: 'create_commit' }, '/r'),
    ).toEqual({
      ok: true,
      target: { scope: 'project', root: '/r', tool: 'create_commit' },
    });
  });

  it('drops the root from a global rule', () => {
    expect(
      validateRuleRequest({ scope: 'global', tool: 'mcp__drive__*' }, '/r'),
    ).toEqual({ ok: true, target: { scope: 'global', tool: 'mcp__drive__*' } });
  });

  it('normalizes a Bash command', () => {
    expect(
      validateRuleRequest(
        {
          scope: 'global',
          tool: 'run_bash_command',
          command: ' rm  -rf dist ',
        },
        undefined,
      ),
    ).toEqual({
      ok: true,
      target: {
        scope: 'global',
        tool: 'run_bash_command',
        command: 'rm -rf dist',
      },
    });
  });

  it.each([
    ['a bad scope', { scope: 'all', tool: 'x' }],
    ['a project rule without root', { scope: 'project', tool: 'x' }],
    ['a wildcard', { scope: 'global', tool: '*' }],
    ['a glob outside one MCP server', { scope: 'global', tool: 'create_*' }],
    ['Bash without a command', { scope: 'global', tool: 'run_bash_command' }],
    [
      'a chained command',
      { scope: 'global', tool: 'run_bash_command', command: 'a && b' },
    ],
    [
      'a command on another tool',
      { scope: 'global', tool: 'x', command: 'ls' },
    ],
  ])('refuses %s', (_label, body) => {
    expect(validateRuleRequest(body, undefined).ok).toBe(false);
  });
});

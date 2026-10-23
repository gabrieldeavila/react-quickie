import type { ApprovalRules } from './approval-rule.types';
import { matchApprovalRule } from './match-approval-rule';

const rule = (tool: string, command?: string) => ({
  tool,
  ...(command === undefined ? {} : { command }),
  createdAt: '',
});

const rules: ApprovalRules = {
  global: [
    rule('mcp__drive__*'),
    rule('run_bash_command', 'rm -rf dist'),
    rule('run_bash_command'),
  ],
  projects: {
    '/code/app': [rule('create_commit')],
  },
};

const match = (toolName: string, input: unknown = {}, root = '/code/app') =>
  matchApprovalRule(rules, root, toolName, input);

describe('matchApprovalRule', () => {
  it('matches a tool glob', () => {
    expect(match('mcp__drive__list_items')).toEqual(rule('mcp__drive__*'));
    expect(match('mcp__mail__send')).toBeUndefined();
  });

  it('matches project rules only for their root', () => {
    expect(match('create_commit')).toEqual(rule('create_commit'));
    expect(match('create_commit', {}, '/code/other')).toBeUndefined();
    expect(
      matchApprovalRule(rules, undefined, 'create_commit', {}),
    ).toBeUndefined();
  });

  it('prefers project rules over global ones', () => {
    const both: ApprovalRules = {
      global: [rule('create_commit')],
      projects: { '/code/app': [{ ...rule('create_commit'), createdAt: 'p' }] },
    };

    expect(
      matchApprovalRule(both, '/code/app', 'create_commit', {})?.createdAt,
    ).toBe('p');
  });

  it('matches bash only on the exact normalized command', () => {
    expect(match('run_bash_command', { command: '  rm  -rf dist ' })).toEqual(
      rule('run_bash_command', 'rm -rf dist'),
    );
    expect(
      match('run_bash_command', { command: 'rm -rf dist/x' }),
    ).toBeUndefined();
    expect(
      match('run_bash_command', { command: 'rm -rf dist; rm -rf /' }),
    ).toBeUndefined();
  });

  it('never lets a rule without a command allow all bash', () => {
    const wildcard: ApprovalRules = { global: [rule('*')], projects: {} };

    expect(
      match('run_bash_command', { command: 'rm -rf src' }),
    ).toBeUndefined();
    expect(
      matchApprovalRule(wildcard, undefined, 'run_bash_command', {
        command: 'rm -rf src',
      }),
    ).toBeUndefined();
  });

  it('ignores a command on a rule for another tool', () => {
    const odd: ApprovalRules = {
      global: [rule('create_commit', 'anything')],
      projects: {},
    };

    expect(
      matchApprovalRule(odd, undefined, 'create_commit', {}),
    ).toBeUndefined();
  });

  it('does not match bash calls with a missing command', () => {
    expect(match('run_bash_command', null)).toBeUndefined();
    expect(match('run_bash_command', { command: 42 })).toBeUndefined();
  });
});

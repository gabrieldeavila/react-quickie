import type { ApprovalRules } from './approval-rule.types';
import { addApprovalRule, removeApprovalRule } from './edit-approval-rules';

const empty: ApprovalRules = { global: [], projects: {} };

describe('addApprovalRule', () => {
  it('adds a global rule', () => {
    expect(
      addApprovalRule(empty, { scope: 'global', tool: 'mcp__a__*' }, 't1'),
    ).toEqual({
      global: [{ tool: 'mcp__a__*', createdAt: 't1' }],
      projects: {},
    });
  });

  it('adds a project rule under its root', () => {
    const target = {
      scope: 'project' as const,
      root: '/code/app',
      tool: 'run_bash_command',
      command: 'pnpm build',
    };

    expect(addApprovalRule(empty, target, 't1').projects).toEqual({
      '/code/app': [
        { tool: 'run_bash_command', command: 'pnpm build', createdAt: 't1' },
      ],
    });
  });

  it('does not add a duplicate', () => {
    const target = { scope: 'global' as const, tool: 'create_commit' };
    const once = addApprovalRule(empty, target, 't1');

    expect(addApprovalRule(once, target, 't2')).toBe(once);
  });

  it('refuses a project rule without a root', () => {
    expect(() =>
      addApprovalRule(empty, { scope: 'project', tool: 'x' }, 't1'),
    ).toThrow(/root/);
  });
});

describe('removeApprovalRule', () => {
  const rules: ApprovalRules = {
    global: [
      { tool: 'run_bash_command', command: 'pnpm a', createdAt: '' },
      { tool: 'run_bash_command', command: 'pnpm b', createdAt: '' },
    ],
    projects: { '/code/app': [{ tool: 'create_commit', createdAt: '' }] },
  };

  it('removes only the rule with the same tool and command', () => {
    expect(
      removeApprovalRule(rules, {
        scope: 'global',
        tool: 'run_bash_command',
        command: 'pnpm a',
      }).global,
    ).toEqual([{ tool: 'run_bash_command', command: 'pnpm b', createdAt: '' }]);
  });

  it('drops a project left without rules', () => {
    expect(
      removeApprovalRule(rules, {
        scope: 'project',
        root: '/code/app',
        tool: 'create_commit',
      }).projects,
    ).toEqual({});
  });
});

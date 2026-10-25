import type {
  ApprovalVerdict,
  ToolApprovalPolicy,
} from 'src/chat/domain/approval-policy';
import { applyAutoMode } from './apply-auto-mode';

const fixed =
  (verdict: ApprovalVerdict): ToolApprovalPolicy =>
  () =>
    verdict;

const policies = {
  run_bash_command: (input: unknown): ApprovalVerdict =>
    (input as { command: string }).command.startsWith('rm')
      ? { decision: 'ask', risk: 'destructive' }
      : { decision: 'ask', risk: 'changes' },
  mcp__drive__list: fixed({ decision: 'ask' }),
  mcp__drive__delete: fixed({ decision: 'ask' }),
  mcp__drive__trash: fixed({ decision: 'ask', risk: 'destructive' }),
  create_commit: fixed({ decision: 'ask' }),
  save_mcp_server: fixed({ decision: 'ask' }),
  remove_mcp_server: fixed({ decision: 'ask' }),
  save_instruction: fixed({ decision: 'ask' }),
  blocked: fixed({ decision: 'always-deny', reason: 'no' }),
  free: fixed({ decision: 'never' }),
};

describe('applyAutoMode', () => {
  const auto = applyAutoMode(policies, { enabled: true });

  it('returns the policies untouched when off', () => {
    expect(applyAutoMode(policies, { enabled: false })).toBe(policies);
  });

  it('runs asks that only change things', () => {
    expect(auto.run_bash_command({ command: 'mkdir x' })).toEqual({
      decision: 'never',
    });
    expect(auto.mcp__drive__list({})).toEqual({ decision: 'never' });
  });

  it('still asks for destructive commands, which the user may confirm', () => {
    expect(auto.run_bash_command({ command: 'rm -rf x' })).toEqual({
      decision: 'ask',
      risk: 'destructive',
      confirmable: true,
    });
    expect(auto.mcp__drive__trash({})).toEqual({
      decision: 'ask',
      risk: 'destructive',
      confirmable: true,
    });
  });

  it.each([
    'create_commit',
    'save_mcp_server',
    'remove_mcp_server',
    'save_instruction',
  ])('still asks for %s', (toolName) => {
    expect(auto[toolName]({})).toEqual({ decision: 'ask' });
  });

  it('still asks for tools the user marked always-ask', () => {
    const wrapped = applyAutoMode(policies, {
      enabled: true,
      alwaysAsk: ['mcp__drive__delete'],
    });

    expect(wrapped.mcp__drive__delete({})).toEqual({ decision: 'ask' });
    expect(wrapped.mcp__drive__list({})).toEqual({ decision: 'never' });
  });

  it('never marks an always-ask tool confirmable, even when destructive', () => {
    const wrapped = applyAutoMode(policies, {
      enabled: true,
      alwaysAsk: ['mcp__drive__trash'],
    });

    expect(wrapped.mcp__drive__trash({})).toEqual({
      decision: 'ask',
      risk: 'destructive',
    });
  });

  it('never relaxes a deny and keeps never', () => {
    expect(auto.blocked({})).toEqual({ decision: 'always-deny', reason: 'no' });
    expect(auto.free({})).toEqual({ decision: 'never' });
  });
});

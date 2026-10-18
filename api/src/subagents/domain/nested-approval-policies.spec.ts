import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import {
  buildNestedApprovalPolicies,
  describeHeldCall,
  heldCallFromVerdict,
  NEEDS_APPROVAL_PREFIX,
} from './nested-approval-policies';

const bashLike: ToolApprovalPolicy = (input) => {
  const command = (input as { command: string }).command;
  if (command.startsWith('rm -rf /')) {
    return { decision: 'always-deny', reason: 'blocked' };
  }
  if (command.startsWith('npm install')) return { decision: 'ask' };
  return { decision: 'never' };
};

describe('buildNestedApprovalPolicies', () => {
  const nested = buildNestedApprovalPolicies({
    run_bash_command: bashLike,
    mcp__github__create_issue: () => ({ decision: 'ask' }),
    mcp__github__get_issue: () => ({ decision: 'never' }),
  });

  it('runs auto-approved calls as before', () => {
    expect(nested.run_bash_command({ command: 'ls' })).toEqual({
      decision: 'never',
    });
    expect(nested.mcp__github__get_issue({})).toEqual({ decision: 'never' });
  });

  it('keeps blocked calls blocked with their reason', () => {
    expect(nested.run_bash_command({ command: 'rm -rf /' })).toEqual({
      decision: 'always-deny',
      reason: 'blocked',
    });
  });

  it('turns ask into a denial that names the bash command', () => {
    const verdict = nested.run_bash_command({ command: 'npm install x' });

    expect(verdict.decision).toBe('always-deny');
    expect(verdict.reason).toContain(`${NEEDS_APPROVAL_PREFIX}npm install x`);
  });

  it('treats MCP ask tools like approval_required commands', () => {
    const verdict = nested.mcp__github__create_issue({ title: 'Bug' });

    expect(verdict.decision).toBe('always-deny');
    expect(verdict.reason).toContain(
      `${NEEDS_APPROVAL_PREFIX}mcp__github__create_issue(Bug)`,
    );
  });
});

describe('heldCallFromVerdict', () => {
  it('returns the held call only for a needs-approval denial', () => {
    const input = { command: 'npm install x' };
    const nested = buildNestedApprovalPolicies({ run_bash_command: bashLike });

    expect(
      heldCallFromVerdict(
        'run_bash_command',
        input,
        nested.run_bash_command(input),
      ),
    ).toBe('npm install x');
    expect(
      heldCallFromVerdict('run_bash_command', input, {
        decision: 'always-deny',
        reason: 'blocked',
      }),
    ).toBeUndefined();
    expect(
      heldCallFromVerdict('run_bash_command', input, { decision: 'never' }),
    ).toBeUndefined();
  });
});

describe('describeHeldCall', () => {
  it('uses the command for bash and tool(input) for anything else', () => {
    expect(describeHeldCall('run_bash_command', { command: 'git push' })).toBe(
      'git push',
    );
    expect(describeHeldCall('edit_file', { name: 'a.ts' })).toBe(
      'edit_file(a.ts)',
    );
  });
});

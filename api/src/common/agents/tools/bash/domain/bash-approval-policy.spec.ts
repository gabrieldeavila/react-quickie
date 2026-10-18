import { createBashApprovalPolicy } from './bash-approval-policy';
import { assessCommand } from './command-policy';

const ROOT = '/workspace/project';
const policy = createBashApprovalPolicy((command) =>
  assessCommand(command, ROOT),
);

describe('createBashApprovalPolicy', () => {
  it('runs read-only workspace commands without asking', () => {
    expect(policy({ command: 'ls -la' })).toEqual({ decision: 'never' });
  });

  it('asks before commands that change files', () => {
    expect(policy({ command: 'rm -rf dist' })).toEqual({ decision: 'ask' });
  });

  it('denies blocked commands with the policy reason', () => {
    const verdict = policy({ command: 'sudo reboot' });

    expect(verdict.decision).toBe('always-deny');
    expect(verdict.reason).toMatch(/não permitido/);
  });

  it('asks when the input has no readable command', () => {
    expect(policy(undefined)).toEqual({ decision: 'ask' });
    expect(policy({ command: 42 })).toEqual({ decision: 'ask' });
  });
});

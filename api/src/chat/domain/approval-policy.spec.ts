import { buildToolApprovalMap, toApprovalStatus } from './approval-policy';

describe('toApprovalStatus', () => {
  it('maps each decision onto the AI SDK status', () => {
    expect(toApprovalStatus({ decision: 'never' })).toBe('not-applicable');
    expect(toApprovalStatus({ decision: 'ask' })).toBe('user-approval');
    expect(
      toApprovalStatus({ decision: 'always-deny', reason: 'blocked' }),
    ).toEqual({ type: 'denied', reason: 'blocked' });
  });
});

describe('buildToolApprovalMap', () => {
  it('wraps every policy under its tool name and passes the input through', () => {
    const seen: unknown[] = [];
    const map = buildToolApprovalMap({
      run_bash_command: (input) => {
        seen.push(input);
        return { decision: 'ask' };
      },
      edit_file: () => ({ decision: 'never' }),
    });

    expect(Object.keys(map)).toEqual(['run_bash_command', 'edit_file']);
    expect(map.run_bash_command({ command: 'ls' })).toBe('user-approval');
    expect(map.edit_file({})).toBe('not-applicable');
    expect(seen).toEqual([{ command: 'ls' }]);
  });

  it('returns an empty map when no tool has a policy', () => {
    expect(buildToolApprovalMap({})).toEqual({});
  });
});

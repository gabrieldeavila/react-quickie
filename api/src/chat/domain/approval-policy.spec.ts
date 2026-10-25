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

  it('asks the intent check first for a confirmable ask', async () => {
    const confirm = jest.fn(() => Promise.resolve('You asked to delete it.'));
    const map = buildToolApprovalMap(
      {
        rm: () => ({ decision: 'ask', risk: 'destructive', confirmable: true }),
      },
      confirm,
    );
    const messages = [{ role: 'user' as const, content: 'delete x' }];

    await expect(map.rm({ path: 'x' }, { messages })).resolves.toEqual({
      type: 'approved',
      reason: 'You asked to delete it.',
    });
    expect(confirm).toHaveBeenCalledWith({
      toolName: 'rm',
      input: { path: 'x' },
      messages,
    });
  });

  it('falls back to the user when the intent check says no', async () => {
    const map = buildToolApprovalMap(
      { rm: () => ({ decision: 'ask', confirmable: true }) },
      () => Promise.resolve(undefined),
    );

    await expect(map.rm({}, { messages: [] })).resolves.toBe('user-approval');
  });

  it('never runs the intent check on a plain ask', () => {
    const confirm = jest.fn(() => Promise.resolve('yes'));
    const map = buildToolApprovalMap(
      { commit: () => ({ decision: 'ask' }) },
      confirm,
    );

    expect(map.commit({}, { messages: [] })).toBe('user-approval');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('returns an empty map when no tool has a policy', () => {
    expect(buildToolApprovalMap({})).toEqual({});
  });
});

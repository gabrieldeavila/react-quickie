import type {
  ApprovalVerdict,
  ToolApprovalPolicy,
} from 'src/chat/domain/approval-policy';
import type { ApprovalRules } from './approval-rule.types';
import { applyApprovalRules } from './apply-approval-rules';

const allowAll: ApprovalRules = {
  global: [{ tool: 'tool_*', createdAt: '' }],
  projects: {},
};

const fixed =
  (verdict: ApprovalVerdict): ToolApprovalPolicy =>
  () =>
    verdict;

describe('applyApprovalRules', () => {
  const policies = {
    tool_ask: fixed({ decision: 'ask' }),
    tool_deny: fixed({ decision: 'always-deny', reason: 'blocked' }),
    tool_never: fixed({ decision: 'never' }),
    other_ask: fixed({ decision: 'ask', reason: 'why' }),
  };
  const wrapped = applyApprovalRules(policies, allowAll, undefined);

  it('turns ask into never when a rule matches', () => {
    expect(wrapped.tool_ask({})).toEqual({ decision: 'never' });
  });

  it('never relaxes a deny', () => {
    expect(wrapped.tool_deny({})).toEqual({
      decision: 'always-deny',
      reason: 'blocked',
    });
  });

  it('keeps never and unmatched asks as they are', () => {
    expect(wrapped.tool_never({})).toEqual({ decision: 'never' });
    expect(wrapped.other_ask({})).toEqual({ decision: 'ask', reason: 'why' });
  });

  it('passes the call input to the inner policy', () => {
    const inner = jest.fn(fixed({ decision: 'never' }));

    applyApprovalRules({ tool_x: inner }, allowAll, undefined).tool_x({
      a: 1,
    });

    expect(inner).toHaveBeenCalledWith({ a: 1 });
  });
});

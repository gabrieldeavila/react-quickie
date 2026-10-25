import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import type { ApprovalRules } from './approval-rule.types';
import { matchApprovalRule } from './match-approval-rule';

/**
 * Turns `ask` into `never` when a user rule allows the call. `never` and
 * `always-deny` pass through unchanged: a rule never relaxes a deny.
 */
export function applyApprovalRules(
  policies: Record<string, ToolApprovalPolicy>,
  rules: ApprovalRules,
  root: string | undefined,
): Record<string, ToolApprovalPolicy> {
  return Object.fromEntries(
    Object.entries(policies).map(([toolName, policy]) => [
      toolName,
      (input: unknown) => {
        const verdict = policy(input);
        if (verdict.decision !== 'ask') return verdict;
        return matchApprovalRule(rules, root, toolName, input)
          ? { decision: 'never' }
          : verdict;
      },
    ]),
  );
}

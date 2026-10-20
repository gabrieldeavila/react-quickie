import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';

/** A commit changes the repository's history, so the user always approves it. */
export function createGitApprovalPolicies(): Record<
  string,
  ToolApprovalPolicy
> {
  return { create_commit: () => ({ decision: 'ask' }) };
}

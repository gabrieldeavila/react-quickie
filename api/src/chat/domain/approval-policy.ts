import type { ToolApprovalStatus } from 'ai';

/**
 * `never`: runs without asking · `ask`: the user approves in the UI ·
 * `always-deny`: refused, and the model gets the reason.
 */
export type ApprovalDecision = 'never' | 'ask' | 'always-deny';

export type ApprovalVerdict = {
  decision: ApprovalDecision;
  reason?: string;
};

/** Decides, per tool call, whether a tool may run. Input is the parsed call input. */
export type ToolApprovalPolicy = (input: unknown) => ApprovalVerdict;

export type ToolApprovalMap = Record<
  string,
  (input: unknown) => ToolApprovalStatus
>;

export function toApprovalStatus(verdict: ApprovalVerdict): ToolApprovalStatus {
  if (verdict.decision === 'ask') return 'user-approval';
  if (verdict.decision === 'always-deny') {
    return { type: 'denied', reason: verdict.reason };
  }
  return 'not-applicable';
}

/**
 * Builds the `streamText({ toolApproval })` map. Every tool that needs a
 * decision (bash, MCP, write-capable subagents) registers a policy here
 * instead of setting the deprecated tool-level `needsApproval`.
 */
export function buildToolApprovalMap(
  policies: Record<string, ToolApprovalPolicy>,
): ToolApprovalMap {
  return Object.fromEntries(
    Object.entries(policies).map(([toolName, policy]) => [
      toolName,
      (input: unknown) => toApprovalStatus(policy(input)),
    ]),
  );
}

import type {
  ApprovalVerdict,
  ToolApprovalPolicy,
} from 'src/chat/domain/approval-policy';
import { summarizeToolInput } from './summarize-tool-input';

export const NEEDS_APPROVAL_PREFIX = 'needs approval: ';

const BASH_TOOL = 'run_bash_command';

/** What the parent needs to re-run a held-back call: the command for bash, else `tool(input)`. */
export function describeHeldCall(toolName: string, input: unknown): string {
  const command = (input as { command?: unknown } | undefined)?.command;
  if (toolName === BASH_TOOL && typeof command === 'string') return command;
  return `${toolName}(${summarizeToolInput(input)})`;
}

/**
 * A nested `streamText` can't pause for the UI, so `ask` becomes "don't run,
 * report back": the call is denied with a reason that names it, and the
 * parent can run it through its own approval flow. `never` and
 * `always-deny` are unchanged.
 */
export function toNestedPolicy(
  toolName: string,
  policy: ToolApprovalPolicy,
): ToolApprovalPolicy {
  return (input): ApprovalVerdict => {
    const verdict = policy(input);
    if (verdict.decision !== 'ask') return verdict;
    return {
      decision: 'always-deny',
      reason: `${NEEDS_APPROVAL_PREFIX}${describeHeldCall(toolName, input)}. The user must approve it; do not retry it, report it in your answer.`,
    };
  };
}

export function buildNestedApprovalPolicies(
  policies: Record<string, ToolApprovalPolicy>,
): Record<string, ToolApprovalPolicy> {
  return Object.fromEntries(
    Object.entries(policies).map(([name, policy]) => [
      name,
      toNestedPolicy(name, policy),
    ]),
  );
}

/** The held-back call a nested verdict refers to, or undefined. */
export function heldCallFromVerdict(
  toolName: string,
  input: unknown,
  verdict: ApprovalVerdict,
): string | undefined {
  if (verdict.decision !== 'always-deny') return undefined;
  if (!verdict.reason?.startsWith(NEEDS_APPROVAL_PREFIX)) return undefined;
  return describeHeldCall(toolName, input);
}

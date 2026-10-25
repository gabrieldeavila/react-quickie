import type { ModelMessage, ToolApprovalStatus } from 'ai';

/**
 * `never`: runs without asking · `ask`: the user approves in the UI ·
 * `always-deny`: refused, and the model gets the reason.
 */
export type ApprovalDecision = 'never' | 'ask' | 'always-deny';

/** On an `ask`: `destructive` still asks in auto mode, `changes` may run unasked. */
export type ApprovalRisk = 'changes' | 'destructive';

export type ApprovalVerdict = {
  decision: ApprovalDecision;
  reason?: string;
  risk?: ApprovalRisk;
  /**
   * On an ask that auto mode kept only for its risk: the user's own request
   * may approve it (see `IntentConfirmer`).
   */
  confirmable?: boolean;
};

/** Decides, per tool call, whether a tool may run. Input is the parsed call input. */
export type ToolApprovalPolicy = (input: unknown) => ApprovalVerdict;

/** The SDK's options for an approval call: the messages that led to it. */
type ApprovalCallOptions = { messages: ModelMessage[] };

export type ToolApprovalMap = Record<
  string,
  (
    input: unknown,
    options?: ApprovalCallOptions,
  ) => ToolApprovalStatus | Promise<ToolApprovalStatus>
>;

export type IntentCall = {
  toolName: string;
  input: unknown;
  messages: ModelMessage[];
};

/** The reason when the user's own request asks for the call; undefined asks the user. */
export type IntentConfirmer = (call: IntentCall) => Promise<string | undefined>;

export function toApprovalStatus(verdict: ApprovalVerdict): ToolApprovalStatus {
  if (verdict.decision === 'ask') return 'user-approval';
  if (verdict.decision === 'always-deny') {
    return { type: 'denied', reason: verdict.reason };
  }
  return 'not-applicable';
}

async function confirmOrAsk(
  confirmIntent: IntentConfirmer,
  call: IntentCall,
): Promise<ToolApprovalStatus> {
  const reason = await confirmIntent(call);
  return reason ? { type: 'approved', reason } : 'user-approval';
}

/**
 * Builds the `streamText({ toolApproval })` map. Every tool that needs a
 * decision (bash, MCP, write-capable subagents) registers a policy here
 * instead of setting the deprecated tool-level `needsApproval`. With
 * `confirmIntent`, a confirmable ask first asks it, then the user.
 */
export function buildToolApprovalMap(
  policies: Record<string, ToolApprovalPolicy>,
  confirmIntent?: IntentConfirmer,
): ToolApprovalMap {
  return Object.fromEntries(
    Object.entries(policies).map(([toolName, policy]) => [
      toolName,
      (input: unknown, options?: ApprovalCallOptions) => {
        const verdict = policy(input);
        if (
          verdict.decision === 'ask' &&
          verdict.confirmable &&
          confirmIntent
        ) {
          return confirmOrAsk(confirmIntent, {
            toolName,
            input,
            messages: options?.messages ?? [],
          });
        }
        return toApprovalStatus(verdict);
      },
    ]),
  );
}

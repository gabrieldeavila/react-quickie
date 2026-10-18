import type { ToolApprovalPolicy } from 'src/chat/domain/approval-policy';
import { heldCallFromVerdict } from './nested-approval-policies';
import type { SubagentEvent } from './subagent-progress';

const MAX_ERROR_LENGTH = 500;

/** The fields Doty reads from a nested `streamText` full-stream part. */
export type StreamPartLike = {
  type: string;
  toolCallId?: string;
  toolName?: string;
  input?: unknown;
  text?: string;
  error?: unknown;
  approved?: boolean;
  toolCall?: { toolCallId?: string };
};

export function describeSubagentError(error: unknown): string {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'unknown error';
  return message.slice(0, MAX_ERROR_LENGTH) || 'unknown error';
}

function heldCall(
  part: StreamPartLike,
  nestedPolicies: Record<string, ToolApprovalPolicy>,
): string | undefined {
  const policy = part.toolName ? nestedPolicies[part.toolName] : undefined;
  if (!policy || !part.toolName) return undefined;
  return heldCallFromVerdict(part.toolName, part.input, policy(part.input));
}

/**
 * Full-stream part → progress event, or undefined for parts the progress
 * ignores. A policy denial arrives as an automatic `tool-approval-response`
 * (`approved: false`). The nested policies are re-evaluated on each tool call
 * to know which calls were held back for approval.
 */
export function toSubagentEvent(
  part: StreamPartLike,
  nestedPolicies: Record<string, ToolApprovalPolicy>,
): SubagentEvent | undefined {
  const toolCallId = part.toolCallId ?? '';
  switch (part.type) {
    case 'start-step':
      return { type: 'step-start' };
    case 'text-delta':
      return part.text ? { type: 'text-delta', text: part.text } : undefined;
    case 'tool-call':
      return {
        type: 'tool-call',
        toolCallId,
        toolName: part.toolName ?? 'tool',
        input: part.input,
        heldCall: heldCall(part, nestedPolicies),
      };
    case 'tool-result':
    case 'tool-error':
    case 'tool-output-denied':
      return { type: part.type, toolCallId };
    case 'tool-approval-response':
      return part.approved === false
        ? {
            type: 'tool-output-denied',
            toolCallId: part.toolCall?.toolCallId ?? toolCallId,
          }
        : undefined;
    case 'abort':
      return { type: 'abort' };
    case 'error':
      return { type: 'fail', error: describeSubagentError(part.error) };
    default:
      return undefined;
  }
}

import type { UIMessage } from 'ai';

type Part = UIMessage['parts'][number];
type ToolLikePart = Part & { state: string; input?: unknown };

export const INTERRUPTED_TOOL_ERROR = 'Tool call interrupted by the user.';
export const UNANSWERED_APPROVAL_ERROR =
  'Approval request was not answered; the user sent a new message instead. The tool did not run.';
export const APPROVED_NOT_RUN_ERROR =
  'Approved by the user, but the turn ended before the tool ran.';

function isToolLikePart(part: Part): part is ToolLikePart {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-');
}

function toOutputError(part: ToolLikePart, errorText: string): Part {
  // `approval` and `output` are dropped on purpose: an errored part may only
  // carry an approved approval, and these calls never ran.
  const closed: Record<string, unknown> = { ...part };
  delete closed.approval;
  delete closed.output;
  return { ...closed, state: 'output-error', errorText } as Part;
}

function closePart(part: Part, isLastMessage: boolean): Part {
  if (!isToolLikePart(part)) return part;

  if (part.state === 'input-streaming' || part.state === 'input-available') {
    return toOutputError(part, INTERRUPTED_TOOL_ERROR);
  }
  // In the last message these states are the approval round-trip in progress.
  if (isLastMessage) return part;

  if (part.state === 'approval-requested') {
    return toOutputError(part, UNANSWERED_APPROVAL_ERROR);
  }
  if (part.state === 'approval-responded') {
    const approved = (part as { approval?: { approved?: boolean } }).approval
      ?.approved;
    return approved
      ? toOutputError(part, APPROVED_NOT_RUN_ERROR)
      : ({ ...part, state: 'output-denied' } as Part);
  }
  return part;
}

/**
 * Tool calls without a result make `convertToModelMessages` throw
 * `MissingToolResultsError`. Calls cut off mid-stream and approvals that were
 * never answered are closed as `output-error` so the model sees what happened.
 */
export function closeDanglingToolCalls(messages: UIMessage[]): UIMessage[] {
  const lastIndex = messages.length - 1;

  return messages.map((message, index) =>
    message.role !== 'assistant'
      ? message
      : {
          ...message,
          parts: message.parts.map((part) =>
            closePart(part, index === lastIndex),
          ),
        },
  );
}
